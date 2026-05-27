import { redirect } from 'next/navigation'
import { count } from 'drizzle-orm'
import { db, profiles } from '@aura/db'
import { Music2 } from 'lucide-react'
import { SetupForm } from './SetupForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Configuración inicial — AURA Admin' }

export default async function SetupPage() {
  // Si ya existe al menos un perfil, el sistema ya está configurado
  const [{ value }] = await db.select({ value: count() }).from(profiles)
  if (value > 0) redirect('/login')

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">AURA Admin</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Primera configuración — creá tu cuenta de dueño
            </p>
          </div>
        </div>

        <SetupForm />

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          Esta pantalla solo aparece una vez. Después podés crear el resto del equipo desde el
          panel.
        </p>
      </div>
    </main>
  )
}
