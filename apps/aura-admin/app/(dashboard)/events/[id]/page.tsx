import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { eq } from 'drizzle-orm'
import { db, events, eventMembers, profiles } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'
import { EventForm } from '@/components/features/events/EventForm'

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!can(session.profile.role, 'canManageEvents')) redirect('/dashboard')

  const { id } = await params

  // ── Obtener evento ──────────────────────────────────────────────────────────
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1)

  if (!event) notFound()

  // ── Miembros asignados a este evento ───────────────────────────────────────
  const assignedMembers = await db
    .select({
      memberId: eventMembers.memberId,
      memberRole: eventMembers.memberRole,
    })
    .from(eventMembers)
    .where(eq(eventMembers.eventId, id))

  const memberIds = assignedMembers.map((m) => m.memberId)
  const memberRoles = Object.fromEntries(
    assignedMembers.map((m) => [m.memberId, m.memberRole ?? ''])
  )

  // ── Todos los perfiles disponibles para el selector ───────────────────────
  const allMembers = await db
    .select({ id: profiles.id, name: profiles.name, bio: profiles.bio })
    .from(profiles)

  const publicUrl = `/event/${event.shareToken}`

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{event.title}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Editá los detalles del evento.
          </p>
        </div>
        <Link
          href={publicUrl}
          target="_blank"
          className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-white/10 px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 transition-colors hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Ver link del cliente
        </Link>
      </div>

      <EventForm
        role={session.profile.role}
        members={allMembers}
        eventId={event.id}
        defaultValues={{
          context: event.context,
          title: event.title,
          clientName: event.clientName,
          clientEmail: event.clientEmail,
          serviceDescription: event.serviceDescription ?? undefined,
          price: event.price ?? undefined,
          currency: (event.currency as 'ARS' | 'USD') ?? 'ARS',
          showPrice: event.showPrice,
          eventDate: event.eventDate ?? undefined,
          eventTime: event.eventTime ? event.eventTime.substring(0, 5) : undefined,
          venue: event.venue ?? undefined,
          status: event.status,
          memberIds,
          memberRoles,
          notes: event.notes ?? undefined,
        }}
      />
    </div>
  )
}
