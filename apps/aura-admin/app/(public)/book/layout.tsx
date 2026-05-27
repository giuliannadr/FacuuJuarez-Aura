import type { Metadata } from 'next'
import { Music2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export const metadata: Metadata = {
  title: 'Reservar una reunión — AURA',
  description: 'Solicitá una reunión con el equipo de AURA Agency.',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-white/5 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
              <Music2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">AURA Agency</span>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">{children}</main>
    </div>
  )
}
