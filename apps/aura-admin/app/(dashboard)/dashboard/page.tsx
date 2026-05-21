import { redirect } from 'next/navigation'
import { CalendarDays, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'
import { Badge } from '@/components/ui/badge'

// Mock data — se reemplaza por queries Drizzle cuando esté la DB
const MOCK_STATS = {
  pendingBookings: 3,
  confirmedThisWeek: 7,
  rejectedThisWeek: 1,
  nextBooking: { date: '2026-05-23', time: '15:00', client: 'Lucas M.', subject: 'Set para evento privado' },
}

const MOCK_RECENT_BOOKINGS = [
  { id: '1', client: 'Lucas M.', subject: 'Set para evento privado', date: '2026-05-23', status: 'pending' as const },
  { id: '2', client: 'Sofía R.', subject: 'Consulta para boda', date: '2026-05-21', status: 'confirmed' as const },
  { id: '3', client: 'Agencia XYZ', subject: 'Propuesta comercial', date: '2026-05-20', status: 'confirmed' as const },
  { id: '4', client: 'Pedro L.', subject: 'Evento corporativo', date: '2026-05-19', status: 'rejected' as const },
]

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', variant: 'warning' as const },
  confirmed: { label: 'Confirmada', variant: 'success' as const },
  rejected: { label: 'Rechazada', variant: 'destructive' as const },
  cancelled: { label: 'Cancelada', variant: 'secondary' as const },
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { profile } = session
  const showMergedCalendar = can(profile.role, 'canViewMergedCalendar')

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Buen día, {profile.name.split(' ')[0]} 👋
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          {showMergedCalendar
            ? 'Este es tu calendario unificado — reservas de AURA y personales.'
            : 'Acá tenés un resumen de la actividad reciente.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Clock className="h-4 w-4 text-amber-400" />}
          label="Pendientes"
          value={MOCK_STATS.pendingBookings}
          bg="bg-amber-500/10"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          label="Confirmadas esta semana"
          value={MOCK_STATS.confirmedThisWeek}
          bg="bg-emerald-500/10"
        />
        <StatCard
          icon={<XCircle className="h-4 w-4 text-red-400" />}
          label="Rechazadas esta semana"
          value={MOCK_STATS.rejectedThisWeek}
          bg="bg-red-500/10"
        />
      </div>

      {/* Próxima reunión */}
      {MOCK_STATS.nextBooking && (
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
              <CalendarDays className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Próxima reunión
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {MOCK_STATS.nextBooking.subject}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {MOCK_STATS.nextBooking.client} · {MOCK_STATS.nextBooking.date} a las{' '}
                {MOCK_STATS.nextBooking.time}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reservas recientes */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-300">Reservas recientes</h3>
        <div className="overflow-hidden rounded-lg border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Asunto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_RECENT_BOOKINGS.map((booking) => {
                const config = STATUS_CONFIG[booking.status]
                return (
                  <tr key={booking.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">{booking.client}</td>
                    <td className="px-4 py-3 text-zinc-400">{booking.subject}</td>
                    <td className="px-4 py-3 text-zinc-400">{booking.date}</td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon, label, value, bg,
}: {
  icon: React.ReactNode
  label: string
  value: number
  bg: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-400">{label}</p>
      </div>
    </div>
  )
}
