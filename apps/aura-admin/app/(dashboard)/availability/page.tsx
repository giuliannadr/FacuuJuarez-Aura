import { redirect } from 'next/navigation'
import { eq, and, asc } from 'drizzle-orm'
import { db, availabilitySlots, scheduleTemplateDays } from '@aura/db'
import { getSession } from '@/lib/supabase'
import {
  AvailabilityGrid,
  type SlotDisplay,
} from '@/components/features/availability/AvailabilityGrid'
import { ScheduleTemplateEditor } from '@/components/features/availability/ScheduleTemplateEditor'

export default async function AvailabilityPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { profile } = session

  // ── Plantilla de horario base ──────────────────────────────────────────────
  // Facundo carga ambos contextos; el resto solo 'aura'
  const templateRows = await db
    .select()
    .from(scheduleTemplateDays)
    .where(
      profile.role === 'facundo'
        ? eq(scheduleTemplateDays.memberId, profile.id)
        : and(
            eq(scheduleTemplateDays.memberId, profile.id),
            eq(scheduleTemplateDays.context, 'aura')
          )
    )
    .orderBy(asc(scheduleTemplateDays.dayOfWeek))

  // ── Slots individuales ─────────────────────────────────────────────────────
  const rawSlots = await db
    .select()
    .from(availabilitySlots)
    .where(
      profile.role === 'facundo'
        ? eq(availabilitySlots.memberId, profile.id)
        : and(eq(availabilitySlots.memberId, profile.id), eq(availabilitySlots.context, 'aura'))
    )
    .orderBy(asc(availabilitySlots.date), asc(availabilitySlots.startTime))

  const slots: SlotDisplay[] = rawSlots.map((s) => ({
    id: s.id,
    date: s.date,
    startTime: s.startTime.substring(0, 5),
    endTime: s.endTime.substring(0, 5),
    context: s.context,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Mi disponibilidad</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {profile.role === 'facundo'
            ? 'Tu horario general — aplica tanto a reuniones AURA como a tu agenda personal.'
            : 'Configurá tu horario habitual y marcá días específicos según necesites.'}
        </p>
      </div>

      {/* Horario base */}
      <ScheduleTemplateEditor initialRows={templateRows} role={profile.role} />

      {/* Grilla semanal */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Calendario</h3>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Visualizá y editá slots individuales. Usá el "+" en cada día para agregar excepciones.
          </p>
        </div>
        <AvailabilityGrid initialSlots={slots} role={profile.role} />
      </div>
    </div>
  )
}
