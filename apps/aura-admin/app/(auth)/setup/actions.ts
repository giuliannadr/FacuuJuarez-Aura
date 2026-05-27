'use server'

import { count } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { db, profiles } from '@aura/db'

const setupSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export async function createFirstAdmin(
  raw: unknown
): Promise<{ success: true } | { success: false; error: string }> {
  // Doble verificación server-side: solo si no hay ningún perfil
  const [{ value }] = await db.select({ value: count() }).from(profiles)
  if (value > 0) {
    return { success: false, error: 'El sistema ya está configurado' }
  }

  const parsed = setupSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { name, email, password } = parsed.data

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  if (authError || !data.user) {
    return { success: false, error: authError?.message ?? 'Error al crear el usuario' }
  }

  try {
    await db.insert(profiles).values({
      id: data.user.id,
      email,
      name,
      role: 'facundo',
    })
  } catch {
    await adminClient.auth.admin.deleteUser(data.user.id)
    return { success: false, error: 'Error al guardar el perfil. Intentá de nuevo.' }
  }

  return { success: true }
}
