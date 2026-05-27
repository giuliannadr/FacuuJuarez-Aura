'use server'

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { db, profiles, events, contentBlocks, mediaFiles } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { can } from '@/lib/permissions'
import { sendInviteMemberEmail } from '@/lib/email'

export type ActionResult = { success: true } | { success: false; error: string }

// ─── Admin client (solo server-side, usa service role key) ───────────────────
function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurado en .env.local')
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ─── Schemas ─────────────────────────────────────────────────────────────────
const createMemberSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['aura_admin', 'aura_member']),
})

// ─── createMember ─────────────────────────────────────────────────────────────
export async function createMember(raw: unknown): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!can(session.profile.role, 'canManageTeam')) {
    return { success: false, error: 'Sin permisos para gestionar el equipo' }
  }

  const parsed = createMemberSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { name, email, role } = parsed.data

  let adminClient
  try {
    adminClient = getAdminClient()
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // 1. Generar link de invitación sin enviar el email por defecto de Supabase
  //    Usamos generateLink para poder enviar nuestro propio email con diseño custom
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      data: { full_name: name },
      redirectTo: `${appUrl}/reset-password`,
    },
  })

  if (linkError || !linkData.user || !linkData.properties?.action_link) {
    if (linkError?.message?.includes('already registered')) {
      return { success: false, error: 'Ya existe una cuenta con ese email' }
    }
    return { success: false, error: linkError?.message ?? 'Error al generar la invitación' }
  }

  // 2. Insertar perfil en DB
  try {
    await db.insert(profiles).values({
      id: linkData.user.id,
      email,
      name,
      role,
    })
  } catch {
    await adminClient.auth.admin.deleteUser(linkData.user.id)
    return { success: false, error: 'Error al guardar el perfil. Intentá de nuevo.' }
  }

  // 3. Enviar email con diseño custom via Resend
  await sendInviteMemberEmail({
    memberName: name,
    email,
    role,
    link: linkData.properties.action_link,
  })

  revalidatePath('/team')
  return { success: true }
}

// ─── deleteMember ─────────────────────────────────────────────────────────────
export async function deleteMember(memberId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'No autenticado' }
  if (!can(session.profile.role, 'canManageTeam')) {
    return { success: false, error: 'Sin permisos' }
  }
  if (memberId === session.profile.id) {
    return { success: false, error: 'No podés eliminar tu propia cuenta' }
  }

  // Verificar que el miembro existe
  const [member] = await db
    .select({ id: profiles.id, role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, memberId))
    .limit(1)

  if (!member) return { success: false, error: 'Miembro no encontrado' }

  // No se puede eliminar al dueño
  if (member.role === 'facundo') {
    return { success: false, error: 'No se puede eliminar al dueño del sistema' }
  }

  // aura_admin solo puede eliminar aura_member (no a otros admins)
  if (session.profile.role === 'aura_admin' && member.role === 'aura_admin') {
    return { success: false, error: 'Solo el dueño puede eliminar otros administradores' }
  }

  let adminClient
  try {
    adminClient = getAdminClient()
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }

  // Anular las referencias FK que no tienen cascade (evita errores de constraint)
  await db.update(events).set({ createdBy: null }).where(eq(events.createdBy, memberId))
  await db
    .update(contentBlocks)
    .set({ updatedBy: null })
    .where(eq(contentBlocks.updatedBy, memberId))
  await db.update(mediaFiles).set({ uploadedBy: null }).where(eq(mediaFiles.uploadedBy, memberId))

  // Borrar perfil de DB (cascade limpia slots, bookingParticipants y eventMembers)
  await db.delete(profiles).where(eq(profiles.id, memberId))

  // Borrar de Supabase Auth
  await adminClient.auth.admin.deleteUser(memberId)

  revalidatePath('/team')
  return { success: true }
}
