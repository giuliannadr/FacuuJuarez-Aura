import { redirect } from 'next/navigation'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'

export default async function TeamPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!can(session.profile.role, 'canManageTeam')) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Equipo</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Administrá los miembros del equipo de AURA.
        </p>
      </div>
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/10">
        <p className="text-sm text-zinc-600">Gestión de equipo — próximamente</p>
      </div>
    </div>
  )
}
