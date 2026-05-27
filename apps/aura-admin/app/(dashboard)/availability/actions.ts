'use server'

import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { db, availabilitySlots, scheduleTemplateDays } from '@aura/db'
import {
  addSlotSchema,
  addWeeklySlotsSchema,
  saveScheduleTemplateSchema,
  applyTemplateSchema,
} from '@/lib/schemas/availability'
import { getSession } from '@/lib/supabase'

export type ActionResult = { success: true } | { success: false; error: string }

export async function addAvailabilitySlot(raw: unknown): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }

  const parsed = addSlotSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { date, startTime, endTime, context } = parsed.data

  // Facundo solo puede crear slots "facundo_solo" desde su propio contexto
  if (context === 'facundo_solo' && session.profile.role !== 'facundo') {
    return { success: false, error: 'Sin permiso para este contexto' }
  }

  try {
    await db.insert(availabilitySlots).values({
      memberId: session.profile.id,
      context,
      date,
      startTime,
      endTime,
    })
  } catch {
    return { success: false, error: 'Ya existe un slot para ese horario y fecha' }
  }

  revalidatePath('/availability')
  return { success: true }
}

// ─── addWeeklySlots ───────────────────────────────────────────────────────────
export async function addWeeklySlots(
  raw: unknown
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }

  const parsed = addWeeklySlotsSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { daysOfWeek, timeRanges, dateFrom, dateTo, context } = parsed.data

  if (context === 'facundo_solo' && session.profile.role !== 'facundo') {
    return { success: false, error: 'Sin permiso para este contexto' }
  }

  // Generar todas las fechas del rango que coincidan con los días seleccionados
  const dates: string[] = []
  const cursor = new Date(dateFrom + 'T00:00:00')
  const end = new Date(dateTo + 'T00:00:00')

  // Límite de seguridad: máximo 1 año de rango
  const maxMs = 365 * 24 * 60 * 60 * 1000
  if (end.getTime() - cursor.getTime() > maxMs) {
    return { success: false, error: 'El período no puede superar 1 año' }
  }

  while (cursor <= end) {
    if (daysOfWeek.includes(cursor.getDay())) {
      dates.push(cursor.toISOString().split('T')[0])
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  if (dates.length === 0) {
    return { success: false, error: 'Ningún día del período coincide con los días seleccionados' }
  }

  // Armar todos los slots a insertar
  const slotsToInsert = dates.flatMap((date) =>
    timeRanges.map((range) => ({
      memberId: session.profile.id,
      context,
      date,
      startTime: range.startTime,
      endTime: range.endTime,
    }))
  )

  // Insertar ignorando duplicados (unique constraint: memberId+context+date+startTime)
  const inserted = await db
    .insert(availabilitySlots)
    .values(slotsToInsert)
    .onConflictDoNothing()
    .returning({ id: availabilitySlots.id })

  revalidatePath('/availability')
  return { success: true, count: inserted.length }
}

// ─── saveScheduleTemplate ─────────────────────────────────────────────────────
export async function saveScheduleTemplate(raw: unknown): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }

  const parsed = saveScheduleTemplateSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { context, activeDays } = parsed.data

  if (context === 'facundo_solo' && session.profile.role !== 'facundo') {
    return { success: false, error: 'Sin permiso para este contexto' }
  }

  // Reemplazar todas las filas de este miembro+contexto de una vez
  await db
    .delete(scheduleTemplateDays)
    .where(
      and(
        eq(scheduleTemplateDays.memberId, session.profile.id),
        eq(scheduleTemplateDays.context, context)
      )
    )

  if (activeDays.length > 0) {
    await db.insert(scheduleTemplateDays).values(
      activeDays.map(({ dayOfWeek, timeRanges }) => ({
        memberId: session.profile.id,
        context,
        dayOfWeek,
        timeRanges,
      }))
    )
  }

  revalidatePath('/availability')
  return { success: true }
}

// ─── applyTemplateToRange ─────────────────────────────────────────────────────
export async function applyTemplateToRange(
  raw: unknown
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }

  const parsed = applyTemplateSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { context, weeks } = parsed.data

  const templateRows = await db
    .select()
    .from(scheduleTemplateDays)
    .where(
      and(
        eq(scheduleTemplateDays.memberId, session.profile.id),
        eq(scheduleTemplateDays.context, context)
      )
    )

  if (templateRows.length === 0) {
    return { success: false, error: 'No hay horario base configurado. Guardá el horario primero.' }
  }

  // Rango: hoy → hoy + N semanas
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + weeks * 7)

  const activeDows = new Set(templateRows.map((r) => r.dayOfWeek))
  const dates: string[] = []
  const cursor = new Date(start)

  while (cursor <= end) {
    if (activeDows.has(cursor.getDay())) {
      dates.push(cursor.toISOString().split('T')[0])
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  const slotsToInsert = dates.flatMap((date) => {
    const dow = new Date(date + 'T00:00:00').getDay()
    const row = templateRows.find((r) => r.dayOfWeek === dow)
    if (!row) return []
    return row.timeRanges.map((range) => ({
      memberId: session.profile.id,
      context,
      date,
      startTime: range.startTime,
      endTime: range.endTime,
    }))
  })

  if (slotsToInsert.length === 0) {
    return { success: false, error: 'No se pudieron generar slots con el horario configurado' }
  }

  const inserted = await db
    .insert(availabilitySlots)
    .values(slotsToInsert)
    .onConflictDoNothing()
    .returning({ id: availabilitySlots.id })

  revalidatePath('/availability')
  return { success: true, count: inserted.length }
}

// ─── deleteAvailabilitySlot ───────────────────────────────────────────────────
export async function deleteAvailabilitySlot(slotId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }

  // Solo puede borrar sus propios slots
  await db
    .delete(availabilitySlots)
    .where(
      and(eq(availabilitySlots.id, slotId), eq(availabilitySlots.memberId, session.profile.id))
    )

  revalidatePath('/availability')
  return { success: true }
}
