import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, ExternalLink, CalendarDays, MapPin } from 'lucide-react'
import { eq, inArray, desc } from 'drizzle-orm'
import { db, events, eventMembers, profiles } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'
import { EVENT_STATUSES, type EventStatus } from '@/lib/schemas/event'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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

  // ── Obtener eventos ────────────────────────────────────────────────────────
  const rawEvents = await db
    .select()
    .from(events)
    .where(profile.role === 'facundo' ? undefined : eq(events.context, 'aura'))
    .orderBy(desc(events.createdAt))

  // ── Obtener miembros de cada evento ────────────────────────────────────────
  const allMembers =
    rawEvents.length > 0
      ? await db
          .select({
            eventId: eventMembers.eventId,
            name: profiles.name,
            role: eventMembers.memberRole,
          })
          .from(eventMembers)
          .innerJoin(profiles, eq(profiles.id, eventMembers.memberId))
          .where(
            inArray(
              eventMembers.eventId,
              rawEvents.map((e) => e.id)
            )
          )
      : []

  // ── Construir lista con miembros ───────────────────────────────────────────
  const eventsDisplay = rawEvents.map((e) => ({
    ...e,
    members: allMembers
      .filter((m) => m.eventId === e.id)
      .map((m) => ({ name: m.name, role: m.role })),
  }))

  const filtered =
    activeContext === 'all'
      ? eventsDisplay
      : eventsDisplay.filter((e) => e.context === activeContext)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Eventos</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Gestioná los eventos cerrados con clientes.
          </p>
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
        <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] p-1 w-fit">
          {CONTEXT_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.key === 'all' ? '/events' : `/events?context=${tab.key}`}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                activeContext === tab.key
                  ? 'bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
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
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-white/10">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">No hay eventos aún</p>
          </div>
        ) : (
          filtered.map((event) => {
            const statusConf = STATUS_MAP[event.status]
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-start gap-5 rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-5 transition-colors hover:border-zinc-200 dark:hover:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/[0.04]"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-zinc-900 dark:text-white truncate">
                      {event.title}
                    </h3>
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
                        className="border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-600 text-[10px]"
                      >
                        {event.context === 'aura' ? 'AURA' : 'Personal'}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    {event.clientName} · {event.clientEmail}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400 dark:text-zinc-600">
                    {event.eventDate && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(parseISO(event.eventDate), "d 'de' MMM yyyy", { locale: es })}
                        {event.eventTime && ` · ${event.eventTime.substring(0, 5)}`}
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
                        className="rounded-full bg-zinc-100 dark:bg-white/5 px-2 py-0.5 text-[10px] text-zinc-500 dark:text-zinc-400"
                      >
                        {m.name}
                        {m.role ? ` — ${m.role}` : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {event.showPrice && event.price && (
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {event.currency} {Number(event.price).toLocaleString('es-AR')}
                    </p>
                  )}
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-600">
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
