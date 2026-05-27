import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { db, bookings, bookingParticipants } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/dashboard'

  const { profile } = session

  // ── Contar reservas pendientes según rol ─────────────────────────────────────
  let pendingCount = 0

  if (profile.role === 'facundo') {
    // Facundo ve TODAS las reservas pendientes
    const rows = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.status, 'pending'))
    pendingCount = rows.length
  } else {
    // aura_admin y aura_member: solo donde participan Y su respuesta es pendiente
    // aura_member: además, solo segundas reuniones (meetingRound = 2)
    const whereClause =
      profile.role === 'aura_member'
        ? and(
            eq(bookingParticipants.memberId, profile.id),
            eq(bookingParticipants.status, 'pending'),
            eq(bookings.status, 'pending'),
            eq(bookings.meetingRound, 2)
          )
        : and(
            eq(bookingParticipants.memberId, profile.id),
            eq(bookingParticipants.status, 'pending'),
            eq(bookings.status, 'pending')
          )

    const rows = await db
      .select({ bookingId: bookingParticipants.bookingId })
      .from(bookingParticipants)
      .innerJoin(bookings, eq(bookings.id, bookingParticipants.bookingId))
      .where(whereClause)
    pendingCount = rows.length
  }

  return (
    <DashboardShell profile={session.profile} pathname={pathname} pendingCount={pendingCount}>
      {children}
    </DashboardShell>
  )
}
