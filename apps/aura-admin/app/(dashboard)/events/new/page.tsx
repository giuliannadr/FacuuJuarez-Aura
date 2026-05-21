import { redirect } from 'next/navigation'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'
import { EventForm } from '@/components/features/events/EventForm'

const MOCK_MEMBERS = [
  { id: 'm1', name: 'Facundo', bio: 'DJ y fundador' },
  { id: 'm2', name: 'Valentina', bio: 'Coordinación' },
  { id: 'm3', name: 'Matías', bio: 'Producción' },
]

export default async function NewEventPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!can(session.profile.role, 'canManageEvents')) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Nuevo evento</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Cargá los detalles del servicio cerrado con el cliente.
        </p>
      </div>
      <EventForm role={session.profile.role} members={MOCK_MEMBERS} />
    </div>
  )
}
