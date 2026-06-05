'use server'

import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import { db, eventDatabases, eventDatabaseEntries, exportTokens } from '@aura/db'
import type { TemplateGroup } from '@aura/db'
import { getSession } from '@/lib/supabase'

export type ActionResult = { success: true } | { success: false; error: string }

function assertAdmin(role: string) {
  return role === 'facundo' || role === 'aura_admin'
}

function getContext(role: string): 'aura' | 'facundo_solo' {
  return role === 'facundo' ? 'facundo_solo' : 'aura'
}

// ─── Crear base de datos ──────────────────────────────────────────────────────

export async function createEventDatabase(
  name: string,
  eventDate?: string
): Promise<ActionResult & { id?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  if (!name.trim()) return { success: false, error: 'El nombre es obligatorio' }

  const [db_] = await db
    .insert(eventDatabases)
    .values({
      context: getContext(session.profile.role),
      name: name.trim(),
      eventDate: eventDate || null,
      schema: [],
      createdBy: session.profile.id,
    })
    .returning()

  revalidatePath('/database')
  return { success: true, id: db_.id }
}

// ─── Actualizar nombre / fecha ────────────────────────────────────────────────

export async function updateEventDatabase(
  id: string,
  name: string,
  eventDate?: string
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  const context = getContext(session.profile.role)
  await db
    .update(eventDatabases)
    .set({ name: name.trim(), eventDate: eventDate || null, updatedAt: new Date() })
    .where(and(eq(eventDatabases.id, id), eq(eventDatabases.context, context)))

  revalidatePath('/database')
  revalidatePath(`/database/${id}`)
  return { success: true }
}

// ─── Guardar schema ───────────────────────────────────────────────────────────

export async function saveEventDatabaseSchema(
  id: string,
  schema: TemplateGroup[]
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  const context = getContext(session.profile.role)
  await db
    .update(eventDatabases)
    .set({ schema, updatedAt: new Date() })
    .where(and(eq(eventDatabases.id, id), eq(eventDatabases.context, context)))

  revalidatePath(`/database/${id}`)
  return { success: true }
}

// ─── Eliminar base de datos ───────────────────────────────────────────────────

export async function deleteEventDatabase(id: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  const context = getContext(session.profile.role)
  await db
    .delete(eventDatabases)
    .where(and(eq(eventDatabases.id, id), eq(eventDatabases.context, context)))

  revalidatePath('/database')
  return { success: true }
}

// ─── Crear entrada ────────────────────────────────────────────────────────────

export async function createEntry(
  databaseId: string,
  templateId: string,
  data: Record<string, string>
): Promise<ActionResult & { entryId?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  const [entry] = await db
    .insert(eventDatabaseEntries)
    .values({ databaseId, templateId, data })
    .returning()

  revalidatePath(`/database/${databaseId}`)
  return { success: true, entryId: entry.id }
}

// ─── Actualizar entrada ───────────────────────────────────────────────────────

export async function updateEntry(
  entryId: string,
  data: Record<string, string>
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  const [entry] = await db
    .select()
    .from(eventDatabaseEntries)
    .where(eq(eventDatabaseEntries.id, entryId))
    .limit(1)

  if (!entry) return { success: false, error: 'Entrada no encontrada' }

  await db.update(eventDatabaseEntries).set({ data }).where(eq(eventDatabaseEntries.id, entryId))

  revalidatePath(`/database/${entry.databaseId}`)
  return { success: true }
}

// ─── Eliminar entrada ─────────────────────────────────────────────────────────

export async function deleteEntry(entryId: string, databaseId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  await db.delete(eventDatabaseEntries).where(eq(eventDatabaseEntries.id, entryId))

  revalidatePath(`/database/${databaseId}`)
  return { success: true }
}

// ─── Generar token de exportación (48h) ──────────────────────────────────────

export async function generateExportToken(
  databaseId: string
): Promise<ActionResult & { url?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!assertAdmin(session.profile.role)) return { success: false, error: 'Sin permisos' }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

  await db.insert(exportTokens).values({ databaseId, token, expiresAt })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return { success: true, url: `${appUrl}/export/${token}` }
}
