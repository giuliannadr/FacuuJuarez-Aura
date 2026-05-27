'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db, events, eventMembers } from '@aura/db'
import { eventFormSchema, type EventFormInput } from '@/lib/schemas/event'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'
import { randomUUID } from 'crypto'

export type ActionResult<T = void> = { success: true; data?: T } | { success: false; error: string }

export async function createEvent(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!can(session.profile.role, 'canManageEvents')) {
    return { success: false, error: 'Sin permisos para crear eventos' }
  }

  const parsed = eventFormSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const data: EventFormInput = parsed.data

  // aura_admin solo puede crear eventos de contexto "aura"
  if (session.profile.role === 'aura_admin' && data.context === 'facundo_solo') {
    return { success: false, error: 'Sin permisos para este contexto' }
  }

  const shareToken = randomUUID()

  const [event] = await db
    .insert(events)
    .values({
      context: data.context,
      title: data.title,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      serviceDescription: data.serviceDescription,
      price: data.price,
      currency: data.currency,
      showPrice: data.showPrice,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      venue: data.venue,
      status: data.status,
      notes: data.notes,
      shareToken,
      createdBy: session.profile.id,
    })
    .returning()

  if (data.memberIds.length > 0) {
    await db.insert(eventMembers).values(
      data.memberIds.map((memberId) => ({
        eventId: event.id,
        memberId,
        memberRole: data.memberRoles?.[memberId],
      }))
    )
  }

  revalidatePath('/events')
  return { success: true, data: { id: event.id } }
}

export async function updateEvent(id: string, raw: unknown): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!can(session.profile.role, 'canManageEvents')) {
    return { success: false, error: 'Sin permisos' }
  }

  const parsed = eventFormSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const data: EventFormInput = parsed.data

  await db
    .update(events)
    .set({
      context: data.context,
      title: data.title,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      serviceDescription: data.serviceDescription,
      price: data.price,
      currency: data.currency,
      showPrice: data.showPrice,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      venue: data.venue,
      status: data.status,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))

  // Reemplazar miembros: borrar todos e insertar los nuevos
  await db.delete(eventMembers).where(eq(eventMembers.eventId, id))

  if (data.memberIds.length > 0) {
    await db.insert(eventMembers).values(
      data.memberIds.map((memberId) => ({
        eventId: id,
        memberId,
        memberRole: data.memberRoles?.[memberId],
      }))
    )
  }

  revalidatePath('/events')
  revalidatePath(`/events/${id}`)
  return { success: true }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!can(session.profile.role, 'canManageEvents')) {
    return { success: false, error: 'Sin permisos' }
  }

  // El cascade elimina eventMembers y eventComments automáticamente
  await db.delete(events).where(eq(events.id, id))

  revalidatePath('/events')
  return { success: true }
}
