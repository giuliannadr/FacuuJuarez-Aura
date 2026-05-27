'use client'

import { useState, useTransition } from 'react'
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AddSlotDialog } from './AddSlotDialog'
import { deleteAvailabilitySlot } from '@/app/(dashboard)/availability/actions'
import type { Role } from '@/lib/permissions'

export interface SlotDisplay {
  id: string
  date: string // 'YYYY-MM-DD'
  startTime: string // 'HH:MM'
  endTime: string // 'HH:MM'
  context: 'aura' | 'facundo_solo'
}

const CONTEXT_STYLE = {
  aura: {
    bg: 'bg-sky-500/10 border-sky-500/20',
    text: 'text-sky-600 dark:text-sky-400',
    dot: 'bg-sky-400',
    label: 'AURA',
  },
  facundo_solo: {
    bg: 'bg-violet-500/10 border-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-400',
    label: 'Personal',
  },
}

interface AvailabilityGridProps {
  initialSlots: SlotDisplay[]
  role: Role
}

export function AvailabilityGrid({ initialSlots, role }: AvailabilityGridProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [isPending, startTransition] = useTransition()

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const weekLabel = `${format(weekStart, 'd MMM', { locale: es })} — ${format(addDays(weekStart, 6), 'd MMM yyyy', { locale: es })}`

  function slotsForDay(day: Date): SlotDisplay[] {
    const dayStr = format(day, 'yyyy-MM-dd')
    return initialSlots
      .filter((s) => s.date === dayStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  function handleDelete(slotId: string) {
    startTransition(async () => {
      const result = await deleteAvailabilitySlot(slotId)
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success('Slot eliminado')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekStart((w) => subWeeks(w, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-sm font-medium capitalize text-zinc-600 dark:text-zinc-300">
          {weekLabel}
        </span>

        <button
          onClick={() => setWeekStart((w) => addWeeks(w, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Leyenda (solo Facundo ve ambos contextos) */}
      {role === 'facundo' && (
        <div className="flex gap-4">
          {Object.entries(CONTEXT_STYLE).map(([key, style]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', style.dot)} />
              <span className="text-xs text-zinc-500">{style.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const slots = slotsForDay(day)
          const today = isToday(day)
          const dayName = format(day, 'EEE', { locale: es })
          const dayNum = format(day, 'd')
          const dateStr = format(day, 'yyyy-MM-dd')
          const dateLabel = format(day, "EEEE d 'de' MMMM", { locale: es })

          return (
            <div key={dateStr} className="flex flex-col gap-2">
              {/* Day header */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs capitalize text-zinc-400 dark:text-zinc-500">
                  {dayName}
                </span>
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                    today ? 'bg-violet-600 text-white' : 'text-zinc-600 dark:text-zinc-300'
                  )}
                >
                  {dayNum}
                </span>
              </div>

              {/* Slots */}
              <div className="flex flex-col gap-1.5">
                {slots.map((slot) => {
                  const style = CONTEXT_STYLE[slot.context]
                  return (
                    <div
                      key={slot.id}
                      className={cn('group relative rounded-md border px-2 py-1.5', style.bg)}
                    >
                      <p className={cn('text-xs font-medium', style.text)}>
                        {slot.startTime}–{slot.endTime}
                      </p>
                      {role === 'facundo' && (
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          {style.label}
                        </p>
                      )}
                      <button
                        onClick={() => handleDelete(slot.id)}
                        disabled={isPending}
                        className="absolute right-1 top-1 hidden rounded p-0.5 text-zinc-400 dark:text-zinc-600 transition-colors hover:text-red-500 dark:hover:text-red-400 group-hover:flex"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}

                {/* Add button */}
                <AddSlotDialog date={dateStr} dateLabel={dateLabel} role={role} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
