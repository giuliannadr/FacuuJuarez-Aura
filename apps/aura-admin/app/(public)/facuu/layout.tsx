import type { Metadata } from 'next'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export const metadata: Metadata = {
  title: 'Reservar una reunión — Facuu Juarez',
  description: 'Solicitá una reunión con Facuu Juarez.',
}

export default function FacuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-white/5 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Logo rojo */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold tracking-wide text-zinc-900 dark:text-white">
                Facuu Juarez
              </span>
              <span className="ml-2 text-[10px] font-medium uppercase tracking-widest text-red-500">
                DJ
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">{children}</main>
    </div>
  )
}
