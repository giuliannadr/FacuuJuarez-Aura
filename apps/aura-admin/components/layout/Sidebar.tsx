'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  UserCircle,
  Building2,
  CalendarDays,
  Clock,
  Users,
  Settings,
  Music2,
  Sparkles,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, type Role } from '@/lib/permissions'
import { Separator } from '@/components/ui/separator'
import { CopyBookingLinkButton } from './CopyBookingLinkButton'
import type { SessionProfile } from '@/types'

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard,
  UserCircle,
  Building2,
  CalendarDays,
  Clock,
  Users,
  Settings,
  Sparkles,
}

const ROLE_LABELS: Record<Role, string> = {
  facundo: 'Super Admin',
  aura_admin: 'AURA Admin',
  aura_member: 'Miembro AURA',
}

const ROLE_COLORS: Record<Role, string> = {
  facundo: 'text-violet-500 dark:text-violet-400',
  aura_admin: 'text-sky-500 dark:text-sky-400',
  aura_member: 'text-emerald-500 dark:text-emerald-400',
}

interface SidebarProps {
  profile: SessionProfile
  isOpen: boolean
  onClose: () => void
  pendingCount: number
}

export function Sidebar({ profile, isOpen, onClose, pendingCount }: SidebarProps) {
  const pathname = usePathname()
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(profile.role))

  return (
    <aside
      className={cn(
        // Base
        'flex h-screen w-64 flex-col border-r border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950',
        // Mobile: drawer que entra desde la izquierda
        'fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: posición relativa, siempre visible
        'md:relative md:translate-x-0 md:z-auto md:transition-none'
      )}
    >
      {/* Logo + botón cerrar (mobile) */}
      <div className="flex h-16 items-center justify-between gap-2.5 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Music2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
            AURA Admin
          </span>
        </div>
        {/* Botón cerrar — solo mobile */}
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-white md:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Separator className="bg-zinc-100 dark:bg-white/5" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = ICONS[item.icon]
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const showDot = item.href === '/bookings' && pendingCount > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="flex-1">{item.label}</span>
              {showDot && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Link de reserva */}
      {(profile.role === 'facundo' || profile.role === 'aura_admin') && (
        <div className="px-3 pb-3">
          <CopyBookingLinkButton role={profile.role} variant="sidebar" />
        </div>
      )}

      <Separator className="bg-zinc-100 dark:bg-white/5" />

      {/* User info */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
              {profile.name}
            </p>
            <p className={cn('text-xs font-medium', ROLE_COLORS[profile.role])}>
              {ROLE_LABELS[profile.role]}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
