import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, ExternalLink, CalendarDays, MapPin } from 'lucide-react'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'
import { EVENT_STATUSES, type EventStatus } from '@/lib/schemas/event'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Mock — se reemplaza con queries Drizzle
const MOCK_EVENTS = [
  {
    id: 'e1',
    context: 'aura' as const,
    title: 'Boda García — Dic 2025',
    clientName: 'Romina García',
    clientEmail: 'romina@gmail.com',
    serviceDescription: 'DJ set de 6 horas + iluminación',
    price: '180000',
    currency: 'ARS',
    showPrice: true,
    eventDate: '2025-12-06',
    eventTime: '21:00',
    venue: 'Estancia La Paz, Cañuelas',
    status: 'confirmed' as EventStatus,
    shareToken: 'tok_e1_demo',
    members: [
      { name: 'Facundo', role: 'DJ Principal' },
      { name: 'Valentina', role: 'Coordinación' },
    ],
  },
  {
    id: 'e2',
    context: 'facundo_solo' as const,
    title: 'Cumpleaños VIP — Nov 2025',
    clientName: 'Lucas Pérez',
    clientEmail: 'lucas@email.com',
    serviceDescription: 'DJ set de 4 horas',
    price: '80000',
    currency: 'ARS',
    showPrice: false,
    eventDate: '2025-11-15',
    eventTime: '20:00',
    venue: 'Palermo Social Club',
    status: 'draft' as EventStatus,
    shareToken: 'tok_e2_demo',
    members: [{ name: 'Facundo', role: 'DJ' }],
  },
  {
    id: 'e3',
    context: 'aura' as const,
    title: 'Evento Corporativo TechCo',
    clientName: 'TechCo Argentina',
    clientEmail: 'eventos@techco.com',
    serviceDescription: 'DJ set + producción audiovisual',
    price: '350000',
    currency: 'ARS',
    showPrice: false,
    eventDate: '2025-10-22',
    eventTime: '18:00',
    venue: 'Hilton Buenos Aires',
    status: 'completed' as EventStatus,
    shareToken: 'tok_e3_demo',
    members: [
      { name: 'Facundo', role: 'DJ' },
      { name: 'Matías', role: 'Producción' },
    ],
  },
]

const STATUS_MAP = Object.fromEntries(EVENT_STATUSES.map((s) => [s.value, s]))

const CONTEXT_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'aura', label: 'AURA' },
  { key: 'facundo_solo', label: 'Personal' },
] as const

interface EventsPageProps {
  searchParams: Promise<{ context?: string }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!can(session.profile.role, 'canManageEvents')) redirect('/dashboard')

  const { context } = await searchParams
  const activeContext = context ?? 'all'
  const { profile } = session

  const events =
    profile.role === 'facundo' ? MOCK_EVENTS : MOCK_EVENTS.filter((e) => e.context === 'aura')

  const filtered =
    activeContext === 'all' ? events : events.filter((e) => e.context === activeContext)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Eventos</h2>
          <p className="mt-1 text-sm text-zinc-400">Gestioná los eventos cerrados con clientes.</p>
        </div>
        <Link
          href="/events/new"
          className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo evento
        </Link>
      </div>

      {/* Tabs de contexto — solo Facundo */}
      {profile.role === 'facundo' && (
        <div className="flex gap-1 rounded-lg border border-white/5 bg-white/[0.02] p-1 w-fit">
          {CONTEXT_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.key === 'all' ? '/events' : `/events?context=${tab.key}`}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                activeContext === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-sm text-zinc-600">No hay eventos aún</p>
          </div>
        ) : (
          filtered.map((event) => {
            const statusConf = STATUS_MAP[event.status]
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-start gap-5 rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-white truncate">{event.title}</h3>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        statusConf.bg,
                        statusConf.color
                      )}
                    >
                      {statusConf.label}
                    </span>
                    {profile.role === 'facundo' && (
                      <Badge
                        variant="outline"
                        className="border-white/10 text-zinc-600 text-[10px]"
                      >
                        {event.context === 'aura' ? 'AURA' : 'Personal'}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 truncate">
                    {event.clientName} · {event.clientEmail}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
                    {event.eventDate && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(parseISO(event.eventDate), "d 'de' MMM yyyy", { locale: es })}
                        {event.eventTime && ` · ${event.eventTime}`}
                      </span>
                    )}
                    {event.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.venue}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {event.members.map((m) => (
                      <span
                        key={m.name}
                        className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400"
                      >
                        {m.name} — {m.role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {event.showPrice && event.price && (
                    <p className="text-sm font-semibold text-white">
                      {event.currency} {Number(event.price).toLocaleString('es-AR')}
                    </p>
                  )}
                  <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                    <ExternalLink className="h-3 w-3" />
                    Link público
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
