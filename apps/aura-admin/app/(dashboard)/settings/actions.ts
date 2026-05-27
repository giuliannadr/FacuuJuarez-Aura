'use server'

import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { db, contentBlocks } from '@aura/db'
import { getSession } from '@/lib/supabase'

export type ActionResult = { success: true } | { success: false; error: string }

/**
 * Guarda el nombre que aparece en el formulario público de reserva de AURA
 * (campo "Con ____"). Solo pueden cambiarlo admins y coordinadores.
 */
export async function saveBookingContactName(name: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }

  const { profile } = session
  const isAdmin =
    profile.role === 'facundo' || profile.role === 'aura_admin' || profile.isCoordinator

  if (!isAdmin) return { success: false, error: 'Sin permisos' }

  const trimmed = name.trim()

  await db
    .insert(contentBlocks)
    .values({
      site: 'aura',
      section: 'booking',
      key: 'contact_name',
      value: trimmed,
      updatedBy: profile.id,
    })
    .onConflictDoUpdate({
      target: [contentBlocks.site, contentBlocks.section, contentBlocks.key],
      set: { value: trimmed, updatedAt: new Date(), updatedBy: profile.id },
    })

  revalidatePath('/book')
  revalidatePath('/settings')
  return { success: true }
}
