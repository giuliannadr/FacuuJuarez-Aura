import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db, profiles } from '@aura/db'
import type { Role } from './permissions'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server Component / Route Handler / Server Action
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
      },
    },
  })
}

/**
 * Obtiene el usuario autenticado + su perfil desde el server.
 *
 * - Usa `getUser()` en lugar de `getSession()` para validar el JWT
 *   contra el servidor de Supabase Auth (no solo desde cookies).
 * - Usa Drizzle (conexión directa a postgres) para leer el perfil,
 *   lo que bypasea RLS y no depende del cliente Supabase REST.
 */
export async function getSession() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  // Drizzle bypasea RLS → funciona aunque la tabla profiles tenga RLS sin políticas
  const [profile] = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      email: profiles.email,
      role: profiles.role,
      avatarUrl: profiles.avatarUrl,
      isCoordinator: profiles.isCoordinator,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (!profile) return null

  return {
    user,
    profile: {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as Role,
      avatar_url: profile.avatarUrl,
      isCoordinator: profile.isCoordinator,
    },
  }
}
