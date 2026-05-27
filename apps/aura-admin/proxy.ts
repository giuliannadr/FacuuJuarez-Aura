import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })
  response.headers.set('x-pathname', request.nextUrl.pathname)

  // ── Security headers ────────────────────────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'")

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

  // getUser() valida el JWT con el servidor de Supabase Auth (seguro)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Rutas públicas — siempre accesibles
  const isPublic =
    pathname.startsWith('/book') ||
    pathname.startsWith('/facuu') ||
    pathname.startsWith('/event/') ||
    pathname === '/login' ||
    pathname === '/setup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'

  if (isPublic) return response

  // Rutas del dashboard — requieren sesión
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
