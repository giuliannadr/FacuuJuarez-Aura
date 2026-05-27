import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, MapPin, Music2, CheckCircle2 } from 'lucide-react'
import { eq } from 'drizzle-orm'
import { db, events, eventMembers, eventComments, profiles } from '@aura/db'
import { EVENT_STATUSES, type EventStatus } from '@/lib/schemas/event'
import { cn } from '@/lib/utils'
import { ClientPortal, type EventCommentData } from './ClientPortal'

const STATUS_MAP = Object.fromEntries(EVENT_STATUSES.map((s) => [s.value, s]))
const STATUS_STEPS: EventStatus[] = ['confirmed', 'in_progress', 'completed']

interface EventPublicPageProps {
  params: Promise<{ token: string }>
}

export default async function EventPublicPage({ params }: EventPublicPageProps) {
  const { token } = await params

  // ── Obtener evento por shareToken ──────────────────────────────────────────
  const [event] = await db.select().from(events).where(eq(events.shareToken, token)).limit(1)

  if (!event) notFound()

  // ── Miembros del evento ────────────────────────────────────────────────────
  const members = await db
    .select({
      name: profiles.name,
      role: eventMembers.memberRole,
      bio: profiles.bio,
    })
    .from(eventMembers)
    .innerJoin(profiles, eq(profiles.id, eventMembers.memberId))
    .where(eq(eventMembers.eventId, event.id))

  // ── Comentarios ────────────────────────────────────────────────────────────
  const rawComments = await db
    .select()
    .from(eventComments)
    .where(eq(eventComments.eventId, event.id))
    .orderBy(eventComments.createdAt)

  const initialComments: EventCommentData[] = rawComments.map((c) => ({
    id: c.id,
    authorName: c.authorName,
    authorEmail: c.authorEmail,
    body: c.body,
    isFromTeam: c.isFromTeam,
    createdAt: c.createdAt.toISOString(),
  }))

  const statusConf = STATUS_MAP[event.status]
  const agencyName = event.context === 'aura' ? 'AURA Agency' : 'Facundo DJ'
  const currentStep = STATUS_STEPS.indexOf(event.status as EventStatus)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
            <Music2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">{agencyName}</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-10">
        {/* Hero del evento */}
        <div className="space-y-3">
          <span
            className={cn(
              'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
              statusConf.bg,
              statusConf.color
            )}
          >
            {statusConf.label}
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{event.title}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Hola <span className="text-zinc-900 dark:text-white">{event.clientName}</span>, este es
            el detalle de tu evento. Podés consultarlo en cualquier momento desde este link.
          </p>
        </div>

        {/* Timeline de estado */}
        {event.status !== 'draft' && event.status !== 'cancelled' && (
          <div className="rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Estado del evento
            </p>
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => {
                const conf = STATUS_MAP[step]
                const done = i <= currentStep
                const active = i === currentStep
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full border transition-colors',
                          done
                            ? 'border-violet-500 bg-violet-500'
                            : 'border-zinc-200 dark:border-white/10'
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-zinc-200 dark:bg-white/10" />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-medium text-center',
                          active
                            ? 'text-zinc-900 dark:text-white'
                            : done
                              ? 'text-zinc-500 dark:text-zinc-400'
                              : 'text-zinc-300 dark:text-zinc-700'
                        )}
                      >
                        {conf.label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={cn(
                          'mx-2 mb-4 h-[1px] flex-1',
                          i < currentStep ? 'bg-violet-500' : 'bg-zinc-200 dark:bg-white/5'
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Detalles */}
        <div className="rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.02] divide-y divide-zinc-100 dark:divide-white/5">
          {event.eventDate && (
            <div className="flex items-start gap-3 p-5">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Fecha y hora</p>
                <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white capitalize">
                  {format(parseISO(event.eventDate), "EEEE d 'de' MMMM yyyy", { locale: es })}
                  {event.eventTime && ` · ${event.eventTime.substring(0, 5)} hs`}
                </p>
              </div>
            </div>
          )}

          {event.venue && (
            <div className="flex items-start gap-3 p-5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Lugar</p>
                <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">
                  {event.venue}
                </p>
              </div>
            </div>
          )}

          {event.serviceDescription && (
            <div className="p-5">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Servicio contratado</p>
              <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {event.serviceDescription}
              </p>
            </div>
          )}

          {event.showPrice && event.price && (
            <div className="p-5">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Inversión</p>
              <p className="mt-0.5 text-xl font-bold text-zinc-900 dark:text-white">
                {event.currency} {Number(event.price).toLocaleString('es-AR')}
              </p>
            </div>
          )}
        </div>

        {/* Equipo */}
        {members.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Tu equipo
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {members.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-4 rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-sm font-bold text-violet-600 dark:text-violet-400">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {member.name}
                    </p>
                    {member.role && (
                      <p className="text-xs text-violet-600 dark:text-violet-400">{member.role}</p>
                    )}
                    {member.bio && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">{member.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portal de cliente */}
        <ClientPortal
          eventId={event.id}
          clientEmail={event.clientEmail}
          initialComments={initialComments}
        />

        <p className="text-center text-xs text-zinc-300 dark:text-zinc-700">
          {agencyName} · Powered by AURA Admin
        </p>
      </main>
    </div>
  )
}
