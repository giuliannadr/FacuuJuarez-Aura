'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createEventDatabase } from '@/app/(dashboard)/database/actions'
import { EventDatePicker } from '@/components/ui/booking-inputs'
import { cn } from '@/lib/utils'

const inputCls =
  'w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors'

export function CreateDatabaseButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleClose() {
    setOpen(false)
    setName('')
    setDate('')
  }

  function handleCreate() {
    if (!name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    startTransition(async () => {
      const result = await createEventDatabase(name, date || undefined)
      if (result.success && result.id) {
        toast.success('Base de datos creada')
        handleClose()
        router.push(`/database/${result.id}`)
      } else if (!result.success) {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
      >
        <Plus className="h-4 w-4" />
        Nueva base de datos
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Nueva base de datos</h3>
              <button
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Nombre del evento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="Ej: Fiesta de XV de Sofía"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Fecha del evento
                </label>
                <EventDatePicker value={date} onChange={setDate} inputClass={inputCls} />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleClose}
                className="flex-1 rounded-lg border border-zinc-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={isPending || !name.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
