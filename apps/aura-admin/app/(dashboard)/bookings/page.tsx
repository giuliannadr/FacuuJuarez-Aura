import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, Sparkles, Clock } from 'lucide-react'
import { CopyBookingLinkButton } from '@/components/layout/CopyBookingLinkButton'
import { eq, inArray, desc, and, isNull, isNotNull } from 'drizzle-orm'
import { db, bookings, bookingParticipants, profiles, secondBookingTokens, clients } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { BookingCard, type BookingDisplay } from '@/components/features/bookings/BookingCard'
import { EnableSecondBookingDialog } from '@/components/features/bookings/EnableSecondBookingDialog'
import {
  PendingSecondTokens,
  type PendingSecondToken,
} from '@/components/features/bookings/PendingSecondTokens'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'rejected', label: 'Rechazadas' },
] as const

type TabKey = (typeof TABS)[number]['key']

interface BookingsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { profile } = session
  const { status } = await searchParams
  const activeTab: TabKey = (status as TabKey) ?? 'pending'

  const canSeeSecondBookingSection =
    profile.role === 'facundo' || profile.role === 'aura_admin' || profile.isCoordinator

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  // ── Sección prioritaria: primeras reuniones confirmadas sin segunda reserva ──
  let priorityBookings: {
    id: string
    clientName: string
    clientId: string | null
    subject: string
    date: string
    startTime: string
    endTime: string
    context: 'aura' | 'facundo_solo'
  }[] = []

  if (canSeeSecondBookingSection) {
    // aura_admin/coordinadores solo ven reservas de AURA; facundo ve todos los contextos
    const bookingCtxFilter = profile.role !== 'facundo' ? eq(bookings.context, 'aura') : undefined

    const raw = await db
      .select({
        id: bookings.id,
        clientName: bookings.clientName,
        clientId: bookings.clientId,
        subject: bookings.subject,
        date: bookings.date,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        context: bookings.context,
      })
      .from(bookings)
      .leftJoin(secondBookingTokens, eq(secondBookingTokens.firstBookingId, bookings.id))
      .where(
        and(
          eq(bookings.meetingRound, 1),
          eq(bookings.status, 'confirmed'),
          isNull(secondBookingTokens.id),
          isNotNull(bookings.clientId),
          bookingCtxFilter
        )
      )
      .orderBy(desc(bookings.createdAt))

    // Solo mostrar reservas cuya reunión ya terminó, dentro de los últimos 30 días
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    priorityBookings = raw.filter((b) => {
      const [y, mo, d] = b.date.split('-').map(Number)
      const time = b.startTime.substring(0, 5)
      const [h, min] = time.split(':').map(Number)
      // UTC = ART + 3 h → fin de reunión en UTC = h + 3 h + 45 min
      const meetingEndUTC = Date.UTC(y, mo - 1, d, h + 3, min + 45)
      return now > meetingEndUTC && meetingEndUTC > thirtyDaysAgo
    })
  }

  // ── Links enviados aún no usados por el cliente ─────────────────────────────
  let pendingSecondTokens: PendingSecondToken[] = []

  if (canSeeSecondBookingSection) {
    const bookingCtxFilter = profile.role !== 'facundo' ? eq(bookings.context, 'aura') : undefined

    const rawTokens = await db
      .select({
        id: secondBookingTokens.id,
        token: secondBookingTokens.token,
        selectedDjIds: secondBookingTokens.selectedDjIds,
        clientName: bookings.clientName,
        subject: bookings.subject,
        date: bookings.date,
        startTime: bookings.startTime,
      })
      .from(secondBookingTokens)
      .innerJoin(bookings, eq(bookings.id, secondBookingTokens.firstBookingId))
      .where(and(isNull(secondBookingTokens.usedAt), bookingCtxFilter))
      .orderBy(desc(secondBookingTokens.createdAt))

    pendingSecondTokens = rawTokens
      .filter((t) => t.selectedDjIds.length > 0)
      .map((t) => ({
        id: t.id,
        link: `${appUrl}/book/segunda/${t.token}`,
        clientName: t.clientName,
        subject: t.subject,
        date: t.date,
        startTime: t.startTime.substring(0, 5),
      }))
  }

  // ── DJs disponibles para el diálogo (incluye a Facuu que tiene role='facundo') ──
  const allMembers = canSeeSecondBookingSection
    ? await db
        .select({ id: profiles.id, name: profiles.name, role: profiles.role })
        .from(profiles)
        .where(inArray(profiles.role, ['facundo', 'aura_member']))
        .orderBy(profiles.name)
    : []

  // ── Obtener reservas según rol ──────────────────────────────────────────────
  let allBookings: BookingDisplay[] = []

  if (profile.role === 'facundo') {
    const rawBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt))

    if (rawBookings.length > 0) {
      const participants = await db
        .select({
          bookingId: bookingParticipants.bookingId,
          memberId: bookingParticipants.memberId,
          status: bookingParticipants.status,
          name: profiles.name,
        })
        .from(bookingParticipants)
        .innerJoin(profiles, eq(profiles.id, bookingParticipants.memberId))
        .where(
          inArray(
            bookingParticipants.bookingId,
            rawBookings.map((b) => b.id)
          )
        )

      // Datos del cliente (para modal de detalle)
      const clientIds = rawBookings.filter((b) => b.clientId).map((b) => b.clientId!)
      const clientRows =
        clientIds.length > 0
          ? await db
              .select({
                id: clients.id,
                phone: clients.phone,
                eventType: clients.eventType,
                eventTypeOther: clients.eventTypeOther,
                eventDate: clients.eventDate,
                eventTime: clients.eventTime,
                guestCount: clients.guestCount,
                eventLocation: clients.eventLocation,
                djPreference: clients.djPreference,
              })
              .from(clients)
              .where(inArray(clients.id, clientIds))
          : []
      const clientByClientId = new Map(clientRows.map((c) => [c.id, c]))

      allBookings = rawBookings.map((b) => {
        const clientData = b.clientId ? clientByClientId.get(b.clientId) : undefined
        return {
          id: b.id,
          clientName: b.clientName,
          clientEmail: b.clientEmail,
          clientPhone: clientData?.phone ?? null,
          subject: b.subject,
          message: b.message,
          date: b.date,
          startTime: b.startTime.substring(0, 5),
          endTime: b.endTime.substring(0, 5),
          status: b.status,
          context: b.context,
          meetingRound: b.meetingRound ?? 1,
          clientId: b.clientId,
          participants: participants
            .filter((p) => p.bookingId === b.id)
            .map((p) => ({ memberId: p.memberId, name: p.name, status: p.status })),
          myParticipantStatus:
            participants.find((p) => p.bookingId === b.id && p.memberId === profile.id)?.status ??
            null,
          eventType: clientData?.eventType ?? null,
          eventTypeOther: clientData?.eventTypeOther ?? null,
          eventDate: clientData?.eventDate ?? null,
          eventTime: clientData?.eventTime ?? null,
          guestCount: clientData?.guestCount ?? null,
          eventLocation: clientData?.eventLocation ?? null,
          djPreference: clientData?.djPreference ?? null,
        }
      })
    }
  } else {
    const myParticipations = await db
      .select({ bookingId: bookingParticipants.bookingId })
      .from(bookingParticipants)
      .where(eq(bookingParticipants.memberId, profile.id))

    if (myParticipations.length > 0) {
      const bookingIds = myParticipations.map((p) => p.bookingId)

      // aura_member solo ve segundas reuniones; aura_admin ve todas las suyas
      const rawBookings = await db
        .select()
        .from(bookings)
        .where(
          profile.role === 'aura_member'
            ? and(inArray(bookings.id, bookingIds), eq(bookings.meetingRound, 2))
            : inArray(bookings.id, bookingIds)
        )
        .orderBy(desc(bookings.createdAt))

      const participants = await db
        .select({
          bookingId: bookingParticipants.bookingId,
          memberId: bookingParticipants.memberId,
          status: bookingParticipants.status,
          name: profiles.name,
        })
        .from(bookingParticipants)
        .innerJoin(profiles, eq(profiles.id, bookingParticipants.memberId))
        .where(
          inArray(
            bookingParticipants.bookingId,
            rawBookings.map((b) => b.id)
          )
        )

      // Datos del cliente (para modal de detalle)
      const clientIds = rawBookings.filter((b) => b.clientId).map((b) => b.clientId!)
      const clientRows =
        clientIds.length > 0
          ? await db
              .select({
                id: clients.id,
                phone: clients.phone,
                eventType: clients.eventType,
                eventTypeOther: clients.eventTypeOther,
                eventDate: clients.eventDate,
                eventTime: clients.eventTime,
                guestCount: clients.guestCount,
                eventLocation: clients.eventLocation,
                djPreference: clients.djPreference,
              })
              .from(clients)
              .where(inArray(clients.id, clientIds))
          : []
      const clientByClientId = new Map(clientRows.map((c) => [c.id, c]))

      allBookings = rawBookings.map((b) => {
        const clientData = b.clientId ? clientByClientId.get(b.clientId) : undefined
        return {
          id: b.id,
          clientName: b.clientName,
          clientEmail: b.clientEmail,
          clientPhone: clientData?.phone ?? null,
          subject: b.subject,
          message: b.message,
          date: b.date,
          startTime: b.startTime.substring(0, 5),
          endTime: b.endTime.substring(0, 5),
          status: b.status,
          context: b.context,
          meetingRound: b.meetingRound ?? 1,
          clientId: b.clientId,
          participants: participants
            .filter((p) => p.bookingId === b.id)
            .map((p) => ({ memberId: p.memberId, name: p.name, status: p.status })),
          myParticipantStatus:
            participants.find((p) => p.bookingId === b.id && p.memberId === profile.id)?.status ??
            null,
          eventType: clientData?.eventType ?? null,
          eventTypeOther: clientData?.eventTypeOther ?? null,
          eventDate: clientData?.eventDate ?? null,
          eventTime: clientData?.eventTime ?? null,
          guestCount: clientData?.guestCount ?? null,
          eventLocation: clientData?.eventLocation ?? null,
          djPreference: clientData?.djPreference ?? null,
        }
      })
    }
  }

  const filtered = allBookings.filter((b) => b.status === activeTab)

  // ── Split pendientes en próximas y pasadas ──────────────────────────────────
  const nowMs = Date.now()
  const isBookingPast = (b: { date: string; startTime: string }) => {
    const [y, mo, d] = b.date.split('-').map(Number)
    const [h, min] = b.startTime.split(':').map(Number)
    // ART = UTC-3 → fin de reunión en UTC = hora local + 3h + 45min
    return Date.UTC(y, mo - 1, d, h + 3, min + 45) < nowMs
  }

  const upcomingPending = filtered.filter((b) => !isBookingPast(b))
  const pastPending = filtered.filter((b) => isBookingPast(b))

  const counts = {
    pending: allBookings.filter((b) => b.status === 'pending').length,
    confirmed: allBookings.filter((b) => b.status === 'confirmed').length,
    rejected: allBookings.filter((b) => b.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Reservas</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {profile.role === 'facundo'
              ? 'Todas las reservas de AURA y personales.'
              : 'Reservas en las que participás.'}
          </p>
        </div>

        <CopyBookingLinkButton role={profile.role} variant="compact" />
      </div>

      {/* ─── Sección prioritaria: segunda reserva pendiente ──────────────── */}
      {canSeeSecondBookingSection && priorityBookings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              Habilitá la segunda reserva
            </span>
          </div>

          {priorityBookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-xl border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  ¿Ya tuviste reunión con{' '}
                  <span className="text-violet-700 dark:text-violet-400">{b.clientName}</span>?
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                  <span>{b.subject}</span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {format(parseISO(b.date), "d 'de' MMM yyyy", { locale: es })}
                    {' · '}
                    {b.startTime.substring(0, 5)}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <EnableSecondBookingDialog
                  booking={{
                    id: b.id,
                    clientId: b.clientId!,
                    clientName: b.clientName,
                    subject: b.subject,
                  }}
                  allMembers={allMembers}
                  context={b.context}
                />
              </div>
            </div>
          ))}

          <div className="border-t border-zinc-200 dark:border-white/5" />
        </div>
      )}

      {/* ─── Links enviados pendientes ────────────────────────────────────── */}
      {canSeeSecondBookingSection && pendingSecondTokens.length > 0 && (
        <div className="space-y-3">
          <PendingSecondTokens tokens={pendingSecondTokens} />
          <div className="border-t border-zinc-200 dark:border-white/5" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/bookings?status=${tab.key}`}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={cn(
                  'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  activeTab === tab.key && tab.key === 'pending'
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'
                )}
              >
                {counts[tab.key]}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ─── Lista de reservas ─────────────────────────────────────────────── */}
      {activeTab === 'pending' ? (
        <div className="space-y-6">
          {/* Próximas */}
          {upcomingPending.length > 0 ? (
            <div className="space-y-3">
              {upcomingPending.map((booking) => (
                <BookingCard key={booking.id} booking={booking} role={profile.role} />
              ))}
            </div>
          ) : (
            pastPending.length === 0 && (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-white/10">
                <p className="text-sm text-zinc-400 dark:text-zinc-600">
                  No hay reservas pendientes
                </p>
              </div>
            )
          )}

          {/* Pasadas sin confirmar */}
          {pastPending.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  Pasadas sin confirmar
                </span>
              </div>
              {pastPending.map((booking) => (
                <BookingCard key={booking.id} booking={booking} role={profile.role} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-white/10">
              <p className="text-sm text-zinc-400 dark:text-zinc-600">
                No hay reservas en esta categoría
              </p>
            </div>
          ) : (
            filtered.map((booking) => (
              <BookingCard key={booking.id} booking={booking} role={profile.role} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
