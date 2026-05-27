'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Loader2, Check, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { saveScheduleTemplate, applyTemplateToRange } from '@/app/(dashboard)/availability/actions'
import type { Role } from '@/lib/permissions'
import type { ScheduleTemplateDay } from '@aura/db'

// ─── Constantes ───────────────────────────────────────────────────────────────

const DAYS = [
  { label: 'Lunes', short: 'Lun', value: 1 },
  { label: 'Martes', short: 'Mar', value: 2 },
  { label: 'Miércoles', short: 'Mié', value: 3 },
  { label: 'Jueves', short: 'Jue', value: 4 },
  { label: 'Viernes', short: 'Vie', value: 5 },
  { label: 'Sábado', short: 'Sáb', value: 6 },
  { label: 'Domingo', short: 'Dom', value: 0 },
]

const WEEK_OPTIONS = [1, 2, 4, 8, 12, 26]
const DEFAULT_RANGE = { startTime: '09:00', endTime: '18:00' }

// ─── Tipos internos ───────────────────────────────────────────────────────────

type TimeRange = { startTime: string; endTime: string }
type DayState = { enabled: boolean; ranges: TimeRange[] }
type CtxDays = Record<number, DayState>
type EditorMode = 'simple' | 'custom'

interface SimpleState {
  days: number[]
  range: TimeRange
}

interface CtxState {
  mode: EditorMode
  simple: SimpleState
  custom: CtxDays
}

// ─── Helpers de inicialización ────────────────────────────────────────────────

function buildCtxDays(rows: ScheduleTemplateDay[], ctx: 'aura' | 'facundo_solo'): CtxDays {
  const filtered = rows.filter((r) => r.context === ctx)
  const state: CtxDays = {}
  for (const day of DAYS) {
    const row = filtered.find((r) => r.dayOfWeek === day.value)
    state[day.value] = row
      ? { enabled: true, ranges: row.timeRanges.length > 0 ? row.timeRanges : [DEFAULT_RANGE] }
      : { enabled: false, ranges: [DEFAULT_RANGE] }
  }
  return state
}

function initCtxState(rows: ScheduleTemplateDay[], ctx: 'aura' | 'facundo_solo'): CtxState {
  const custom = buildCtxDays(rows, ctx)
  const filtered = rows.filter((r) => r.context === ctx)

  // Estado simple: días activos + primera franja encontrada (o default)
  const simpleDays = filtered.map((r) => r.dayOfWeek)
  const firstRange = filtered.find((r) => r.timeRanges.length > 0)?.timeRanges[0] ?? DEFAULT_RANGE
  const simple: SimpleState = {
    days: simpleDays.length > 0 ? simpleDays : [1, 2, 3, 4, 5],
    range: firstRange,
  }

  // Auto-detect: si todos los días activos tienen exactamente la misma franja → simple
  const allSameSingle =
    filtered.length > 0 &&
    filtered.every(
      (r) =>
        r.timeRanges.length === 1 &&
        r.timeRanges[0].startTime === firstRange.startTime &&
        r.timeRanges[0].endTime === firstRange.endTime
    )

  return {
    mode: filtered.length === 0 || allSameSingle ? 'simple' : 'custom',
    simple,
    custom,
  }
}

// ─── Input de hora ────────────────────────────────────────────────────────────

const timeInputClass =
  'h-8 w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 text-xs text-zinc-900 dark:text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 [color-scheme:light] dark:[color-scheme:dark]'

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  initialRows: ScheduleTemplateDay[]
  role: Role
}

export function ScheduleTemplateEditor({ initialRows, role }: Props) {
  // Facundo usa 'aura' como contexto canónico para su horario general.
  // buildAvailableSlots ya muestra esos slots en /facuu y en /book sin distinción.
  const context = 'aura' as const

  // Un solo estado (no hay toggle de contexto)
  const [states, setStates] = useState<Record<'aura' | 'facundo_solo', CtxState>>({
    aura: initCtxState(initialRows, 'aura'),
    facundo_solo: initCtxState(initialRows, 'facundo_solo'),
  })

  const [weeks, setWeeks] = useState(4)
  const [isPendingSave, startSave] = useTransition()
  const [isPendingApply, startApply] = useTransition()
  const [justSaved, setJustSaved] = useState(false)

  const state = states[context]
  const mode = state.mode

  // ── Helpers de mutación ──────────────────────────────────────────────────────

  function updateCtx(updater: (prev: CtxState) => CtxState) {
    setStates((prev) => ({ ...prev, [context]: updater(prev[context]) }))
  }

  // ── Cambio de modo ────────────────────────────────────────────────────────────

  function switchMode(next: EditorMode) {
    if (next === mode) return
    updateCtx((cur) => {
      if (next === 'custom') {
        // Simple → Custom: propagar la franja común a cada día seleccionado
        const newCustom = { ...cur.custom }
        for (const day of DAYS) {
          newCustom[day.value] = cur.simple.days.includes(day.value)
            ? { enabled: true, ranges: [cur.simple.range] }
            : { ...cur.custom[day.value], enabled: false }
        }
        return { ...cur, mode: 'custom', custom: newCustom }
      } else {
        // Custom → Simple: tomar los días activos y la primera franja del primer día
        const enabledDows = DAYS.map((d) => d.value).filter((dow) => cur.custom[dow].enabled)
        const firstDow = enabledDows[0]
        const firstRange =
          firstDow !== undefined && cur.custom[firstDow].ranges.length > 0
            ? cur.custom[firstDow].ranges[0]
            : DEFAULT_RANGE
        return {
          ...cur,
          mode: 'simple',
          simple: {
            days: enabledDows.length > 0 ? enabledDows : [1, 2, 3, 4, 5],
            range: firstRange,
          },
        }
      }
    })
  }

  // ── Handlers modo simple ─────────────────────────────────────────────────────

  function toggleSimpleDay(dow: number) {
    updateCtx((cur) => ({
      ...cur,
      simple: {
        ...cur.simple,
        days: cur.simple.days.includes(dow)
          ? cur.simple.days.filter((d) => d !== dow)
          : [...cur.simple.days, dow],
      },
    }))
  }

  function updateSimpleRange(field: keyof TimeRange, value: string) {
    updateCtx((cur) => ({
      ...cur,
      simple: { ...cur.simple, range: { ...cur.simple.range, [field]: value } },
    }))
  }

  // ── Handlers modo personalizado ───────────────────────────────────────────────

  function toggleCustomDay(dow: number) {
    updateCtx((cur) => ({
      ...cur,
      custom: {
        ...cur.custom,
        [dow]: { ...cur.custom[dow], enabled: !cur.custom[dow].enabled },
      },
    }))
  }

  function addRange(dow: number) {
    updateCtx((cur) => ({
      ...cur,
      custom: {
        ...cur.custom,
        [dow]: {
          ...cur.custom[dow],
          ranges: [...cur.custom[dow].ranges, { startTime: '', endTime: '' }],
        },
      },
    }))
  }

  function removeRange(dow: number, idx: number) {
    updateCtx((cur) => ({
      ...cur,
      custom: {
        ...cur.custom,
        [dow]: { ...cur.custom[dow], ranges: cur.custom[dow].ranges.filter((_, i) => i !== idx) },
      },
    }))
  }

  function updateCustomRange(dow: number, idx: number, field: keyof TimeRange, value: string) {
    updateCtx((cur) => ({
      ...cur,
      custom: {
        ...cur.custom,
        [dow]: {
          ...cur.custom[dow],
          ranges: cur.custom[dow].ranges.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
        },
      },
    }))
  }

  // ── Construir activeDays según modo activo ────────────────────────────────────

  function buildActiveDays() {
    if (mode === 'simple') {
      return state.simple.days.map((dow) => ({
        dayOfWeek: dow,
        timeRanges: [state.simple.range],
      }))
    }
    return DAYS.filter((d) => state.custom[d.value].enabled).map((d) => ({
      dayOfWeek: d.value,
      timeRanges: state.custom[d.value].ranges,
    }))
  }

  const enabledCount =
    mode === 'simple'
      ? state.simple.days.length
      : DAYS.filter((d) => state.custom[d.value].enabled).length

  // ── Guardar ───────────────────────────────────────────────────────────────────

  function handleSave() {
    const activeDays = buildActiveDays()
    startSave(async () => {
      const result = await saveScheduleTemplate({ context, activeDays })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setJustSaved(true)
      toast.success('Horario base guardado')
      setTimeout(() => setJustSaved(false), 2000)
    })
  }

  // ── Aplicar ───────────────────────────────────────────────────────────────────

  function handleApply() {
    startApply(async () => {
      const result = await applyTemplateToRange({ context, weeks })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      if (result.count === 0) {
        toast.info('No se agregaron slots nuevos — todos ya existían en el calendario')
      } else {
        toast.success(
          `${result.count} slot${result.count !== 1 ? 's' : ''} agregado${result.count !== 1 ? 's' : ''} al calendario`
        )
      }
    })
  }

  // ─── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-5 space-y-5">
      {/* ── Encabezado + selector de modo ──────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Horario base</h3>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Configurá tu horario habitual y aplicalo al calendario con un click.
          </p>
        </div>

        {/* Segmented control de modo */}
        <div className="flex rounded-md border border-zinc-200 dark:border-white/10 p-0.5 gap-0.5 shrink-0">
          {(
            [
              ['simple', 'Simple'],
              ['custom', 'Personalizado'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => switchMode(val)}
              className={cn(
                'rounded px-3 py-1 text-xs font-medium transition-colors',
                mode === val
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Facundo configura un único horario general — sin toggle de contexto */}

      {/* ── MODO SIMPLE ────────────────────────────────────────────────────────── */}
      {mode === 'simple' && (
        <div className="space-y-4">
          {/* Pills de días */}
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Días</p>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((day) => {
                const active = state.simple.days.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleSimpleDay(day.value)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                      active
                        ? 'border-violet-500 bg-violet-500/15 text-violet-600 dark:text-violet-400'
                        : 'border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-600 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-600 dark:hover:text-zinc-400'
                    )}
                  >
                    {day.short}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Franja única */}
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Horario</p>
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="time"
                value={state.simple.range.startTime}
                onChange={(e) => updateSimpleRange('startTime', e.target.value)}
                className={timeInputClass}
              />
              <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-600">–</span>
              <input
                type="time"
                value={state.simple.range.endTime}
                onChange={(e) => updateSimpleRange('endTime', e.target.value)}
                className={timeInputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODO PERSONALIZADO ─────────────────────────────────────────────────── */}
      {mode === 'custom' && (
        <div className="space-y-3">
          {DAYS.map((day) => {
            const dayState = state.custom[day.value]
            return (
              <div key={day.value} className="flex items-start gap-3">
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggleCustomDay(day.value)}
                  aria-label={dayState.enabled ? `Desactivar ${day.label}` : `Activar ${day.label}`}
                  className={cn(
                    'mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full border transition-all',
                    dayState.enabled
                      ? 'border-violet-500 bg-violet-500'
                      : 'border-zinc-300 dark:border-white/20 bg-zinc-100 dark:bg-white/10'
                  )}
                >
                  <span
                    className={cn(
                      'ml-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                      dayState.enabled && 'translate-x-4'
                    )}
                  />
                </button>

                {/* Nombre */}
                <span
                  className={cn(
                    'mt-0.5 w-7 shrink-0 text-xs font-semibold',
                    dayState.enabled
                      ? 'text-zinc-700 dark:text-zinc-200'
                      : 'text-zinc-400 dark:text-zinc-600'
                  )}
                >
                  {day.short}
                </span>

                {/* Franjas o "Sin horario" */}
                {dayState.enabled ? (
                  <div className="flex flex-1 flex-col gap-1.5">
                    {dayState.ranges.map((range, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={range.startTime}
                          onChange={(e) =>
                            updateCustomRange(day.value, idx, 'startTime', e.target.value)
                          }
                          className={timeInputClass}
                        />
                        <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-600">–</span>
                        <input
                          type="time"
                          value={range.endTime}
                          onChange={(e) =>
                            updateCustomRange(day.value, idx, 'endTime', e.target.value)
                          }
                          className={timeInputClass}
                        />
                        {dayState.ranges.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRange(day.value, idx)}
                            className="shrink-0 rounded p-0.5 text-zinc-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {dayState.ranges.length < 4 && (
                      <button
                        type="button"
                        onClick={() => addRange(day.value)}
                        className="flex items-center gap-1 self-start text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        Agregar franja
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="mt-0.5 text-xs text-zinc-300 dark:text-zinc-700">
                    Sin horario
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Acciones ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-zinc-100 dark:border-white/5 pt-4">
        {/* Guardar */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPendingSave || isPendingApply || enabledCount === 0}
          className="flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
        >
          {isPendingSave ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Guardando...
            </>
          ) : justSaved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Guardado
            </>
          ) : (
            'Guardar horario base'
          )}
        </button>

        <div className="hidden sm:block h-5 w-px bg-zinc-200 dark:bg-white/10" />

        {/* Aplicar al calendario */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Generar slots — próximas</span>
          <select
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            disabled={isPendingApply || isPendingSave}
            className="h-7 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 text-xs text-zinc-900 dark:text-white focus:border-violet-500 focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
          >
            {WEEK_OPTIONS.map((w) => (
              <option key={w} value={w}>
                {w} {w === 1 ? 'semana' : 'semanas'}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleApply}
            disabled={isPendingApply || isPendingSave || enabledCount === 0}
            className="flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:border-violet-400 dark:hover:border-violet-500/50 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-60"
          >
            {isPendingApply ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3" />
                Aplicar
              </>
            )}
          </button>
        </div>
      </div>

      {enabledCount === 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {mode === 'simple'
            ? 'Seleccioná al menos un día para guardar o aplicar el horario.'
            : 'Activá al menos un día para guardar o aplicar el horario.'}
        </p>
      )}
    </div>
  )
}
