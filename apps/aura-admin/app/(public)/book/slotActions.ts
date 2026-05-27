'use server'

/**
 * Server actions para el sistema de locking de slots.
 * Usados por BookingFlow (cliente) para reservar temporalmente un horario.
 */

import { and, eq, lt, or } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { headers } from 'next/headers'
import { db, slotLocks, bookings, bookingParticipants } from '@aura/db'
import { buildAvailableSlots, type AvailableSlotData } from '@/lib/slotUtils'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

// ─── tryLockSlot ──────────────────────────────────────────────────────────────

/**
 * Intenta adquirir un lock de 5 min sobre el slot indicado.
 *
 * Flujo dentro de una transacción:
 *  1. Elimina locks expirados para ese slot (limpieza lazy)
 *  2. Verifica que no haya una reserva activa (pending/confirmed)
 *  3. Inserta el lock (falla por UNIQUE si ya hay un lock activo → otro cliente llegó primero)
 *
 * @returns { success: true, lockToken } o { success: false }
 */
export async function tryLockSlot(
  coordinatorId: string,
  context: 'aura' | 'facundo_solo',
  date: string,
  startTime: string // HH:MM
): Promise<{ success: true; lockToken: string } | { success: false }> {
  // Rate limit: máx 15 intentos de lock por IP por minuto
  const ip = getClientIp(await headers())
  if (!checkRateLimit(`lock:${ip}`, 15, 60_000)) {
    return { success: false }
  }

  const lockToken = randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + 5 * 60_000) // 5 minutos

  try {
    await db.transaction(async (tx) => {
      // 1. Eliminar locks expirados para este slot
      await tx
        .delete(slotLocks)
        .where(
          and(
            eq(slotLocks.coordinatorId, coordinatorId),
            eq(slotLocks.date, date),
            eq(slotLocks.startTime, startTime),
            lt(slotLocks.expiresAt, new Date())
          )
        )

      // 2. Verificar que no exista ya una reserva activa en ese horario
      const activeBookings = await tx
        .selectDistinct({ id: bookings.id })
        .from(bookings)
        .innerJoin(bookingParticipants, eq(bookingParticipants.bookingId, bookings.id))
        .where(
          and(
            eq(bookings.date, date),
            eq(bookings.startTime, startTime),
            eq(bookingParticipants.memberId, coordinatorId),
            or(eq(bookings.status, 'pending'), eq(bookings.status, 'confirmed'))
          )
        )

      if (activeBookings.length > 0) {
        throw Object.assign(new Error('already_booked'), { code: 'already_booked' })
      }

      // 3. Insertar lock (constraint UNIQUE rechaza si hay otro lock activo)
      await tx.insert(slotLocks).values({
        coordinatorId,
        context,
        date,
        startTime,
        lockToken,
        expiresAt,
      })
    })

    return { success: true, lockToken }
  } catch {
    return { success: false }
  }
}

// ─── releaseLock ──────────────────────────────────────────────────────────────

/**
 * Libera un lock por su token.
 * Se llama cuando el usuario hace "Atrás", cierra la pestaña (best-effort)
 * o cuando el countdown expira.
 */
export async function releaseLock(lockToken: string): Promise<void> {
  await db.delete(slotLocks).where(eq(slotLocks.lockToken, lockToken))
}

// ─── getAvailableSlots ────────────────────────────────────────────────────────

/**
 * Devuelve los slots disponibles actualizados (sin locks activos ni reservas).
 * Se llama client-side cuando un tryLockSlot falla, para refrescar la lista.
 */
export async function getAvailableSlots(
  coordinatorId: string,
  context: 'aura' | 'facundo_solo'
): Promise<AvailableSlotData[]> {
  return buildAvailableSlots(coordinatorId, context)
}
