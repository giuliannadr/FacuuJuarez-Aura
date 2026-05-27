'use client'

import { useState, useTransition } from 'react'
import { CalendarRange, Plus, Trash2, Loader2 } from 'lucide-react'
import { format, addWeeks } from 'date-fns'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { addWeeklySlots } from '@/app/(dashboard)/availability/actions'
import type { Role } from '@/lib/permissions'
import { cn } from '@/lib/utils'

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Días en orden Mon-Sun con su valor JS getDay() */
const DAYS = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mié', value: 3 },
  { label: 'Jue', value: 4 },
  { label: 'Vie', value: 5 },
  { label: 'Sáb', value: 6 },
  { label: 'Dom', value: 0 },
]

const timeInputClass =
  'h-9 w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 text-sm text-zinc-900 dark:text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 [color-scheme:light] dark:[color-scheme:dark]'

const dateInputClass =
  'h-9 w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 text-sm text-zinc-900 dark:text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 [color-scheme:light] dark:[color-scheme:dark]'

type TimeRange = { startTime: string; endTime: string }

interface WeeklyScheduleDialogProps {
  role: Role
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function WeeklyScheduleDialog({ role }: WeeklyScheduleDialogProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const fourWeeksOut = format(addWeeks(new Date(), 4), 'yyyy-MM-dd')

  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Estado del formulario
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]) // Lun-Vie
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([
    { startTime: '09:00', endTime: '18:00' },
  ])
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(fourWeeksOut)
  const [context, setContext] = useState<'aura' | 'facundo_solo'>('aura')
  const [error, setError] = useState<string | null>(null)

  // ── Manejadores de días ──────────────────────────────────────────────────────
  function toggleDay(value: number) {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    )
  }

  // ── Manejadores de franjas horarias ──────────────────────────────────────────
  function addRange() {
    setTimeRanges((prev) => [...prev, { startTime: '', endTime: '' }])
  }

  function removeRange(index: number) {
    setTimeRanges((prev) => prev.filter((_, i) => i !== index))
  }

  function updateRange(index: number, field: keyof TimeRange, value: string) {
    setTimeRanges((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  // ── Resetear al cerrar ────────────────────────────────────────────────────────
  function handleOpenChange(value: boolean) {
    if (!value) {
      setSelectedDays([1, 2, 3, 4, 5])
      setTimeRanges([{ startTime: '09:00', endTime: '18:00' }])
      setDateFrom(today)
      setDateTo(fourWeeksOut)
      setContext('aura')
      setError(null)
    }
    setOpen(value)
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (selectedDays.length === 0) {
      setError('Seleccioná al menos un día')
      return
    }

    startTransition(async () => {
      const result = await addWeeklySlots({
        daysOfWeek: selectedDays,
        timeRanges,
        dateFrom,
        dateTo,
        context,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      if (result.count === 0) {
        toast.info('No se agregaron slots nuevos — todos ya existían')
      } else {
        toast.success(
          `${result.count} slot${result.count !== 1 ? 's' : ''} agregado${result.count !== 1 ? 's' : ''}`
        )
      }
      handleOpenChange(false)
    })
  }

  return (
    <>
      {/* Botón disparador */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/5"
      >
        <CalendarRange className="h-3.5 w-3.5" />
        Horario semanal
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurar horario semanal</DialogTitle>
            <DialogDescription>
              Elegí los días, las franjas horarias y el período. Se generan los slots
              automáticamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Contexto (solo Facundo) ─────────────────────────────────── */}
            {role === 'facundo' && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Contexto</p>
                <div className="flex gap-2">
                  {[
                    { value: 'aura' as const, label: 'AURA' },
                    { value: 'facundo_solo' as const, label: 'Personal' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setContext(opt.value)}
                      className={cn(
                        'flex-1 rounded-md border py-2 text-xs font-medium transition-colors',
                        context === opt.value
                          ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                          : 'border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Días de la semana ──────────────────────────────────────── */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Días</p>
              <div className="flex gap-1.5">
                {DAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'flex-1 rounded-md border py-2 text-xs font-semibold transition-colors',
                      selectedDays.includes(day.value)
                        ? 'border-violet-500 bg-violet-500/15 text-violet-600 dark:text-violet-400'
                        : 'border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-600 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-600 dark:hover:text-zinc-400'
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Franjas horarias ───────────────────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Franjas horarias
                </p>
                {timeRanges.length < 8 && (
                  <button
                    type="button"
                    onClick={addRange}
                    className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Agregar franja
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {timeRanges.map((range, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-4 shrink-0 text-center text-xs text-zinc-400 dark:text-zinc-600">
                      {i + 1}
                    </span>
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="time"
                        value={range.startTime}
                        onChange={(e) => updateRange(i, 'startTime', e.target.value)}
                        className={timeInputClass}
                        required
                        disabled={isPending}
                      />
                      <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-600">–</span>
                      <input
                        type="time"
                        value={range.endTime}
                        onChange={(e) => updateRange(i, 'endTime', e.target.value)}
                        className={timeInputClass}
                        required
                        disabled={isPending}
                      />
                    </div>
                    {timeRanges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRange(i)}
                        disabled={isPending}
                        className="shrink-0 rounded p-1 text-zinc-400 dark:text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Período de fechas ──────────────────────────────────────── */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Período</p>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={dateInputClass}
                  required
                  disabled={isPending}
                />
                <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-600">hasta</span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={dateInputClass}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            {/* ── Preview textual ────────────────────────────────────────── */}
            {selectedDays.length > 0 && timeRanges.every((r) => r.startTime && r.endTime) && (
              <p className="rounded-md bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                {DAYS.filter((d) => selectedDays.includes(d.value))
                  .map((d) => d.label)
                  .join(', ')}{' '}
                ·{' '}
                {timeRanges
                  .filter((r) => r.startTime && r.endTime)
                  .map((r) => `${r.startTime}–${r.endTime}`)
                  .join(' y ')}{' '}
                · desde {dateFrom} hasta {dateTo}
              </p>
            )}

            {/* ── Error ─────────────────────────────────────────────────── */}
            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            {/* ── Acciones ──────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="rounded-md px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || selectedDays.length === 0}
                className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generando...
                  </>
                ) : (
                  'Generar slots'
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
