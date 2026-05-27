import { redirect } from 'next/navigation'
import { db, profiles } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'
import { EventForm } from '@/components/features/events/EventForm'

export default async function NewEventPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!can(session.profile.role, 'canManageEvents')) redirect('/dashboard')

  const members = await db
    .select({ id: profiles.id, name: profiles.name, bio: profiles.bio })
    .from(profiles)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Nuevo evento</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Cargá los detalles del servicio cerrado con el cliente.
        </p>
      </div>
      <EventForm role={session.profile.role} members={members} />
    </div>
  )
}
