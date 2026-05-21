import { redirect } from 'next/navigation'
import { getSession } from '@/lib/supabase'

export default async function AvailabilityPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Mi disponibilidad</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Configurá los horarios en los que estás disponible para reuniones.
        </p>
      </div>
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/10">
        <p className="text-sm text-zinc-600">Grilla de disponibilidad — próximamente</p>
      </div>
    </div>
  )
}
