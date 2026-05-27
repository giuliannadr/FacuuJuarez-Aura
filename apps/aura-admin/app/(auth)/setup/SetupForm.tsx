'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createFirstAdmin } from './actions'

const inputClass =
  'w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'
const labelClass = 'block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'

export function SetupForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    startTransition(async () => {
      const result = await createFirstAdmin({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      if (result.success) {
        router.push('/login')
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="setup-name">
          Tu nombre
        </label>
        <input
          id="setup-name"
          type="text"
          placeholder="Ej: Facundo"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={inputClass}
          required
          disabled={isPending}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="setup-email">
          Email
        </label>
        <input
          id="setup-email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={inputClass}
          required
          disabled={isPending}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="setup-password">
          Contraseña
        </label>
        <input
          id="setup-password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
          className={inputClass}
          required
          minLength={8}
          disabled={isPending}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="setup-confirm">
          Confirmar contraseña
        </label>
        <input
          id="setup-confirm"
          type="password"
          placeholder="Repetí la contraseña"
          value={form.confirm}
          onChange={(e) => handleChange('confirm', e.target.value)}
          className={inputClass}
          required
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
            <Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...
          </>
        ) : (
          'Crear cuenta de dueño'
        )}
      </button>
    </form>
  )
}
