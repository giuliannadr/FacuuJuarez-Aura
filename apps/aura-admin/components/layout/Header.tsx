'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
}

export function Header({ profile, pathname }: HeaderProps) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const pageTitle = Object.entries(CONTEXT_LABELS).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] ?? 'Dashboard'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/5 bg-zinc-950 px-6">
      <h1 className="text-sm font-semibold text-white">{pageTitle}</h1>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="border-white/10 text-zinc-400 text-xs">
          {profile.email}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-zinc-400 hover:text-white hover:bg-white/5"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
