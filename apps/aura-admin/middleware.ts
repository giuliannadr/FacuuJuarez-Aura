import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { can, type Role } from '@/lib/permissions'

const PUBLIC_ROUTES = ['/login']

// Rutas que requieren permiso específico
const PROTECTED_ROUTES: { pattern: RegExp; permission: Parameters<typeof can>[1] }[] = [
  { pattern: /^\/content\/facundo/, permission: 'canEditFacundoContent' },
  { pattern: /^\/content\/aura/, permission: 'canEditAuraContent' },
  { pattern: /^\/team/, permission: 'canManageTeam' },
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Inyecta pathname como header para que Server Components puedan leerlo
  response.headers.set('x-pathname', pathname)

  const { data: { session } } = await supabase.auth.getSession()

  // Redirige a /login si no hay sesión y la ruta no es pública
  if (!session && !PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirige al dashboard si ya está logueado y va a /login
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!session) return response

  // Verifica permisos por ruta
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const role = profile?.role as Role | undefined

  if (role) {
    for (const { pattern, permission } of PROTECTED_ROUTES) {
      if (pattern.test(pathname) && !can(role, permission)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
