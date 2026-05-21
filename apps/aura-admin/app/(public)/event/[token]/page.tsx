import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, MapPin, Music2, CheckCircle2 } from 'lucide-react'
import { EVENT_STATUSES, type EventStatus } from '@/lib/schemas/event'
import { cn } from '@/lib/utils'

// Mock — se reemplaza con:
// db.query.events.findFirst({ where: eq(events.shareToken, token), with: { members: true } })
const MOCK_EVENTS: Record<
  string,
  {
    title: string
    context: 'aura' | 'facundo_solo'
    clientName: string
    serviceDescription: string | null
    price: string | null
    currency: string
    showPrice: boolean
    eventDate: string | null
    eventTime: string | null
    venue: string | null
    status: EventStatus
    members: { name: string; role: string | null; bio: string | null }[]
  }
> = {
  tok_e1_demo: {
    title: 'Boda García',
    context: 'aura',
    clientName: 'Romina García',
    serviceDescription:
      'DJ set de 6 horas + iluminación personalizada. Incluye setup, prueba de sonido y rider técnico completo.',
    price: '180000',
    currency: 'ARS',
    showPrice: true,
    eventDate: '2025-12-06',
    eventTime: '21:00',
    venue: 'Estancia La Paz, Cañuelas',
    status: 'confirmed',
    members: [
      { name: 'Facundo', role: 'DJ Principal', bio: 'Más de 10 años de experiencia en eventos' },
      { name: 'Valentina', role: 'Coordinación', bio: 'Producción y logística del evento' },
    ],
  },
}

const STATUS_MAP = Object.fromEntries(EVENT_STATUSES.map((s) => [s.value, s]))

const STATUS_STEPS: EventStatus[] = ['confirmed', 'in_progress', 'completed']

interface EventPublicPageProps {
  params: Promise<{ token: string }>
}

export default async function EventPublicPage({ params }: EventPublicPageProps) {
  const { token } = await params
  const event = MOCK_EVENTS[token]
  if (!event) notFound()

  const statusConf = STATUS_MAP[event.status]
  const agencyName = event.context === 'aura' ? 'AURA Agency' : 'Facundo DJ'

  const currentStep = STATUS_STEPS.indexOf(event.status as EventStatus)

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
            <Music2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">{agencyName}</span>
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
          <h1 className="text-2xl font-bold text-white">{event.title}</h1>
          <p className="text-sm text-zinc-400">
            Hola <span className="text-white">{event.clientName}</span>, este es el detalle de tu
            evento. Podés consultarlo en cualquier momento desde este link.
          </p>
        </div>

        {/* Timeline de estado */}
        {event.status !== 'draft' && event.status !== 'cancelled' && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
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
                          done ? 'border-violet-500 bg-violet-500' : 'border-white/10'
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-white/10" />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-medium text-center',
                          active ? 'text-white' : done ? 'text-zinc-400' : 'text-zinc-700'
                        )}
                      >
                        {conf.label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={cn(
                          'mx-2 mb-4 h-[1px] flex-1',
                          i < currentStep ? 'bg-violet-500' : 'bg-white/5'
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
        <div className="rounded-xl border border-white/5 bg-white/[0.02] divide-y divide-white/5">
          {event.eventDate && (
            <div className="flex items-start gap-3 p-5">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Fecha y hora</p>
                <p className="mt-0.5 text-sm font-medium text-white capitalize">
                  {format(parseISO(event.eventDate), "EEEE d 'de' MMMM yyyy", { locale: es })}
                  {event.eventTime && ` · ${event.eventTime} hs`}
                </p>
              </div>
            </div>
          )}

          {event.venue && (
            <div className="flex items-start gap-3 p-5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <div>
                <p className="text-xs text-zinc-500">Lugar</p>
                <p className="mt-0.5 text-sm font-medium text-white">{event.venue}</p>
              </div>
            </div>
          )}

          {event.serviceDescription && (
            <div className="p-5">
              <p className="text-xs text-zinc-500">Servicio contratado</p>
              <p className="mt-1.5 text-sm text-zinc-300 leading-relaxed">
                {event.serviceDescription}
              </p>
            </div>
          )}

          {event.showPrice && event.price && (
            <div className="p-5">
              <p className="text-xs text-zinc-500">Inversión</p>
              <p className="mt-0.5 text-xl font-bold text-white">
                {event.currency} {Number(event.price).toLocaleString('es-AR')}
              </p>
            </div>
          )}
        </div>

        {/* Equipo */}
        {event.members.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Tu equipo
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {event.members.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-sm font-bold text-violet-400">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    {member.role && <p className="text-xs text-violet-400">{member.role}</p>}
                    {member.bio && <p className="text-xs text-zinc-500">{member.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-zinc-700">{agencyName} · Powered by AURA Admin</p>
      </main>
    </div>
  )
}
