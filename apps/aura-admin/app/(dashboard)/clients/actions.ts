'use server'

import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { db, contacts, contactEvents, clients, bookings } from '@aura/db'
import type { ContactStatus } from '@aura/db'
import { getSession } from '@/lib/supabase'

export type ActionResult = { success: true } | { success: false; error: string }

// ─── helpers ──────────────────────────────────────────────────────────────────

function assertAdmin(role: string): boolean {
  return role === 'facundo' || role === 'aura_admin'
}

// ─── Crear contacto ───────────────────────────────────────────────────────────

export interface CreateContactInput {
  // Contact personal data
  isPotentialClient?: boolean
  name: string
  email?: string
  phone?: string
  // Quinceañera-specific
  parent1Name?: string
  parent1Phone?: string
  parent1Email?: string
  parent2Name?: string
  parent2Phone?: string
  parent2Email?: string
  birthdayPersonName?: string
  birthdayPersonPhone?: string
  birthdayPersonBirthDate?: string
  notes?: string
  // Event data (for first contactEvent)
  eventType: string
  eventTypeOther?: string
  eventDate?: string
  eventTime?: string
  guestCount?: number
  eventLocation?: string
  djPreference?: string
  organizerName?: string
  organizerPhone?: string
  organizerEmail?: string
  eventNotes?: string
}

export async function createContact(
  input: CreateContactInput
): Promise<ActionResult & { contactId?: string; contactEventId?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  const context = session.profile.role === 'facundo' ? 'facundo_solo' : 'aura'

  // Para quinceañera, si no se provee name explícito usar parent1Name
  const contactName =
    input.name.trim() ||
    input.parent1Name?.trim() ||
    input.birthdayPersonName?.trim() ||
    'Sin nombre'

  const [contact] = await db
    .insert(contacts)
    .values({
      context,
      name: contactName,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      parent1Name: input.parent1Name?.trim() || null,
      parent1Phone: input.parent1Phone?.trim() || null,
      parent1Email: input.parent1Email?.trim() || null,
      parent2Name: input.parent2Name?.trim() || null,
      parent2Phone: input.parent2Phone?.trim() || null,
      parent2Email: input.parent2Email?.trim() || null,
      birthdayPersonName: input.birthdayPersonName?.trim() || null,
      birthdayPersonPhone: input.birthdayPersonPhone?.trim() || null,
      birthdayPersonBirthDate: input.birthdayPersonBirthDate || null,
      notes: input.notes?.trim() || null,
      isPotentialClient: input.isPotentialClient ?? false,
      source: 'manual',
    })
    .returning()

  const [contactEvent] = await db
    .insert(contactEvents)
    .values({
      contactId: contact.id,
      status: 'sin_contacto',
      eventType: input.eventType || null,
      eventTypeOther: input.eventTypeOther?.trim() || null,
      eventDate: input.eventDate || null,
      eventTime: input.eventTime?.trim() || null,
      guestCount: input.guestCount ?? null,
      eventLocation: input.eventLocation?.trim() || null,
      djPreference: input.djPreference?.trim() || null,
      organizerName: input.organizerName?.trim() || null,
      organizerPhone: input.organizerPhone?.trim() || null,
      organizerEmail: input.organizerEmail?.trim() || null,
      notes: input.eventNotes?.trim() || null,
    })
    .returning()

  revalidatePath('/clients')
  return { success: true, contactId: contact.id, contactEventId: contactEvent.id }
}

// ─── Editar contacto ──────────────────────────────────────────────────────────

export interface UpdateContactInput {
  contactId: string
  isPotentialClient?: boolean
  name?: string
  email?: string
  phone?: string
  parent1Name?: string
  parent1Phone?: string
  parent1Email?: string
  parent2Name?: string
  parent2Phone?: string
  parent2Email?: string
  birthdayPersonName?: string
  birthdayPersonPhone?: string
  birthdayPersonBirthDate?: string
  notes?: string
}

export async function updateContact(input: UpdateContactInput): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  const context = session.profile.role === 'facundo' ? 'facundo_solo' : 'aura'

  await db
    .update(contacts)
    .set({
      name: input.name?.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      parent1Name: input.parent1Name?.trim() || null,
      parent1Phone: input.parent1Phone?.trim() || null,
      parent1Email: input.parent1Email?.trim() || null,
      parent2Name: input.parent2Name?.trim() || null,
      parent2Phone: input.parent2Phone?.trim() || null,
      parent2Email: input.parent2Email?.trim() || null,
      birthdayPersonName: input.birthdayPersonName?.trim() || null,
      birthdayPersonPhone: input.birthdayPersonPhone?.trim() || null,
      birthdayPersonBirthDate: input.birthdayPersonBirthDate || null,
      notes: input.notes?.trim() || null,
      ...(input.isPotentialClient !== undefined && { isPotentialClient: input.isPotentialClient }),
      updatedAt: new Date(),
    })
    .where(and(eq(contacts.id, input.contactId), eq(contacts.context, context)))

  revalidatePath('/clients')
  return { success: true }
}

// ─── Actualizar evento del contacto ──────────────────────────────────────────

export interface UpdateContactEventInput {
  contactEventId: string
  eventType?: string
  eventTypeOther?: string
  eventDate?: string
  eventTime?: string
  guestCount?: number | null
  eventLocation?: string
  djPreference?: string
  organizerName?: string
  organizerPhone?: string
  organizerEmail?: string
  notes?: string
}

export async function updateContactEvent(input: UpdateContactEventInput): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  await db
    .update(contactEvents)
    .set({
      eventType: input.eventType || null,
      eventTypeOther: input.eventTypeOther?.trim() || null,
      eventDate: input.eventDate || null,
      eventTime: input.eventTime?.trim() || null,
      guestCount: input.guestCount ?? null,
      eventLocation: input.eventLocation?.trim() || null,
      djPreference: input.djPreference?.trim() || null,
      organizerName: input.organizerName?.trim() || null,
      organizerPhone: input.organizerPhone?.trim() || null,
      organizerEmail: input.organizerEmail?.trim() || null,
      notes: input.notes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(contactEvents.id, input.contactEventId))

  revalidatePath('/clients')
  return { success: true }
}

// ─── Cambiar estado del contactEvent ─────────────────────────────────────────

export async function updateContactEventStatus(
  contactEventId: string,
  status: ContactStatus
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  await db
    .update(contactEvents)
    .set({ status, updatedAt: new Date() })
    .where(eq(contactEvents.id, contactEventId))

  revalidatePath('/clients')
  return { success: true }
}

// ─── Eliminar contacto ────────────────────────────────────────────────────────

export async function deleteContact(contactId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  const context = session.profile.role === 'facundo' ? 'facundo_solo' : 'aura'

  await db.delete(contacts).where(and(eq(contacts.id, contactId), eq(contacts.context, context)))

  revalidatePath('/clients')
  return { success: true }
}

// ─── Enviar link de reserva al contacto ──────────────────────────────────────

export type SendLinkResult =
  | { success: true; emailSent: boolean; link: string }
  | { success: false; error: string }

export async function sendBookingLinkToContact(contactId: string): Promise<SendLinkResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  const context = session.profile.role === 'facundo' ? 'facundo_solo' : 'aura'

  const [contact] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.context, context)))
    .limit(1)

  if (!contact) return { success: false, error: 'Contacto no encontrado' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const link = context === 'facundo_solo' ? `${appUrl}/book/facuu` : `${appUrl}/book`

  if (!contact.email) {
    return { success: true, emailSent: false, link }
  }

  let emailSent = false
  try {
    const { Resend } = await import('resend')
    const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
    if (resendClient) {
      const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
      await resendClient.emails.send({
        from: FROM,
        to: contact.email,
        subject: 'Reservá tu reunión — AURA',
        html: buildBookingLinkEmail(contact.name, link, context),
      })
      emailSent = true
    }
  } catch (err) {
    console.error('[sendBookingLinkToContact] email error:', err)
  }

  return { success: true, emailSent, link }
}

function buildBookingLinkEmail(name: string, link: string, context: string): string {
  const VIOLET = '#7c3aed'
  const VIOLET_DARK = '#5b21b6'
  const VIOLET_LIGHT = '#f5f3ff'
  const VIOLET_BORDER = '#ddd6fe'
  const TEXT_DARK = '#18181b'
  const TEXT_MID = '#52525b'
  const TEXT_LIGHT = '#a1a1aa'
  const BG_PAGE = '#f4f4f5'
  const BG_CARD = '#ffffff'
  const BG_FOOTER = '#fafafa'
  const BORDER = '#e4e4e7'
  const isAura = context === 'aura'

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:${BG_PAGE}">
  <div style="display:none;max-height:0;overflow:hidden">Ya podés reservar tu reunión con ${isAura ? 'AURA' : 'Facundo'}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_PAGE}">
    <tr><td align="center" style="padding:40px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
        <tr>
          <td style="background:linear-gradient(135deg,${VIOLET_DARK} 0%,${VIOLET} 100%);border-radius:16px 16px 0 0;padding:32px 40px">
            <div style="display:inline-block;background:rgba(255,255,255,.15);border-radius:10px;padding:8px 14px;margin-bottom:16px">
              <span style="font-size:15px;font-weight:800;letter-spacing:3px;color:#ffffff;font-family:Georgia,serif">${isAura ? 'AURA' : 'FACUNDO'}</span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:${BG_CARD};padding:40px 40px 32px">
            <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:${TEXT_DARK};font-family:system-ui,-apple-system,sans-serif">Hola, ${name} 👋</p>
            <p style="margin:0 0 20px;font-size:15px;color:${TEXT_MID};line-height:1.7;font-family:system-ui,-apple-system,sans-serif">
              Queremos coordinar una reunión con vos para contarte todo sobre nuestros servicios y responder tus consultas.
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:${TEXT_MID};line-height:1.7;font-family:system-ui,-apple-system,sans-serif">
              Hacé click en el botón para ver los horarios disponibles y elegir el que mejor te quede.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px">
              <tr>
                <td style="border-radius:10px;background:linear-gradient(135deg,${VIOLET_DARK} 0%,${VIOLET} 100%)">
                  <a href="${link}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:system-ui,-apple-system,sans-serif">
                    Reservar reunión &rarr;
                  </a>
                </td>
              </tr>
            </table>
            <div style="height:1px;background:${BORDER};margin:24px 0"></div>
            <p style="margin:0;font-size:12px;color:${TEXT_LIGHT};text-align:center;font-family:system-ui,-apple-system,sans-serif;word-break:break-all">
              ¿El botón no funciona? Copiá este link:<br/>
              <span style="color:${VIOLET}">${link}</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:${BG_FOOTER};border-top:1px solid ${BORDER};border-radius:0 0 16px 16px;padding:20px 40px;text-align:center">
            <p style="margin:0;font-size:12px;color:${TEXT_LIGHT};font-family:system-ui,-apple-system,sans-serif">
              <strong style="color:${TEXT_MID}">${isAura ? 'AURA' : 'Facundo'}</strong> · Agencia de DJs · Buenos Aires, Argentina
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Auto-crear contacto desde booking confirmado ─────────────────────────────
// Llamado desde respondToBooking cuando la reserva queda confirmed

export async function autoCreateContactFromBooking(
  bookingId: string,
  clientId: string,
  context: 'aura' | 'facundo_solo'
): Promise<void> {
  // Verificar que no existe ya un contacto vinculado a este clientId
  const [existing] = await db
    .select({ id: contacts.id })
    .from(contacts)
    .where(eq(contacts.clientId, clientId))
    .limit(1)

  if (existing) {
    // Ya existe → actualizar estado del contactEvent más reciente a 'reunion_1_reservada'
    const [latestEvent] = await db
      .select({ id: contactEvents.id })
      .from(contactEvents)
      .where(eq(contactEvents.contactId, existing.id))
      .limit(1)

    if (latestEvent) {
      await db
        .update(contactEvents)
        .set({ status: 'reunion_1_reservada', linkedBookingId: bookingId, updatedAt: new Date() })
        .where(eq(contactEvents.id, latestEvent.id))
    }
    return
  }

  // Obtener datos del cliente
  const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1)

  if (!client) return

  // Crear contacto
  const [contact] = await db
    .insert(contacts)
    .values({
      context,
      name: client.name,
      email: client.email,
      phone: client.phone ?? null,
      source: 'booking',
      clientId: client.id,
    })
    .returning()

  // Crear contactEvent con estado 'reunion_1_reservada'
  await db.insert(contactEvents).values({
    contactId: contact.id,
    status: 'reunion_1_reservada',
    eventType: client.eventType,
    eventTypeOther: client.eventTypeOther ?? null,
    eventDate: client.eventDate ?? null,
    eventTime: client.eventTime ?? null,
    guestCount: client.guestCount ?? null,
    eventLocation: client.eventLocation ?? null,
    djPreference: client.djPreference ?? null,
    linkedBookingId: bookingId,
  })
}
