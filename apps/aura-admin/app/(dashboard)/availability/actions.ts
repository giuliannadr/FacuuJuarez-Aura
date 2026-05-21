'use server'

import { revalidatePath } from 'next/cache'
import { addSlotSchema } from '@/lib/schemas/availability'
import { getSession } from '@/lib/supabase'

export type ActionResult = { success: true } | { success: false; error: string }

export async function addAvailabilitySlot(raw: unknown): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }

  const parsed = addSlotSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { date, startTime, endTime, context } = parsed.data

  // Facundo solo puede crear slots "facundo_solo" desde su propio contexto
  // Los demás solo pueden crear slots "aura"
  if (context === 'facundo_solo' && session.profile.role !== 'facundo') {
    return { success: false, error: 'Sin permiso para este contexto' }
  }

  // TODO: reemplazar con Drizzle cuando esté la DB
  // await db.insert(availabilitySlots).values({
  //   memberId: session.profile.id,
  //   context,
  //   date,
  //   startTime,
  //   endTime,
  // })

  console.log('[addAvailabilitySlot] mock insert:', {
    memberId: session.profile.id,
    context,
    date,
    startTime,
    endTime,
  })

  revalidatePath('/availability')
  return { success: true }
}

export async function deleteAvailabilitySlot(slotId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }

  // TODO: reemplazar con Drizzle cuando esté la DB
  // await db.delete(availabilitySlots)
  //   .where(and(
  //     eq(availabilitySlots.id, slotId),
  //     eq(availabilitySlots.memberId, session.profile.id)
  //   ))

  console.log('[deleteAvailabilitySlot] mock delete:', slotId)

  revalidatePath('/availability')
  return { success: true }
}
