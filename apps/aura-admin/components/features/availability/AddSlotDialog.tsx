'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { addSlotSchema, type AddSlotInput } from '@/lib/schemas/availability'
import { addAvailabilitySlot } from '@/app/(dashboard)/availability/actions'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Role } from '@/lib/permissions'

interface AddSlotDialogProps {
  date: string // 'YYYY-MM-DD'
  dateLabel: string // 'Lunes 21'
  role: Role
}

export function AddSlotDialog({ date, dateLabel, role }: AddSlotDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddSlotInput>({
    resolver: zodResolver(addSlotSchema),
    defaultValues: {
      date,
      context: 'aura',
      startTime: '',
      endTime: '',
    },
  })

  async function onSubmit(data: AddSlotInput) {
    const result = await addAvailabilitySlot(data)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success('Slot agregado')
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-zinc-200 dark:border-white/10 py-1.5 text-xs text-zinc-400 dark:text-zinc-600 transition-colors hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-600 dark:hover:text-zinc-400">
          <Plus className="h-3 w-3" />
          Agregar
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar disponibilidad</DialogTitle>
          <DialogDescription>{dateLabel}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('date')} />

          {/* Context — solo visible para Facundo */}
          {role === 'facundo' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Contexto
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'aura', label: 'AURA' },
                  { value: 'facundo_solo', label: 'Personal' },
                ].map((opt) => (
                  <label key={opt.value} className="flex-1">
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('context')}
                      className="peer sr-only"
                    />
                    <span className="flex cursor-pointer items-center justify-center rounded-md border border-zinc-200 dark:border-white/10 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 transition-colors peer-checked:border-violet-500 peer-checked:bg-violet-500/10 peer-checked:text-violet-600 dark:peer-checked:text-violet-400 hover:border-zinc-300 dark:hover:border-white/20">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
                htmlFor="startTime"
              >
                Desde
              </label>
              <input
                id="startTime"
                type="time"
                {...register('startTime')}
                className="w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 [color-scheme:light] dark:[color-scheme:dark]"
              />
              {errors.startTime && (
                <p className="text-xs text-red-500 dark:text-red-400">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
                htmlFor="endTime"
              >
                Hasta
              </label>
              <input
                id="endTime"
                type="time"
                {...register('endTime')}
                className="w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 [color-scheme:light] dark:[color-scheme:dark]"
              />
              {errors.endTime && (
                <p className="text-xs text-red-500 dark:text-red-400">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-violet-600 hover:bg-violet-500"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar slot'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
