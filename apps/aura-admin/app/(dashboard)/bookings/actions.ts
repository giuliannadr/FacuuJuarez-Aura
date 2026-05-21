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

  // TODO: reemplazar con Drizzle cuando esté la DB
  // const [booking] = await db.insert(bookings).values({
  //   context: data.context,
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
  // await db.update(bookingParticipants)
  //   .set({ status: response, respondedAt: new Date().toISOString() })
  //   .where(and(
  //     eq(bookingParticipants.bookingId, bookingId),
  //     eq(bookingParticipants.memberId, session.profile.id)
  //   ))
  //
  // Recalcular status global del booking:
  // Si todos aceptaron → confirmed
  // Si alguno rechazó → rejected
  // Si hay pendientes → sigue en pending

  console.log('[respondToBooking] mock update:', {
    bookingId,
    response,
    memberId: session.profile.id,
  })

  revalidatePath('/bookings')
  return { success: true }
}
