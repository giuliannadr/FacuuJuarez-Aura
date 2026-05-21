import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { getSession } from '@/lib/supabase'
import { BookingCard, type BookingDisplay } from '@/components/features/bookings/BookingCard'
import { cn } from '@/lib/utils'

// Mock data — se reemplaza por queries Drizzle cuando esté la DB
const MOCK_BOOKINGS: BookingDisplay[] = [
  {
    id: 'b1',
    clientName: 'Lucas Mendez',
    clientEmail: 'lucas@email.com',
    subject: 'Set para evento privado',
    message: 'Estamos organizando un evento para 200 personas en Palermo.',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '16:00',
    status: 'pending',
    context: 'aura',
    participants: [
      { memberId: '1', name: 'Facundo', status: 'pending' },
      { memberId: '2', name: 'Valentina', status: 'pending' },
    ],
    myParticipantStatus: 'pending',
  },
  {
    id: 'b2',
    clientName: 'Sofía Ramírez',
    clientEmail: 'sofia@empresa.com',
    subject: 'Consulta para boda — diciembre',
    message: null,
    date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    status: 'confirmed',
    context: 'facundo_solo',
    participants: [{ memberId: '1', name: 'Facundo', status: 'accepted' }],
    myParticipantStatus: 'accepted',
  },
  {
    id: 'b3',
    clientName: 'Agencia XYZ',
    clientEmail: 'contacto@xyz.com',
    subject: 'Propuesta comercial anual',
    message: 'Queremos discutir un contrato de cobertura para todos nuestros eventos.',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    status: 'rejected',
    context: 'aura',
    participants: [
      { memberId: '1', name: 'Facundo', status: 'rejected' },
      { memberId: '3', name: 'Matías', status: 'rejected' },
    ],
    myParticipantStatus: 'rejected',
  },
]

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

  // Facundo ve todos. El resto solo ve los suyos.
  const allBookings =
    profile.role === 'facundo'
      ? MOCK_BOOKINGS
      : MOCK_BOOKINGS.filter((b) => b.participants.some((p) => p.name === profile.name))

  const filtered = allBookings.filter((b) => b.status === activeTab)

  const counts = {
    pending: allBookings.filter((b) => b.status === 'pending').length,
    confirmed: allBookings.filter((b) => b.status === 'confirmed').length,
    rejected: allBookings.filter((b) => b.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Reservas</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {profile.role === 'facundo'
              ? 'Todas las reservas de AURA y personales.'
              : 'Reservas en las que participás.'}
          </p>
        </div>

        {/* Link público para compartir */}
        <Link
          href="/book"
          target="_blank"
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Link de reserva
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-white/5 bg-white/[0.02] p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/bookings?status=${tab.key}`}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === tab.key ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={cn(
                  'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold',
                  activeTab === tab.key && tab.key === 'pending'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-white/10 text-zinc-400'
                )}
              >
                {counts[tab.key]}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Booking list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-sm text-zinc-600">No hay reservas en esta categoría</p>
          </div>
        ) : (
          filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} role={profile.role} />
          ))
        )}
      </div>
    </div>
  )
}
