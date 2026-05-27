'use client'

import { useState, useTransition } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

const inputClass =
  'h-10 w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'
const labelClass = 'block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5'

export function ChangePasswordForm({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.next !== form.confirm) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }
    if (form.next.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }
    if (form.next === form.current) {
      setError('La nueva contraseña debe ser diferente a la actual')
      return
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient()

      // 1. Re-autenticar con la contraseña actual para verificar identidad
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: form.current,
      })

      if (signInError) {
        setError('La contraseña actual es incorrecta')
        return
      }

      // 2. Actualizar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: form.next,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      setForm({ current: '', next: '', confirm: '' })
      toast.success('Contraseña actualizada correctamente')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <div>
        <label className={labelClass} htmlFor="current-password">
          Contraseña actual
        </label>
        <input
          id="current-password"
          type="password"
          placeholder="Tu contraseña actual"
          value={form.current}
          onChange={(e) => handleChange('current', e.target.value)}
          className={inputClass}
          required
          autoComplete="current-password"
          disabled={isPending}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="new-password">
          Nueva contraseña
        </label>
        <input
          id="new-password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={form.next}
          onChange={(e) => handleChange('next', e.target.value)}
          className={inputClass}
          required
          minLength={8}
          autoComplete="new-password"
          disabled={isPending}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="confirm-new-password">
          Confirmar nueva contraseña
        </label>
        <input
          id="confirm-new-password"
          type="password"
          placeholder="Repetí la nueva contraseña"
          value={form.confirm}
          onChange={(e) => handleChange('confirm', e.target.value)}
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

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Contraseña actualizada correctamente
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando...
            </>
          ) : (
            'Cambiar contraseña'
          )}
        </button>
      </div>
    </form>
  )
}
