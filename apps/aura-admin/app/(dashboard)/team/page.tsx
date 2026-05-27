import { redirect } from 'next/navigation'
import { asc } from 'drizzle-orm'
import { db, profiles } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'
import { Badge } from '@/components/ui/badge'
import { InviteMemberDialog } from '@/components/features/team/InviteMemberDialog'
import { DeleteMemberButton } from '@/components/features/team/DeleteMemberButton'

const ROLE_BADGE: Record<
  'facundo' | 'aura_admin' | 'aura_member',
  { label: string; className: string }
> = {
  facundo: {
    label: 'Dueño',
    className:
      'rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400',
  },
  aura_admin: {
    label: 'Admin',
    className:
      'rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400',
  },
  aura_member: {
    label: 'Miembro',
    className:
      'rounded-full bg-zinc-200 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400',
  },
}

export default async function TeamPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!can(session.profile.role, 'canManageTeam')) redirect('/dashboard')

  const { profile } = session

  const members = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      email: profiles.email,
      role: profiles.role,
    })
    .from(profiles)
    .orderBy(asc(profiles.name))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Equipo</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {members.length} {members.length === 1 ? 'miembro' : 'miembros'} en el equipo.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      {/* Lista de miembros */}
      <div className="space-y-2">
        {members.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-white/10">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">No hay miembros aún</p>
          </div>
        ) : (
          members.map((member) => {
            const badge = ROLE_BADGE[member.role]
            const isMe = member.id === profile.id

            // Determinar si se puede eliminar a este miembro
            // Regla: cualquier admin puede eliminar a cualquier no-facundo (menos a sí mismo)
            const canDelete = !isMe && member.role !== 'facundo'

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.02] px-4 py-3"
              >
                {/* Avatar inicial */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600/15 text-sm font-bold text-violet-600 dark:text-violet-400">
                  {member.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                      {member.name}
                    </p>
                    <span className={badge.className}>{badge.label}</span>
                    {isMe && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-600">(vos)</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    {member.email}
                  </p>
                </div>

                {/* Eliminar */}
                {canDelete && <DeleteMemberButton memberId={member.id} memberName={member.name} />}
              </div>
            )
          })
        )}
      </div>

      {/* Nota informativa */}
      <p className="text-xs text-zinc-400 dark:text-zinc-600">
        Las cuentas creadas aquí pueden acceder al panel de administración con el email y contraseña
        que les asignes.
      </p>
    </div>
  )
}
