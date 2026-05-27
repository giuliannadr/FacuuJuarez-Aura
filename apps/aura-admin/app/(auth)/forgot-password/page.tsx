'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Music2, ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

const inputClass =
  'w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      // Siempre mostramos éxito aunque el email no exista — no revelamos información
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      setSent(true)
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
            <Music2 className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Recuperar contraseña
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Te enviamos un link para resetearla
            </p>
          </div>
        </div>

        {sent ? (
          /* Estado: email enviado */
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
              <MailCheck className="h-8 w-8 text-emerald-500" />
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                Si ese email existe en el sistema, vas a recibir un link en los próximos minutos.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Revisá también la carpeta de spam.
              </p>
            </div>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al login
            </Link>
          </div>
        ) : (
          /* Formulario */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                htmlFor="recover-email"
              >
                Email
              </label>
              <input
                id="recover-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
                autoComplete="email"
                disabled={isPending}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-violet-600 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                </>
              ) : (
                'Enviar link de recuperación'
              )}
            </button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al login
            </Link>
          </form>
        )}
      </div>
    </main>
  )
}
