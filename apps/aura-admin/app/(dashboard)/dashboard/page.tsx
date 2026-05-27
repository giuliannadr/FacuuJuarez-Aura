import { redirect } from 'next/navigation'
import { CalendarDays, CheckCircle2, Users, XCircle, Clock, Sparkles } from 'lucide-react'
import { CopyBookingLinkButton } from '@/components/layout/CopyBookingLinkButton'
import { eq, and, gte, lte, desc, count, inArray, isNull, or, gt } from 'drizzle-orm'
import { db, bookings, bookingParticipants, profiles, secondBookingTokens, clients } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'
import {
  DashboardRecentBookings,
  type PriorityBooking,
} from '@/components/features/bookings/DashboardRecentBookings'
import { NextBookingCard } from '@/components/features/bookings/NextBookingCard'
import type { BookingDetail } from '@/components/features/bookings/BookingDetailModal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ART = UTC−3, sin horario de verano
function getWeekBounds() {
  const artNow = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const day = artNow.getUTCDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(artNow)
  monday.setUTCDate(artNow.getUTCDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
    today: artNow.toISOString().slice(0, 10),
    nowTime: artNow.toISOString().slice(11, 16), // 'HH:MM' actual en ART
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { profile } = session
  const showMergedCalendar = can(profile.role, 'canViewMergedCalendar')
  const { weekStart, weekEnd, today, nowTime } = getWeekBounds()

  const isAdmin =
    profile.role === 'facundo' || profile.role === 'aura_admin' || profile.isCoordinator

  // Facundo ve todos los contextos; aura_admin/coordinadores solo ven reservas de AURA
  const isFacundo = profile.role === 'facundo'
  // drizzle's and() ignora undefined → sin filtro para facundo
  const ctxFilter = isFacundo ? undefined : eq(bookings.context, 'aura')

  // ── Stats role-aware ────────────────────────────────────────────────────────

  let stats: {
    stat1: {
      value: number
      label: string
      icon: 'pending' | 'confirmed' | 'clients' | 'upcoming' | 'rejected'
    }
    stat2: {
      value: number
      label: string
      icon: 'pending' | 'confirmed' | 'clients' | 'upcoming' | 'rejected'
    }
    stat3: {
      value: number
      label: string
      icon: 'pending' | 'confirmed' | 'clients' | 'upcoming' | 'rejected'
    }
  }

  if (isAdmin) {
    // ── Admin stats ─────────────────────────────────────────────────────────
    // 1. Reservas pendientes (todas — requieren acción)
    const [pendingRes] = await db
      .select({ value: count() })
      .from(bookings)
      .where(and(eq(bookings.status, 'pending'), ctxFilter))

    // 2. Confirmadas esta semana (por fecha de reunión)
    const [confirmedRes] = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.status, 'confirmed'),
          gte(bookings.date, weekStart),
          lte(bookings.date, weekEnd),
          ctxFilter
        )
      )

    // 3. Total clientes registrados
    const [clientsRes] = await db.select({ value: count() }).from(clients)

    stats = {
      stat1: { value: Number(pendingRes.value), label: 'Reservas pendientes', icon: 'pending' },
      stat2: {
        value: Number(confirmedRes.value),
        label: 'Confirmadas esta semana',
        icon: 'confirmed',
      },
      stat3: { value: Number(clientsRes.value), label: 'Clientes registrados', icon: 'clients' },
    }
  } else {
    // ── aura_member stats ────────────────────────────────────────────────────
    // 1. Mis reservas donde mi respuesta sigue pendiente
    const [myPendingRes] = await db
      .select({ value: count() })
      .from(bookingParticipants)
      .innerJoin(bookings, eq(bookings.id, bookingParticipants.bookingId))
      .where(
        and(
          eq(bookingParticipants.memberId, profile.id),
          eq(bookingParticipants.status, 'pending'),
          eq(bookings.status, 'pending')
        )
      )

    // 2. Mis confirmadas esta semana (por fecha de reunión)
    const [myConfirmedRes] = await db
      .select({ value: count() })
      .from(bookingParticipants)
      .innerJoin(bookings, eq(bookings.id, bookingParticipants.bookingId))
      .where(
        and(
          eq(bookingParticipants.memberId, profile.id),
          eq(bookings.status, 'confirmed'),
          gte(bookings.date, weekStart),
          lte(bookings.date, weekEnd)
        )
      )

    // 3. Mis próximas reuniones confirmadas (upcoming)
    const [myUpcomingRes] = await db
      .select({ value: count() })
      .from(bookingParticipants)
      .innerJoin(bookings, eq(bookings.id, bookingParticipants.bookingId))
      .where(
        and(
          eq(bookingParticipants.memberId, profile.id),
          eq(bookings.status, 'confirmed'),
          gte(bookings.date, today)
        )
      )

    stats = {
      stat1: {
        value: Number(myPendingRes.value),
        label: 'Mis respuestas pendientes',
        icon: 'pending',
      },
      stat2: {
        value: Number(myConfirmedRes.value),
        label: 'Confirmadas esta semana',
        icon: 'confirmed',
      },
      stat3: { value: Number(myUpcomingRes.value), label: 'Próximas reuniones', icon: 'upcoming' },
    }
  }

  // ── Próxima reunión con datos completos ─────────────────────────────────────
  let nextBookingDetail: BookingDetail | null = null

  {
    // Admin ve todas; member solo las suyas
    let nextRaw:
      | {
          id: string
          clientName: string
          clientEmail: string
          subject: string
          message: string | null
          date: string
          startTime: string
          endTime: string
          status: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
          context: 'aura' | 'facundo_solo'
          meetingRound: number | null
          clientId: string | null
        }
      | undefined

    if (isAdmin) {
      const [row] = await db
        .select({
          id: bookings.id,
          clientName: bookings.clientName,
          clientEmail: bookings.clientEmail,
          subject: bookings.subject,
          message: bookings.message,
          date: bookings.date,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          status: bookings.status,
          context: bookings.context,
          meetingRound: bookings.meetingRound,
          clientId: bookings.clientId,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.status, 'confirmed'),
            // Mostrar: fechas futuras O hoy si la reunión aún no terminó
            or(
              gt(bookings.date, today),
              and(eq(bookings.date, today), gte(bookings.endTime, nowTime))
            ),
            ctxFilter
          )
        )
        .orderBy(bookings.date, bookings.startTime)
        .limit(1)
      nextRaw = row
    } else {
      const myParts = await db
        .select({ bookingId: bookingParticipants.bookingId })
        .from(bookingParticipants)
        .where(eq(bookingParticipants.memberId, profile.id))

      if (myParts.length > 0) {
        const [row] = await db
          .select({
            id: bookings.id,
            clientName: bookings.clientName,
            clientEmail: bookings.clientEmail,
            subject: bookings.subject,
            message: bookings.message,
            date: bookings.date,
            startTime: bookings.startTime,
            endTime: bookings.endTime,
            status: bookings.status,
            context: bookings.context,
            meetingRound: bookings.meetingRound,
            clientId: bookings.clientId,
          })
          .from(bookings)
          .where(
            and(
              eq(bookings.status, 'confirmed'),
              or(
                gt(bookings.date, today),
                and(eq(bookings.date, today), gte(bookings.endTime, nowTime))
              ),
              inArray(
                bookings.id,
                myParts.map((p) => p.bookingId)
              )
            )
          )
          .orderBy(bookings.date, bookings.startTime)
          .limit(1)
        nextRaw = row
      }
    }

    if (nextRaw) {
      const parts = await db
        .select({
          bookingId: bookingParticipants.bookingId,
          memberId: bookingParticipants.memberId,
          status: bookingParticipants.status,
          name: profiles.name,
        })
        .from(bookingParticipants)
        .innerJoin(profiles, eq(profiles.id, bookingParticipants.memberId))
        .where(eq(bookingParticipants.bookingId, nextRaw.id))

      nextBookingDetail = {
        id: nextRaw.id,
        clientName: nextRaw.clientName,
        clientEmail: nextRaw.clientEmail,
        subject: nextRaw.subject,
        message: nextRaw.message,
        date: nextRaw.date,
        startTime: nextRaw.startTime.substring(0, 5),
        endTime: nextRaw.endTime.substring(0, 5),
        status: nextRaw.status,
        context: nextRaw.context,
        meetingRound: nextRaw.meetingRound ?? 1,
        clientId: nextRaw.clientId,
        participants: parts.map((p) => ({ memberId: p.memberId, name: p.name, status: p.status })),
        myParticipantStatus: parts.find((p) => p.memberId === profile.id)?.status ?? null,
      }
    }
  }

  // ── Reservas recientes (con participantes) ───────────────────────────────────
  let recentBookings: BookingDetail[] = []

  if (isAdmin) {
    const raw = await db
      .select({
        id: bookings.id,
        clientName: bookings.clientName,
        clientEmail: bookings.clientEmail,
        subject: bookings.subject,
        message: bookings.message,
        date: bookings.date,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        context: bookings.context,
        meetingRound: bookings.meetingRound,
        clientId: bookings.clientId,
      })
      .from(bookings)
      // Excluir primera reunión que ya tiene segunda reserva habilitada
      // (esas solo aparecen en /bookings, no en el dashboard)
      .leftJoin(secondBookingTokens, eq(secondBookingTokens.firstBookingId, bookings.id))
      .where(and(ctxFilter, isNull(secondBookingTokens.id)))
      .orderBy(desc(bookings.createdAt))
      .limit(10)

    if (raw.length > 0) {
      const parts = await db
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
            raw.map((b) => b.id)
          )
        )

      recentBookings = raw.map((b) => ({
        id: b.id,
        clientName: b.clientName,
        clientEmail: b.clientEmail,
        subject: b.subject,
        message: b.message,
        date: b.date,
        startTime: b.startTime.substring(0, 5),
        endTime: b.endTime.substring(0, 5),
        status: b.status,
        context: b.context,
        meetingRound: b.meetingRound ?? 1,
        clientId: b.clientId,
        participants: parts
          .filter((p) => p.bookingId === b.id)
          .map((p) => ({ memberId: p.memberId, name: p.name, status: p.status })),
        myParticipantStatus:
          parts.find((p) => p.bookingId === b.id && p.memberId === profile.id)?.status ?? null,
      }))
    }
  } else {
    const myParts = await db
      .select({ bookingId: bookingParticipants.bookingId })
      .from(bookingParticipants)
      .where(eq(bookingParticipants.memberId, profile.id))

    if (myParts.length > 0) {
      const ids = myParts.map((p) => p.bookingId)
      const raw = await db
        .select({
          id: bookings.id,
          clientName: bookings.clientName,
          clientEmail: bookings.clientEmail,
          subject: bookings.subject,
          message: bookings.message,
          date: bookings.date,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          status: bookings.status,
          context: bookings.context,
          meetingRound: bookings.meetingRound,
          clientId: bookings.clientId,
        })
        .from(bookings)
        .leftJoin(secondBookingTokens, eq(secondBookingTokens.firstBookingId, bookings.id))
        .where(and(inArray(bookings.id, ids), isNull(secondBookingTokens.id)))
        .orderBy(desc(bookings.createdAt))
        .limit(10)

      if (raw.length > 0) {
        const parts = await db
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
              raw.map((b) => b.id)
            )
          )

        recentBookings = raw.map((b) => ({
          id: b.id,
          clientName: b.clientName,
          clientEmail: b.clientEmail,
          subject: b.subject,
          message: b.message,
          date: b.date,
          startTime: b.startTime.substring(0, 5),
          endTime: b.endTime.substring(0, 5),
          status: b.status,
          context: b.context,
          meetingRound: b.meetingRound ?? 1,
          clientId: b.clientId,
          participants: parts
            .filter((p) => p.bookingId === b.id)
            .map((p) => ({ memberId: p.memberId, name: p.name, status: p.status })),
          myParticipantStatus:
            parts.find((p) => p.bookingId === b.id && p.memberId === profile.id)?.status ?? null,
        }))
      }
    }
  }

  // ── Segunda reserva (solo admins) ────────────────────────────────────────────
  let priorityBookings: PriorityBooking[] = []
  let allMembers: { id: string; name: string }[] = []

  if (isAdmin) {
    const now = Date.now()
    const raw = await db
      .select({
        id: bookings.id,
        clientName: bookings.clientName,
        clientId: bookings.clientId,
        subject: bookings.subject,
        date: bookings.date,
        startTime: bookings.startTime,
      })
      .from(bookings)
      .leftJoin(secondBookingTokens, eq(secondBookingTokens.firstBookingId, bookings.id))
      .where(
        and(
          eq(bookings.meetingRound, 1),
          eq(bookings.status, 'confirmed'),
          isNull(secondBookingTokens.id),
          ctxFilter
        )
      )
      .orderBy(desc(bookings.createdAt))

    priorityBookings = raw
      .filter((b) => {
        const [y, mo, d] = b.date.split('-').map(Number)
        const [h, min] = b.startTime.substring(0, 5).split(':').map(Number)
        return Date.now() > Date.UTC(y, mo - 1, d, h + 3, min + 45)
      })
      .map((b) => ({ ...b, startTime: b.startTime.substring(0, 5) }))

    allMembers = await db
      .select({ id: profiles.id, name: profiles.name })
      .from(profiles)
      .where(inArray(profiles.role, ['facundo', 'aura_member']))
      .orderBy(profiles.name)
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Buen día, {profile.name.split(' ')[0]} 👋
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {showMergedCalendar
              ? 'Calendario unificado — reservas de AURA y personales.'
              : 'Resumen de actividad reciente.'}
          </p>
        </div>

        <CopyBookingLinkButton role={profile.role} variant="compact" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={stats.stat1.icon} label={stats.stat1.label} value={stats.stat1.value} />
        <StatCard icon={stats.stat2.icon} label={stats.stat2.label} value={stats.stat2.value} />
        <StatCard icon={stats.stat3.icon} label={stats.stat3.label} value={stats.stat3.value} />
      </div>

      {/* Próxima reunión */}
      {nextBookingDetail && <NextBookingCard booking={nextBookingDetail} />}

      {/* Reservas recientes + segunda reserva */}
      <DashboardRecentBookings
        bookings={recentBookings}
        priorityBookings={priorityBookings}
        allMembers={allMembers}
        canSeeSecondBooking={isAdmin}
      />
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

const STAT_ICON_CONFIG = {
  pending: { bg: 'bg-amber-500/10', color: 'text-amber-500 dark:text-amber-400', Icon: Clock },
  confirmed: {
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-500 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  clients: { bg: 'bg-violet-500/10', color: 'text-violet-500 dark:text-violet-400', Icon: Users },
  upcoming: { bg: 'bg-sky-500/10', color: 'text-sky-500 dark:text-sky-400', Icon: CalendarDays },
  rejected: { bg: 'bg-red-500/10', color: 'text-red-500 dark:text-red-400', Icon: XCircle },
} as const

function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof STAT_ICON_CONFIG
  label: string
  value: number
}) {
  const { bg, color, Icon } = STAT_ICON_CONFIG[icon]
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      </div>
    </div>
  )
}
