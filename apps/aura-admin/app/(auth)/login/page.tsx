import { LoginForm } from './LoginForm'
import { Music2 } from 'lucide-react'

export const metadata = { title: 'Iniciar sesión — AURA Admin' }

export default function LoginPage() {
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
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Ingresá con tu cuenta</p>
          </div>
        </div>

        {/* Form */}
        <LoginForm />

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          Acceso restringido — solo personal autorizado
        </p>
      </div>
    </main>
  )
}
