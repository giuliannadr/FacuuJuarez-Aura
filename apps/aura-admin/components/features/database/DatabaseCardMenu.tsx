'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { updateEventDatabase, deleteEventDatabase } from '@/app/(dashboard)/database/actions'
import { EventDatePicker } from '@/components/ui/booking-inputs'
import { cn } from '@/lib/utils'

const inputCls =
  'w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors'

interface DatabaseCardMenuProps {
  dbId: string
  dbName: string
  dbDate: string | null
}

export function DatabaseCardMenu({ dbId, dbName, dbDate }: DatabaseCardMenuProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(dbName)
  const [date, setDate] = useState(dbDate ?? '')
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  function handleEdit() {
    setMenuOpen(false)
    setName(dbName)
    setDate(dbDate ?? '')
    setEditOpen(true)
  }

  function handleSave() {
    if (!name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    startTransition(async () => {
      const r = await updateEventDatabase(dbId, name, date || undefined)
      if (r.success) {
        toast.success('Actualizado')
        setEditOpen(false)
        router.refresh()
      } else toast.error(r.error)
    })
  }

  function handleDelete() {
    setMenuOpen(false)
    if (!confirm(`¿Eliminar "${dbName}" y todos sus registros? Esta acción no se puede deshacer.`))
      return
    startDeleteTransition(async () => {
      const r = await deleteEventDatabase(dbId)
      if (r.success) {
        toast.success('Base de datos eliminada')
        router.refresh()
      } else toast.error(r.error)
    })
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={(e) => {
            e.preventDefault()
            setMenuOpen((v) => !v)
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <MoreHorizontal className="h-3.5 w-3.5" />
          )}
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-lg py-1 overflow-hidden">
              <button
                onClick={handleEdit}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar
              </button>
              <button
                onClick={handleDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            </div>
          </>
        )}
      </div>

      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => e.target === e.currentTarget && setEditOpen(false)}
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Editar base de datos</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
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
                onClick={() => setEditOpen(false)}
                className="flex-1 rounded-lg border border-zinc-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
