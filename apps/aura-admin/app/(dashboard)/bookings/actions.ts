'use server'

import { revalidatePath } from 'next/cache'
import { eq, inArray, and, or } from 'drizzle-orm'
import { headers } from 'next/headers'
import {
  db,
  bookings,
  bookingParticipants,
  availabilitySlots,
  profiles,
  clients,
  secondBookingTokens,
  slotLocks,
} from '@aura/db'
import {
  createClientBookingSchema,
  createSecondBookingTokenSchema,
  createSecondBookingSchema,
  eventTypeLabel,
  type CreateClientBookingInput,
  type CreateSecondBookingTokenInput,
  type CreateSecondBookingInput,
} from '@/lib/schemas/booking'
import { getSession } from '@/lib/supabase'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import {
  sendBookingRequestEmail,
  sendBookingConfirmedEmail,
  sendBookingRejectedEmail,
  sendSecondBookingLinkEmail,
} from '@/lib/email'

export type ActionResult = { success: true } | { success: false; error: string }
export type SecondTokenResult = { success: true; link: string } | { success: false; error: string }

// ─── Crear primera reserva (formulario público /book y /facuu) ────────────────

/**
 * Crea una reserva de primera reunión.
 *
 * La detección de conflictos y la inserción ocurren dentro de una transacción
 * para evitar race conditions. Si se recibe un lockToken, se elimina el lock
 * al finalizar (ya no es necesario).
 *
 * @param raw        Datos del formulario (validados con createClientBookingSchema)
 * @param lockToken  Token del slot lock adquirido en el step 0 (opcional)
 */
export async function createClientBooking(raw: unknown, lockToken?: string): Promise<ActionResult> {
  // Rate limit: máx 5 reservas por IP cada 10 minutos
  const ip = getClientIp(await headers())
  if (!checkRateLimit(`booking:${ip}`, 5, 10 * 60_000)) {
    return {
      success: false,
      error: 'Demasiados intentos. Esperá unos minutos y volvé a intentarlo.',
    }
  }

  const parsed = createClientBookingSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const data: CreateClientBookingInput = parsed.data

  const subject =
    data.eventType === 'otro'
      ? (data.eventTypeOther ?? 'Otro evento')
      : eventTypeLabel(data.eventType)

  // ── Transacción atómica: conflict check + insert ──────────────────────────
  let bookingId: string
  let clientId: string

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Verificar que no exista una reserva activa en el mismo horario
      const conflicts = await tx
        .selectDistinct({ bookingId: bookingParticipants.bookingId })
        .from(bookingParticipants)
        .innerJoin(bookings, eq(bookings.id, bookingParticipants.bookingId))
        .where(
          and(
            eq(bookings.date, data.date),
            eq(bookings.startTime, data.startTime),
            eq(bookingParticipants.memberId, data.coordinatorId),
            or(eq(bookings.status, 'pending'), eq(bookings.status, 'confirmed'))
          )
        )

      if (conflicts.length > 0) {
        throw Object.assign(
          new Error('Este horario ya no está disponible. Por favor seleccioná otro.'),
          { code: 'conflict' }
        )
      }

      // 2. Crear registro del cliente
      const [newClient] = await tx
        .insert(clients)
        .values({
          name: data.clientName,
          email: data.clientEmail,
          phone: data.clientPhone ?? null,
          eventType: data.eventType,
          eventTypeOther: data.eventTypeOther ?? null,
          eventDate: data.eventDate ?? null,
          eventTime: data.eventTime ?? null,
          guestCount: data.guestCount ?? null,
          eventLocation: data.eventLocation ?? null,
          djPreference: data.djPreference ?? null,
          message: data.message ?? null,
        })
        .returning()

      // 3. Insertar reserva
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          context: data.context,
          meetingType: 'meeting',
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          subject,
          message: data.message ?? null,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          status: 'pending',
          clientId: newClient.id,
          meetingRound: 1,
        })
        .returning()

      // 4. Asignar coordinador como participante
      await tx.insert(bookingParticipants).values({
        bookingId: newBooking.id,
        memberId: data.coordinatorId,
        status: 'pending',
      })

      // 5. Liberar el lock (si existe) dentro de la misma transacción
      if (lockToken) {
        await tx.delete(slotLocks).where(eq(slotLocks.lockToken, lockToken))
      }

      return { bookingId: newBooking.id, clientId: newClient.id }
    })

    bookingId = result.bookingId
    clientId = result.clientId
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : 'Error al crear la reserva. Intentá nuevamente.'
    return { success: false, error: msg }
  }

  // ── Operaciones no críticas (fuera de la transacción) ────────────────────

  // Marcar slot de disponibilidad como ocupado
  await db
    .update(availabilitySlots)
    .set({ isBooked: true })
    .where(
      and(
        eq(availabilitySlots.date, data.date),
        eq(availabilitySlots.startTime, data.startTime),
        eq(availabilitySlots.memberId, data.coordinatorId),
        eq(availabilitySlots.context, data.context)
      )
    )

  // Email de confirmación al cliente
  const [coordinator] = await db
    .select({ name: profiles.name })
    .from(profiles)
    .where(eq(profiles.id, data.coordinatorId))

  void sendBookingRequestEmail({
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    date: data.date,
    startTime: data.startTime.substring(0, 5),
    endTime: data.endTime.substring(0, 5),
    memberNames: coordinator ? [coordinator.name] : [],
  })

  return { success: true }
}

// ─── Responder a una reserva (aceptar / rechazar) ─────────────────────────────

export async function respondToBooking(
  bookingId: string,
  response: 'accepted' | 'rejected'
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }

  await db
    .update(bookingParticipants)
    .set({ status: response, respondedAt: new Date() })
    .where(
      and(
        eq(bookingParticipants.bookingId, bookingId),
        eq(bookingParticipants.memberId, session.profile.id)
      )
    )

  const participants = await db
    .select()
    .from(bookingParticipants)
    .where(eq(bookingParticipants.bookingId, bookingId))

  const allAccepted = participants.every((p) => p.status === 'accepted')
  const anyRejected = participants.some((p) => p.status === 'rejected')
  const newStatus = allAccepted ? 'confirmed' : anyRejected ? 'rejected' : 'pending'

  await db.update(bookings).set({ status: newStatus }).where(eq(bookings.id, bookingId))

  if (allAccepted || anyRejected) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId))

    if (booking) {
      const memberIds = participants.map((p) => p.memberId)
      const memberProfiles = await db
        .select({ name: profiles.name })
        .from(profiles)
        .where(inArray(profiles.id, memberIds))

      const emailData = {
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        date: booking.date,
        startTime: booking.startTime.substring(0, 5),
        endTime: booking.endTime.substring(0, 5),
        memberNames: memberProfiles.map((p) => p.name),
      }

      if (allAccepted) {
        void sendBookingConfirmedEmail(emailData)
      } else {
        await db
          .update(availabilitySlots)
          .set({ isBooked: false })
          .where(
            and(
              eq(availabilitySlots.date, booking.date),
              eq(availabilitySlots.startTime, booking.startTime),
              inArray(availabilitySlots.memberId, memberIds)
            )
          )
        void sendBookingRejectedEmail(emailData)
      }
    }
  }

  revalidatePath('/bookings')
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Generar token de segunda reserva ────────────────────────────────────────

export async function createSecondBookingToken(raw: unknown): Promise<SecondTokenResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }

  // Solo coordinadores pueden generar links de segunda reunión
  if (!session.profile.isCoordinator) {
    return { success: false, error: 'Sin permisos para esta acción' }
  }

  const parsed = createSecondBookingTokenSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const data: CreateSecondBookingTokenInput = parsed.data

  // Verificar que la primera reserva está confirmada
  const [firstBooking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, data.firstBookingId), eq(bookings.status, 'confirmed')))

  if (!firstBooking) {
    return { success: false, error: 'La primera reserva no está confirmada' }
  }

  // Si ya existe un token, devolver el link existente
  const [existing] = await db
    .select()
    .from(secondBookingTokens)
    .where(eq(secondBookingTokens.firstBookingId, data.firstBookingId))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (existing) {
    return { success: true, link: `${appUrl}/book/segunda/${existing.token}` }
  }

  // Obtener info del cliente
  const [client] = await db.select().from(clients).where(eq(clients.id, data.clientId))

  if (!client) return { success: false, error: 'Cliente no encontrado' }

  // Crear token
  const token = crypto.randomUUID()

  await db.insert(secondBookingTokens).values({
    token,
    clientId: data.clientId,
    firstBookingId: data.firstBookingId,
    selectedDjIds: data.selectedDjIds,
  })

  // Obtener nombres de los DJs
  const djProfiles = await db
    .select({ name: profiles.name })
    .from(profiles)
    .where(inArray(profiles.id, data.selectedDjIds))

  const link = `${appUrl}/book/segunda/${token}`

  void sendSecondBookingLinkEmail({
    clientName: client.name,
    clientEmail: client.email,
    djNames: djProfiles.map((p) => p.name),
    link,
  })

  revalidatePath('/bookings')
  revalidatePath('/dashboard')
  return { success: true, link }
}

// ─── Crear segunda reserva (desde el link del cliente) ───────────────────────

export async function createSecondBooking(raw: unknown): Promise<ActionResult> {
  const parsed = createSecondBookingSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const data: CreateSecondBookingInput = parsed.data

  // Verificar el token
  const [tokenRecord] = await db
    .select()
    .from(secondBookingTokens)
    .where(eq(secondBookingTokens.token, data.token))

  if (!tokenRecord) return { success: false, error: 'Link inválido' }
  if (tokenRecord.usedAt || tokenRecord.secondBookingId) {
    return { success: false, error: 'Este link ya fue utilizado' }
  }

  const [client] = await db.select().from(clients).where(eq(clients.id, tokenRecord.clientId))

  if (!client) return { success: false, error: 'Cliente no encontrado' }

  const djIds = tokenRecord.selectedDjIds as string[]

  // Verificar conflictos
  const conflicts = await db
    .selectDistinct({ bookingId: bookingParticipants.bookingId })
    .from(bookingParticipants)
    .innerJoin(bookings, eq(bookings.id, bookingParticipants.bookingId))
    .where(
      and(
        eq(bookings.date, data.date),
        eq(bookings.startTime, data.startTime),
        inArray(bookingParticipants.memberId, djIds),
        or(eq(bookings.status, 'pending'), eq(bookings.status, 'confirmed'))
      )
    )

  if (conflicts.length > 0) {
    return {
      success: false,
      error: 'Este horario ya no está disponible. Por favor seleccioná otro.',
    }
  }

  const subject =
    client.eventType === 'otro'
      ? (client.eventTypeOther ?? 'Otro evento')
      : eventTypeLabel(client.eventType)

  const [booking] = await db
    .insert(bookings)
    .values({
      context: 'aura',
      meetingType: 'meeting',
      clientName: client.name,
      clientEmail: client.email,
      subject,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'pending',
      clientId: client.id,
      meetingRound: 2,
    })
    .returning()

  await db.insert(bookingParticipants).values(
    djIds.map((djId) => ({
      bookingId: booking.id,
      memberId: djId,
      status: 'pending' as const,
    }))
  )

  // Marcar slots como ocupados
  await db
    .update(availabilitySlots)
    .set({ isBooked: true })
    .where(
      and(
        eq(availabilitySlots.date, data.date),
        eq(availabilitySlots.startTime, data.startTime),
        inArray(availabilitySlots.memberId, djIds)
      )
    )

  // Marcar el token como usado
  await db
    .update(secondBookingTokens)
    .set({ secondBookingId: booking.id, usedAt: new Date() })
    .where(eq(secondBookingTokens.token, data.token))

  // Email de confirmación
  const djProfiles = await db
    .select({ name: profiles.name })
    .from(profiles)
    .where(inArray(profiles.id, djIds))

  void sendBookingRequestEmail({
    clientName: client.name,
    clientEmail: client.email,
    date: data.date,
    startTime: data.startTime.substring(0, 5),
    endTime: data.endTime.substring(0, 5),
    memberNames: djProfiles.map((p) => p.name),
  })

  return { success: true }
}
