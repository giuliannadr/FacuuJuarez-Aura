import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'
import { EventForm } from '@/components/features/events/EventForm'

const MOCK_MEMBERS = [
  { id: 'm1', name: 'Facundo', bio: 'DJ y fundador' },
  { id: 'm2', name: 'Valentina', bio: 'Coordinación' },
  { id: 'm3', name: 'Matías', bio: 'Producción' },
]

// Mock — se reemplaza con db.query.events.findFirst({ where: eq(events.id, id) })
const MOCK_EVENT = {
  id: 'e1',
  context: 'aura' as const,
  title: 'Boda García — Dic 2025',
  clientName: 'Romina García',
  clientEmail: 'romina@gmail.com',
  serviceDescription: 'DJ set de 6 horas + iluminación',
  price: '180000',
  currency: 'ARS' as const,
  showPrice: true,
  eventDate: '2025-12-06',
  eventTime: '21:00',
  venue: 'Estancia La Paz, Cañuelas',
  status: 'confirmed' as const,
  shareToken: 'tok_e1_demo',
  memberIds: ['m1', 'm2'],
  memberRoles: { m1: 'DJ Principal', m2: 'Coordinación' },
  notes: 'Rider técnico: 2 parlantes QSC K12.2, mesa Pioneer CDJ-3000.',
}

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!can(session.profile.role, 'canManageEvents')) redirect('/dashboard')

  const { id } = await params

  // TODO: buscar en DB
  const event = id === MOCK_EVENT.id ? MOCK_EVENT : null
  if (!event) notFound()

  const publicUrl = `/event/${event.shareToken}`

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{event.title}</h2>
          <p className="mt-1 text-sm text-zinc-400">Editá los detalles del evento.</p>
        </div>
        <Link
          href={publicUrl}
          target="_blank"
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Ver link del cliente
        </Link>
      </div>

      <EventForm
        role={session.profile.role}
        members={MOCK_MEMBERS}
        eventId={event.id}
        defaultValues={{
          context: event.context,
          title: event.title,
          clientName: event.clientName,
          clientEmail: event.clientEmail,
          serviceDescription: event.serviceDescription ?? undefined,
          price: event.price ?? undefined,
          currency: event.currency,
          showPrice: event.showPrice,
          eventDate: event.eventDate ?? undefined,
          eventTime: event.eventTime ?? undefined,
          venue: event.venue ?? undefined,
          status: event.status,
          memberIds: event.memberIds,
          memberRoles: event.memberRoles,
          notes: event.notes ?? undefined,
        }}
      />
    </div>
  )
}
