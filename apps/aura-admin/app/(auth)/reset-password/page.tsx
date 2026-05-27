'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Music2, Loader2, CheckCircle2 } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

const inputClass =
  'w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'
const labelClass = 'block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    // ── Invite link (access_token en el hash) ────────────────────────────────
    // Extraemos los tokens del hash ANTES de que Supabase los procese.
    // Esto nos permite establecer la sesión EXPLÍCITAMENTE para el usuario
    // invitado, sin importar si hay otra sesión activa en el browser.
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken && refreshToken) {
      // Limpiar el hash de la URL inmediatamente (los tokens no deben quedar expuestos)
      window.history.replaceState(null, '', window.location.pathname)

      // Establecer la sesión del miembro invitado de forma explícita.
      // updateUser() usará ESTA sesión, nunca la del admin aunque esté logueado.
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (!error) setReady(true)
        })

      return // No registrar listener; el hash ya fue procesado
    }

    // ── Forgot-password link (no hay hash con tokens) ─────────────────────────
    // Supabase dispara PASSWORD_RECOVERY cuando detecta el token de recuperación.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
      } else {
        setDone(true)
        // Cerrar sesión y redirigir al login para que vuelva a entrar con la nueva contraseña
        setTimeout(async () => {
          await supabase.auth.signOut()
          router.push('/login')
        }, 2500)
      }
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
              Nueva contraseña
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Elegí una contraseña segura para acceder al panel
            </p>
          </div>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              Contraseña actualizada correctamente
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Redirigiendo al login...</p>
          </div>
        ) : !ready ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Verificando enlace...</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              Si el link expiró, pedí uno nuevo desde la pantalla de login.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="new-password">
                Nueva contraseña
              </label>
              <input
                id="new-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={isPending}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="confirm-password">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Repetí la contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
                required
                autoComplete="new-password"
                disabled={isPending}
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-violet-600 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                'Guardar nueva contraseña'
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
