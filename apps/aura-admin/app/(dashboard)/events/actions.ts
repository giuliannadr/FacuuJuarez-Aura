'use server'

import { revalidatePath } from 'next/cache'
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

  // TODO: reemplazar con Drizzle cuando esté la DB
  // const [event] = await db.insert(events).values({
  //   context: data.context,
  //   title: data.title,
  //   clientName: data.clientName,
  //   clientEmail: data.clientEmail,
  //   serviceDescription: data.serviceDescription,
  //   price: data.price,
  //   currency: data.currency,
  //   showPrice: data.showPrice,
  //   eventDate: data.eventDate,
  //   eventTime: data.eventTime,
  //   venue: data.venue,
  //   status: data.status,
  //   notes: data.notes,
  //   shareToken,
  //   createdBy: session.profile.id,
  // }).returning()
  //
  // await db.insert(eventMembers).values(
  //   data.memberIds.map((memberId) => ({
  //     eventId: event.id,
  //     memberId,
  //     memberRole: data.memberRoles?.[memberId],
  //   }))
  // )

  const mockId = randomUUID()
  console.log('[createEvent] mock insert:', { ...data, shareToken, id: mockId })

  revalidatePath('/events')
  return { success: true, data: { id: mockId } }
}

export async function updateEvent(id: string, raw: unknown): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!can(session.profile.role, 'canManageEvents')) {
    return { success: false, error: 'Sin permisos' }
  }

  const parsed = eventFormSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  // TODO: Drizzle update
  console.log('[updateEvent] mock update:', { id, ...parsed.data })

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

  // TODO: Drizzle delete
  console.log('[deleteEvent] mock delete:', id)

  revalidatePath('/events')
  return { success: true }
}
