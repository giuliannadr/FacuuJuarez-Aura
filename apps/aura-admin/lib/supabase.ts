import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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

// Obtiene la sesión y el rol del usuario desde el server
export async function getSession() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, email, role, avatar_url')
    .eq('id', session.user.id)
    .single()

  return profile
    ? {
        ...session,
        profile: profile as {
          id: string
          name: string
          email: string
          role: Role
          avatar_url: string | null
        },
      }
    : null
}
