import { redirect } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import { db, contentBlocks } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { ChangePasswordForm } from './ChangePasswordForm'
import { BookingSettingsSection } from './BookingSettingsSection'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { profile } = session

  // Nombre del encargado de reuniones guardado en contentBlocks
  const [contactBlock] = await db
    .select({ value: contentBlocks.value })
    .from(contentBlocks)
    .where(
      and(
        eq(contentBlocks.site, 'aura'),
        eq(contentBlocks.section, 'booking'),
        eq(contentBlocks.key, 'contact_name')
      )
    )
    .limit(1)

  const currentContactName = contactBlock?.value ?? ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="space-y-8 max-w-lg">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Configuración</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Ajustes de tu cuenta y de la agencia.
        </p>
      </div>

      {/* Info de la cuenta (solo lectura) */}
      <div className="rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.02] divide-y divide-zinc-100 dark:divide-white/5">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
            Tu cuenta
          </p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Nombre</p>
              <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">
                {profile.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Email</p>
              <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Rol</p>
              <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300 capitalize">
                {profile.role === 'facundo'
                  ? 'Dueño'
                  : profile.role === 'aura_admin'
                    ? 'Administrador'
                    : 'Miembro'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Links + nombre de contacto */}
      <BookingSettingsSection
        role={profile.role}
        isCoordinator={profile.isCoordinator}
        appUrl={appUrl}
        currentContactName={currentContactName}
      />

      {/* Cambiar contraseña */}
      <div className="rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.02]">
        <div className="px-5 pt-5 pb-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Cambiar contraseña
          </p>
        </div>
        <ChangePasswordForm email={profile.email} />
      </div>
    </div>
  )
}
