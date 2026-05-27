import { eq, and, gte, or, inArray } from 'drizzle-orm'
import {
  db,
  profiles,
  availabilitySlots,
  bookings,
  bookingParticipants,
  clients,
  secondBookingTokens,
} from '@aura/db'
import { SLOT_DURATION, SLOT_GAP, toMin, fromMin, overlaps } from '@/lib/slotUtils'
import { SecondBookingFlow } from './SecondBookingFlow'

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ token: string }>
}

export default async function SecondBookingPage({ params }: Props) {
  const { token } = await params

  // Validar el token
  const [tokenRecord] = await db
    .select()
    .from(secondBookingTokens)
    .where(eq(secondBookingTokens.token, token))
    .limit(1)

  if (!tokenRecord) {
    return <ErrorScreen message="Este link no es válido. Pedile un nuevo link al equipo de AURA." />
  }

  if (tokenRecord.usedAt || tokenRecord.secondBookingId) {
    return (
      <ErrorScreen message="Ya usaste este link para agendar tu reunión. Si necesitás hacer un cambio, contactanos." />
    )
  }

  // Obtener cliente
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, tokenRecord.clientId))
    .limit(1)

  if (!client) {
    return <ErrorScreen message="No encontramos tu información. Contactanos para ayudarte." />
  }

  const djIds = tokenRecord.selectedDjIds as string[]

  // Obtener perfiles de los DJs
  const djProfiles = await db
    .select({ id: profiles.id, name: profiles.name })
    .from(profiles)
    .where(inArray(profiles.id, djIds))

  const djNames = djProfiles.map((p) => p.name)

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const nowMin = now.getHours() * 60 + now.getMinutes()

  // Ventanas de disponibilidad de los DJs (context='aura')
  const windows = await db
    .select({
      memberId: availabilitySlots.memberId,
      date: availabilitySlots.date,
      startTime: availabilitySlots.startTime,
      endTime: availabilitySlots.endTime,
    })
    .from(availabilitySlots)
    .where(
      and(
        eq(availabilitySlots.context, 'aura'),
        inArray(availabilitySlots.memberId, djIds),
        gte(availabilitySlots.date, today)
      )
    )

  // Reservas existentes para los DJs
  const rawBookings = await db
    .select({
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      memberId: bookingParticipants.memberId,
    })
    .from(bookings)
    .innerJoin(bookingParticipants, eq(bookingParticipants.bookingId, bookings.id))
    .where(
      and(
        gte(bookings.date, today),
        inArray(bookingParticipants.memberId, djIds),
        or(eq(bookings.status, 'pending'), eq(bookings.status, 'confirmed'))
      )
    )

  const booked = rawBookings.map((b) => ({
    memberId: b.memberId,
    date: b.date,
    startTime: b.startTime.substring(0, 5),
    endTime: b.endTime.substring(0, 5),
  }))

  // Generar slots donde TODOS los DJs están disponibles
  const slotSet = new Map<string, Set<string>>() // date|start|end → Set<memberId>

  for (const w of windows) {
    const winStart = toMin(w.startTime.substring(0, 5))
    const winEnd = toMin(w.endTime.substring(0, 5))
    let cursor = winStart

    while (cursor + SLOT_DURATION <= winEnd) {
      const slotStart = fromMin(cursor)
      const slotEnd = fromMin(cursor + SLOT_DURATION)

      if (w.date === today && cursor < nowMin) {
        cursor += SLOT_DURATION + SLOT_GAP
        continue
      }

      const isBlocked = booked.some(
        (b) =>
          b.memberId === w.memberId &&
          b.date === w.date &&
          overlaps(slotStart, slotEnd, b.startTime, b.endTime)
      )

      if (!isBlocked) {
        const key = `${w.date}|${slotStart}|${slotEnd}`
        if (!slotSet.has(key)) slotSet.set(key, new Set())
        slotSet.get(key)!.add(w.memberId)
      }

      cursor += SLOT_DURATION + SLOT_GAP
    }
  }

  // Solo incluir slots donde todos los DJs están disponibles
  const availableSlots: { memberId: string; date: string; startTime: string; endTime: string }[] =
    []

  for (const [key, memberSet] of slotSet.entries()) {
    if (djIds.every((id) => memberSet.has(id))) {
      const [date, startTime, endTime] = key.split('|')
      for (const djId of djIds) {
        availableSlots.push({ memberId: djId, date, startTime, endTime })
      }
    }
  }

  const eventTypeLabel: Record<string, string> = {
    fiesta_15: 'Fiesta de XV',
    fiesta_18: 'Fiesta de 18',
    cumpleanos: 'Cumpleaños',
    corporativo: 'Evento corporativo',
    casamiento: 'Casamiento',
    otro: client.eventTypeOther ?? 'Evento especial',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          ¡Hola, {client.name}! 👋
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Ya tuvimos nuestra primera reunión. Ahora elegí fecha y horario para reunirte con los DJs
          de tu {eventTypeLabel[client.eventType] ?? 'evento'}.
        </p>

        {/* DJs asignados */}
        <div className="mt-4 flex flex-wrap gap-2">
          {djNames.map((name) => (
            <span
              key={name}
              className="rounded-full border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-400"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <SecondBookingFlow
        token={token}
        clientName={client.name}
        djNames={djNames}
        availableSlots={availableSlots}
      />
    </div>
  )
}

// ─── Error screen ─────────────────────────────────────────────────────────────

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
        <span className="text-2xl">⚠️</span>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Link inválido</h2>
        <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  )
}
