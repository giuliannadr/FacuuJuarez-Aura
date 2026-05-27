'use client'

import { LogOut, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import type { SessionProfile } from '@/types'

const CONTEXT_LABELS: Record<string, string> = {
  '/content/facundo': 'Contenido — Facundo',
  '/content/aura': 'Contenido — AURA',
  '/bookings': 'Reservas',
  '/availability': 'Mi disponibilidad',
  '/team': 'Equipo',
  '/settings': 'Configuración',
  '/dashboard': 'Dashboard',
}

interface HeaderProps {
  profile: SessionProfile
  pathname: string
  onMenuClick: () => void
}

export function Header({ profile, pathname, onMenuClick }: HeaderProps) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const pageTitle =
    Object.entries(CONTEXT_LABELS).find(([key]) => pathname.startsWith(key))?.[1] ?? 'Dashboard'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950 px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — solo visible en mobile */}
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-white md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-sm font-semibold text-zinc-900 dark:text-white">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Email — oculto en mobile para no saturar */}
        <Badge
          variant="outline"
          className="hidden sm:flex border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 text-xs max-w-[200px] truncate"
        >
          {profile.email}
        </Badge>

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
