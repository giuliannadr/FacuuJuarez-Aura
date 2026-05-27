'use client'

import { useState, useTransition } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createMember } from '@/app/(dashboard)/team/actions'

const inputClass =
  'h-10 w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'

const labelClass = 'block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5'

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'aura_member' as 'aura_admin' | 'aura_member',
  })

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleOpenChange(value: boolean) {
    if (!value) setForm({ name: '', email: '', role: 'aura_member' })
    setOpen(value)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createMember(form)
      if (result.success) {
        toast.success('Invitación enviada correctamente')
        handleOpenChange(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md bg-violet-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500">
          <UserPlus className="h-3.5 w-3.5" />
          Agregar miembro
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar miembro al equipo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="member-name" className={labelClass}>
              Nombre completo
            </label>
            <input
              id="member-name"
              type="text"
              placeholder="Ej: Valentina López"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={inputClass}
              required
              disabled={isPending}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="member-email" className={labelClass}>
              Email
            </label>
            <input
              id="member-email"
              type="email"
              placeholder="valentina@aura.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={inputClass}
              required
              disabled={isPending}
            />
          </div>

          {/* Rol */}
          <div>
            <label htmlFor="member-role" className={labelClass}>
              Rol
            </label>
            <select
              id="member-role"
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value as 'aura_admin' | 'aura_member')}
              className={inputClass}
              disabled={isPending}
            >
              <option value="aura_member">Miembro — puede ver y gestionar su disponibilidad</option>
              <option value="aura_admin">Admin — puede gestionar eventos y equipo</option>
            </select>
          </div>

          {/* Aviso de invitación */}
          <p className="rounded-lg bg-violet-50 dark:bg-violet-500/10 px-3 py-2.5 text-xs text-violet-700 dark:text-violet-300">
            Se enviará un email al miembro con un link para que configure su propia contraseña.
          </p>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Enviando invitación...
                </>
              ) : (
                'Enviar invitación'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
