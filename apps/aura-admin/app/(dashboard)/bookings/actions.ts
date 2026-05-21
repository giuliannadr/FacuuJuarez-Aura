'use server'

import { revalidatePath } from 'next/cache'
import { createBookingSchema, type CreateBookingInput } from '@/lib/schemas/booking'
import { getSession } from '@/lib/supabase'

export type ActionResult = { success: true } | { success: false; error: string }

export async function createBooking(raw: unknown): Promise<ActionResult> {
  const parsed = createBookingSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const data: CreateBookingInput = parsed.data

  // ─── Prevención de doble reserva ─────────────────────────────────────────
  // TODO: reemplazar con Drizzle cuando esté la DB:
  //
  // import { db } from '@/../../packages/db/client'
  // import { bookings, bookingParticipants, availabilitySlots } from '@/../../packages/db/schema'
  // import { eq, inArray, and, or } from 'drizzle-orm'
  //
  // 1. Verificar que no haya una reserva existente (pending o confirmed) en el
  //    mismo slot para alguno de los participantes seleccionados:
  //
  // const conflicts = await db
  //   .selectDistinct({ bookingId: bookingParticipants.bookingId })
  //   .from(bookingParticipants)
  //   .innerJoin(bookings, eq(bookings.id, bookingParticipants.bookingId))
  //   .where(
  //     and(
  //       eq(bookings.date, data.date),
  //       eq(bookings.startTime, data.startTime),
  //       inArray(bookingParticipants.memberId, data.memberIds),
  //       or(eq(bookings.status, 'pending'), eq(bookings.status, 'confirmed'))
  //     )
  //   )
  //
  // if (conflicts.length > 0) {
  //   return {
  //     success: false,
  //     error: 'Este horario ya no está disponible. Por favor seleccioná otro.',
  //   }
  // }
  //
  // 2. Insertar la reserva
  // const [booking] = await db.insert(bookings).values({
  //   context: data.context,
  //   meetingType: data.meetingType,
  //   clientName: data.clientName,
  //   clientEmail: data.clientEmail,
  //   subject: data.subject,
  //   message: data.message,
  //   date: data.date,
  //   startTime: data.startTime,
  //   endTime: data.endTime,
  //   status: 'pending',
  // }).returning()
  //
  // await db.insert(bookingParticipants).values(
  //   data.memberIds.map((memberId) => ({ bookingId: booking.id, memberId, status: 'pending' }))
  // )
  //
  // 3. Marcar los slots como ocupados para prevenir nueva selección en el UI
  //    (doble prevención: DB constraint + UI filter)
  // await db
  //   .update(availabilitySlots)
  //   .set({ isBooked: true })
  //   .where(
  //     and(
  //       eq(availabilitySlots.date, data.date),
  //       eq(availabilitySlots.startTime, data.startTime),
  //       inArray(availabilitySlots.memberId, data.memberIds)
  //     )
  //   )
  //
  // await sendBookingNotificationEmail(booking, data.memberIds)

  console.log('[createBooking] mock insert:', data)

  return { success: true }
}

export async function respondToBooking(
  bookingId: string,
  response: 'accepted' | 'rejected'
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }

  // TODO: reemplazar con Drizzle cuando esté la DB
  //
  // await db.update(bookingParticipants)
  //   .set({ status: response, respondedAt: new Date().toISOString() })
  //   .where(and(
  //     eq(bookingParticipants.bookingId, bookingId),
  //     eq(bookingParticipants.memberId, session.profile.id)
  //   ))
  //
  // Recalcular status global del booking:
  // const participants = await db.select().from(bookingParticipants)
  //   .where(eq(bookingParticipants.bookingId, bookingId))
  //
  // const allAccepted = participants.every(p => p.status === 'accepted')
  // const anyRejected = participants.some(p => p.status === 'rejected')
  //
  // const newStatus = allAccepted ? 'confirmed' : anyRejected ? 'rejected' : 'pending'
  //
  // await db.update(bookings)
  //   .set({ status: newStatus })
  //   .where(eq(bookings.id, bookingId))
  //
  // Si se rechazó → liberar los slots (isBooked = false) para que otros puedan reservar
  // if (anyRejected) {
  //   const booking = await db.select().from(bookings).where(eq(bookings.id, bookingId)).get()
  //   const memberIds = participants.map(p => p.memberId)
  //   await db.update(availabilitySlots)
  //     .set({ isBooked: false })
  //     .where(and(
  //       eq(availabilitySlots.date, booking.date),
  //       eq(availabilitySlots.startTime, booking.startTime),
  //       inArray(availabilitySlots.memberId, memberIds)
  //     ))
  // }

  console.log('[respondToBooking] mock update:', {
    bookingId,
    response,
    memberId: session.profile.id,
  })

  revalidatePath('/bookings')
  return { success: true }
}
