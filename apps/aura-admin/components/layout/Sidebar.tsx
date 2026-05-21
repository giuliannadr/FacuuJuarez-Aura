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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, type Role } from '@/lib/permissions'
import { Separator } from '@/components/ui/separator'
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
  facundo: 'text-violet-400',
  aura_admin: 'text-sky-400',
  aura_member: 'text-emerald-400',
}

interface SidebarProps {
  profile: SessionProfile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(profile.role))

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-white/5 bg-zinc-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
          <Music2 className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">AURA Admin</span>
      </div>

      <Separator className="bg-white/5" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = ICONS[item.icon]
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {item.label}
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-white/5" />

      {/* User info */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{profile.name}</p>
            <p className={cn('text-xs font-medium', ROLE_COLORS[profile.role])}>
              {ROLE_LABELS[profile.role]}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
