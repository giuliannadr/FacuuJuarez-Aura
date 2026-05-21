import { redirect } from 'next/navigation'
import { getSession } from '@/lib/supabase'
import {
  AvailabilityGrid,
  type SlotDisplay,
} from '@/components/features/availability/AvailabilityGrid'

// Mock data — se reemplaza por query Drizzle cuando esté la DB
// await db.query.availabilitySlots.findMany({
//   where: eq(availabilitySlots.memberId, session.profile.id)
// })
const MOCK_SLOTS: SlotDisplay[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    context: 'aura',
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '17:00',
    context: 'facundo_solo',
  },
  {
    id: '3',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    context: 'aura',
  },
]

export default async function AvailabilityPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { profile } = session

  // Facundo ve todos sus slots (aura + personal)
  // El resto solo ve sus slots de "aura"
  const slots =
    profile.role === 'facundo' ? MOCK_SLOTS : MOCK_SLOTS.filter((s) => s.context === 'aura')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Mi disponibilidad</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {profile.role === 'facundo'
            ? 'Tu calendario unificado — slots de AURA y personales en un solo lugar.'
            : 'Marcá los horarios en que estás disponible para reuniones de AURA.'}
        </p>
      </div>

      <AvailabilityGrid initialSlots={slots} role={profile.role} />
    </div>
  )
}
