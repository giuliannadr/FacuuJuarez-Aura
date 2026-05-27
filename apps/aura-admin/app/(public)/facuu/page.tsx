import { eq } from 'drizzle-orm'
import { db, profiles } from '@aura/db'
import { buildAvailableSlots } from '@/lib/slotUtils'
import { BookingFlow } from '@/app/(public)/book/BookingFlow'

export const dynamic = 'force-dynamic'

export default async function FacuPage() {
  const [facuProfile] = await db
    .select({ id: profiles.id, name: profiles.name })
    .from(profiles)
    .where(eq(profiles.role, 'facundo'))
    .limit(1)

  if (!facuProfile) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 dark:border-white/10 p-8 text-center">
        <p className="text-sm text-zinc-500">No hay turnos disponibles. Volvé pronto.</p>
      </div>
    )
  }

  const availableSlots = await buildAvailableSlots(facuProfile.id, 'facundo_solo')

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Reservá una reunión</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Contame sobre tu evento, elegí fecha y horario. Cada reunión dura 45&nbsp;minutos.
        </p>
      </div>

      <BookingFlow
        coordinatorId={facuProfile.id}
        contactName={facuProfile.name}
        availableSlots={availableSlots}
        context="facundo_solo"
        showDjPreference={false}
        brandName="Facuu Juarez"
        theme="red"
      />
    </>
  )
}
