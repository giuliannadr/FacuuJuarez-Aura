/**
 * Utilidad compartida de generación de slots disponibles.
 * Usada por /book/page.tsx, /facuu/page.tsx y el server action getAvailableSlots.
 *
 * ⚠️  buildAvailableSlots solo ejecutar en el servidor (usa Drizzle).
 *     generateSlots es pura y testeable sin DB.
 */

import { eq, and, gte, or, gt } from 'drizzle-orm'
import { db, availabilitySlots, bookings, bookingParticipants, slotLocks } from '@aura/db'

// ─── Constantes ───────────────────────────────────────────────────────────────

export const SLOT_DURATION = 45 // minutos
export const SLOT_GAP = 10 // minutos de descanso entre slots

// ─── Helpers — exportados para testing ────────────────────────────────────────

export function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function fromMin(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

export function overlaps(s1: string, e1: string, s2: string, e2: string): boolean {
  return toMin(s1) < toMin(e2) && toMin(e1) > toMin(s2)
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AvailableSlotData {
  memberId: string
  date: string
  startTime: string // HH:MM
  endTime: string // HH:MM
}

export interface SlotWindow {
  date: string // YYYY-MM-DD
  startTime: string // HH:MM o HH:MM:SS
  endTime: string // HH:MM o HH:MM:SS
}

export interface BookedSlot {
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
}

// ─── Lógica pura de generación — TESTEABLE sin DB ─────────────────────────────

/**
 * Genera los slots disponibles de 45 min a partir de ventanas de disponibilidad,
 * reservas existentes y locks activos.
 *
 * Es una función pura: no toca la DB ni tiene side effects.
 * Se puede testear directamente pasando los datos como parámetros.
 *
 * @param coordinatorId UUID del coordinador (se incluye en los resultados)
 * @param windows       Ventanas de disponibilidad (deduplicadas por el caller)
 * @param booked        Reservas existentes — de CUALQUIER contexto donde el coordinador participe
 * @param locked        Set de "YYYY-MM-DD|HH:MM" con slots temporalmente bloqueados
 * @param today         Fecha de hoy en ART (YYYY-MM-DD) — para filtrar slots pasados
 * @param nowMin        Minutos del día actuales en ART — para filtrar slots de hoy ya pasados
 */
export function generateSlots(
  coordinatorId: string,
  windows: SlotWindow[],
  booked: BookedSlot[],
  locked: Set<string>,
  today: string,
  nowMin: number
): AvailableSlotData[] {
  const result: AvailableSlotData[] = []

  for (const w of windows) {
    const winStart = toMin(w.startTime.substring(0, 5))
    const winEnd = toMin(w.endTime.substring(0, 5))
    let cursor = winStart

    while (cursor + SLOT_DURATION <= winEnd) {
      const slotStart = fromMin(cursor)
      const slotEnd = fromMin(cursor + SLOT_DURATION)

      // Saltar slots pasados de hoy
      if (w.date === today && cursor < nowMin) {
        cursor += SLOT_DURATION + SLOT_GAP
        continue
      }

      // Saltar si overlapa con una reserva existente (cualquier contexto)
      const isBooked = booked.some(
        (b) => b.date === w.date && overlaps(slotStart, slotEnd, b.startTime, b.endTime)
      )

      // Saltar si hay un lock activo en ese slot exacto
      const isLocked = locked.has(`${w.date}|${slotStart}`)

      if (!isBooked && !isLocked) {
        result.push({
          memberId: coordinatorId,
          date: w.date,
          startTime: slotStart,
          endTime: slotEnd,
        })
      }

      cursor += SLOT_DURATION + SLOT_GAP
    }
  }

  return result
}

// ─── buildAvailableSlots — orquesta DB + generateSlots ────────────────────────

/**
 * Genera los slots disponibles de 45 min para un coordinador dado.
 *
 * Filtra:
 * 1. Slots ya pasados (hoy, usando hora ART = UTC-3)
 * 2. Slots bloqueados por una reserva pending/confirmed (cualquier contexto)
 * 3. Slots bloqueados por un slot_lock activo (no expirado)
 *
 * @param coordinatorId       UUID del coordinador (Facuu o AURA admin)
 * @param availabilityContext 'facundo_solo' para /facuu, 'aura' para /book
 */
export async function buildAvailableSlots(
  coordinatorId: string,
  availabilityContext: 'aura' | 'facundo_solo'
): Promise<AvailableSlotData[]> {
  // ── Hora actual en ART (UTC-3, sin DST) ────────────────────────────────────
  const nowUTC = new Date()
  const artNow = new Date(nowUTC.getTime() - 3 * 60 * 60 * 1000)
  const today = artNow.toISOString().split('T')[0]
  const nowMin = artNow.getUTCHours() * 60 + artNow.getUTCMinutes()

  // ── Ventanas de disponibilidad (sin filtro de contexto) ────────────────────
  const rawWindows = await db
    .select({
      date: availabilitySlots.date,
      startTime: availabilitySlots.startTime,
      endTime: availabilitySlots.endTime,
    })
    .from(availabilitySlots)
    .where(and(eq(availabilitySlots.memberId, coordinatorId), gte(availabilitySlots.date, today)))

  // Deduplicar por (date, startTime) — el mismo horario puede existir en varios contextos
  const seenWindows = new Set<string>()
  const windows = rawWindows.filter((w) => {
    const key = `${w.date}|${w.startTime}`
    if (seenWindows.has(key)) return false
    seenWindows.add(key)
    return true
  })

  // ── Reservas existentes del coordinador — TODOS los contextos ──────────────
  // Regla clave: si Facuu tiene una 2ª reunión AURA a las 15:00, ese horario
  // se bloquea también en /facuu para sus clientes personales, y viceversa.
  const rawBookings = await db
    .select({
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
    })
    .from(bookings)
    .innerJoin(bookingParticipants, eq(bookingParticipants.bookingId, bookings.id))
    .where(
      and(
        gte(bookings.date, today),
        eq(bookingParticipants.memberId, coordinatorId),
        or(eq(bookings.status, 'pending'), eq(bookings.status, 'confirmed'))
      )
    )

  const booked: BookedSlot[] = rawBookings.map((b) => ({
    date: b.date,
    startTime: b.startTime.substring(0, 5),
    endTime: b.endTime.substring(0, 5),
  }))

  // ── Locks activos (no expirados, sin filtro de contexto) ───────────────────
  const activeLocks = await db
    .select({
      date: slotLocks.date,
      startTime: slotLocks.startTime,
    })
    .from(slotLocks)
    .where(and(eq(slotLocks.coordinatorId, coordinatorId), gt(slotLocks.expiresAt, nowUTC)))

  const locked = new Set(activeLocks.map((l) => `${l.date}|${l.startTime.substring(0, 5)}`))

  return generateSlots(coordinatorId, windows, booked, locked, today, nowMin)
}
