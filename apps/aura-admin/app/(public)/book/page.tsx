import { BookingFlow } from './BookingFlow'

// Mock data — se reemplaza por query Drizzle cuando esté la DB
// const members = await db.query.profiles.findMany({
//   where: inArray(profiles.role, ['facundo', 'aura_admin', 'aura_member']),
//   columns: { id: true, name: true, role: true, bio: true, avatarUrl: true },
// })
const MOCK_MEMBERS = [
  {
    id: 'f1a2b3c4-0000-0000-0000-000000000001',
    name: 'Facundo',
    role: 'facundo' as const,
    bio: 'DJ y fundador',
    avatarUrl: null,
  },
  {
    id: 'f1a2b3c4-0000-0000-0000-000000000002',
    name: 'Valentina',
    role: 'aura_member' as const,
    bio: 'Producción',
    avatarUrl: null,
  },
  {
    id: 'f1a2b3c4-0000-0000-0000-000000000003',
    name: 'Matías',
    role: 'aura_member' as const,
    bio: 'Management',
    avatarUrl: null,
  },
]

// Mock availability — se reemplaza por query real
const MOCK_SLOTS = [
  {
    memberId: 'f1a2b3c4-0000-0000-0000-000000000001',
    date: getTodayPlus(1),
    startTime: '10:00',
    endTime: '11:00',
  },
  {
    memberId: 'f1a2b3c4-0000-0000-0000-000000000001',
    date: getTodayPlus(1),
    startTime: '15:00',
    endTime: '16:00',
  },
  {
    memberId: 'f1a2b3c4-0000-0000-0000-000000000002',
    date: getTodayPlus(1),
    startTime: '10:00',
    endTime: '11:00',
  },
  {
    memberId: 'f1a2b3c4-0000-0000-0000-000000000002',
    date: getTodayPlus(2),
    startTime: '14:00',
    endTime: '15:00',
  },
  {
    memberId: 'f1a2b3c4-0000-0000-0000-000000000003',
    date: getTodayPlus(1),
    startTime: '10:00',
    endTime: '11:00',
  },
  {
    memberId: 'f1a2b3c4-0000-0000-0000-000000000003',
    date: getTodayPlus(3),
    startTime: '09:00',
    endTime: '10:00',
  },
]

function getTodayPlus(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function BookPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Reservá una reunión</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Elegí con quién querés reunirte, un horario disponible y completá tus datos.
        </p>
      </div>

      <BookingFlow members={MOCK_MEMBERS} availableSlots={MOCK_SLOTS} />
    </div>
  )
}
