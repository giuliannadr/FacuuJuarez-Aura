import { eq, and, inArray } from 'drizzle-orm'
import { db, profiles, contentBlocks } from '@aura/db'
import { buildAvailableSlots } from '@/lib/slotUtils'
import { BookingFlow } from './BookingFlow'

export const dynamic = 'force-dynamic'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BookPage() {
  // ── Coordinador ─────────────────────────────────────────────────────────────
  let coordinatorRows = await db
    .select({ id: profiles.id, name: profiles.name })
    .from(profiles)
    .where(eq(profiles.isCoordinator, true))
    .limit(1)

  if (coordinatorRows.length === 0) {
    coordinatorRows = await db
      .select({ id: profiles.id, name: profiles.name })
      .from(profiles)
      .where(inArray(profiles.role, ['facundo', 'aura_admin']))
      .limit(1)
  }

  if (coordinatorRows.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Reservá una reunión</h1>
        </div>
        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-white/10 p-8 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            No hay turnos disponibles en este momento. Volvé pronto.
          </p>
        </div>
      </div>
    )
  }

  const coordinator = coordinatorRows[0]

  // ── Nombre de contacto configurable ─────────────────────────────────────────
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

  const contactName = contactBlock?.value?.trim() || null

  // ── Miembros del equipo para selección de DJ ─────────────────────────────────
  const djMembers = await db
    .select({ id: profiles.id, name: profiles.name })
    .from(profiles)
    .where(inArray(profiles.role, ['facundo', 'aura_admin', 'aura_member']))
    .orderBy(profiles.name)

  // ── Slots disponibles (con locking y timezone ART) ───────────────────────────
  const availableSlots = await buildAvailableSlots(coordinator.id, 'aura')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Reservá una reunión</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Contanos sobre tu evento, elegí fecha y horario y te confirmamos a la brevedad. Cada
          reunión dura 45 minutos.
        </p>
      </div>

      <BookingFlow
        coordinatorId={coordinator.id}
        contactName={contactName}
        availableSlots={availableSlots}
        context="aura"
        showDjPreference={true}
        djMembers={djMembers}
        brandName="AURA"
      />
    </div>
  )
}
