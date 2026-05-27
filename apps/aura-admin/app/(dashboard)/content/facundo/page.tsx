import { redirect } from 'next/navigation'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'

export default async function FacundoContentPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!can(session.profile.role, 'canEditFacundoContent')) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Contenido — Landing Facundo
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Editá el contenido de la landing personal del DJ.
        </p>
      </div>
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-white/10">
        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          Editor de contenido — próximamente
        </p>
      </div>
    </div>
  )
}
