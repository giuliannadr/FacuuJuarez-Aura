'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import type { SessionProfile } from '@/types'

interface DashboardShellProps {
  profile: SessionProfile
  pathname: string
  pendingCount: number
  children: React.ReactNode
}

export function DashboardShell({ profile, pathname, pendingCount, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-zinc-950">
      {/* Overlay móvil — cierra el sidebar al tocar fuera */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        profile={profile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={pendingCount}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header profile={profile} pathname={pathname} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
