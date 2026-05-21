import type { Metadata } from 'next'
import { Music2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Reservar una reunión — AURA',
  description: 'Solicitá una reunión con el equipo de AURA Agency.',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
            <Music2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">AURA Agency</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
    </div>
  )
}
