'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  format,
  parseISO,
  startOfDay,
  isBefore,
  isToday,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  ClipboardList,
  CalendarPlus,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { createClientBooking } from '@/app/(dashboard)/bookings/actions'
import { tryLockSlot, releaseLock, getAvailableSlots } from './slotActions'
import { EVENT_TYPES, createClientBookingSchema } from '@/lib/schemas/booking'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AvailableSlotData } from '@/lib/slotUtils'

// ─── Tema de colores ──────────────────────────────────────────────────────────

export type BookingTheme = 'violet' | 'red'

const THEME = {
  violet: {
    calDay: 'bg-violet-600',
    calDot: 'bg-violet-500',
    stepDone: 'border-violet-500 bg-violet-500 text-white',
    stepActive: 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400',
    stepLine: 'bg-violet-500',
    slotSel: 'border-violet-500 bg-violet-500/10',
    slotSelTxt: 'text-violet-600 dark:text-violet-400',
    radioSel:
      'peer-checked:border-violet-500 peer-checked:bg-violet-500/10 peer-checked:text-violet-600 dark:peer-checked:text-violet-400',
    djSel: 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    djCheck: 'text-violet-500',
    btn: 'bg-violet-600 hover:bg-violet-500 disabled:opacity-40',
    inputFocus: 'focus:border-violet-500 focus:ring-violet-500',
    countdown: 'border-violet-500/20 bg-violet-500/5 text-violet-700 dark:text-violet-400',
  },
  red: {
    calDay: 'bg-red-600',
    calDot: 'bg-red-500',
    stepDone: 'border-red-500 bg-red-500 text-white',
    stepActive: 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400',
    stepLine: 'bg-red-500',
    slotSel: 'border-red-500 bg-red-500/10',
    slotSelTxt: 'text-red-600 dark:text-red-400',
    radioSel:
      'peer-checked:border-red-500 peer-checked:bg-red-500/10 peer-checked:text-red-600 dark:peer-checked:text-red-400',
    djSel: 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300',
    djCheck: 'text-red-500',
    btn: 'bg-red-600 hover:bg-red-500 disabled:opacity-40',
    inputFocus: 'focus:border-red-500 focus:ring-red-500',
    countdown: 'border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-400',
  },
} as const

type ThemeValues = (typeof THEME)[BookingTheme]

// ─── Types ────────────────────────────────────────────────────────────────────

interface DjMember {
  id: string
  name: string
}

interface BookingFlowProps {
  coordinatorId: string
  /** Nombre que aparece en "Con ____". Si no se pasa, no se muestra. */
  contactName?: string | null
  availableSlots: AvailableSlotData[]
  context: 'aura' | 'facundo_solo'
  /** Ocultar selección de DJs (para Facuu personal) */
  showDjPreference?: boolean
  /** Lista de DJs para elegir */
  djMembers?: DjMember[]
  /** Nombre de la marca (para calendario e ICS) */
  brandName?: string
  /** Paleta de color del formulario */
  theme?: BookingTheme
}

const LOCK_SECONDS = 300 // 5 minutos para completar el formulario

function fmtCountdown(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Fecha y hora', icon: CalendarDays },
  { label: 'Tus datos', icon: ClipboardList },
]

function StepBar({ current, t }: { current: number; t: ThemeValues }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  done && t.stepDone,
                  active && t.stepActive,
                  !done &&
                    !active &&
                    'border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-600'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  active
                    ? 'text-zinc-600 dark:text-zinc-300'
                    : done
                      ? 'text-zinc-400 dark:text-zinc-500'
                      : 'text-zinc-300 dark:text-zinc-700'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 mb-5 h-[1px] flex-1 transition-colors',
                  i < current ? t.stepLine : 'bg-zinc-200 dark:bg-white/5'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Calendario ───────────────────────────────────────────────────────────────

const DAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function BookingCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
  t,
}: {
  availableDates: Set<string>
  selectedDate: string | null
  onSelectDate: (date: string) => void
  t: ThemeValues
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const todayStart = startOfDay(new Date())
  const isFirstMonth = isSameMonth(currentMonth, new Date())

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          disabled={isFirstMonth}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-200">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>

        <button
          type="button"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[11px] font-medium text-zinc-400 dark:text-zinc-600"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const inMonth = isSameMonth(day, currentMonth)
          const isPast = isBefore(day, todayStart)
          const isAvail = availableDates.has(dateStr)
          const isSelected = selectedDate === dateStr
          const isTodayDate = isToday(day)

          if (!inMonth) return <div key={dateStr} />

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => !isPast && isAvail && onSelectDate(dateStr)}
              disabled={isPast || !isAvail}
              className={cn(
                'relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all',
                isPast && 'cursor-not-allowed text-zinc-300 dark:text-zinc-700',
                isAvail &&
                  !isSelected &&
                  !isPast &&
                  'cursor-pointer bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-400',
                isSelected && cn(t.calDay, 'text-white shadow-sm'),
                !isAvail && !isPast && 'cursor-not-allowed text-zinc-400 dark:text-zinc-500'
              )}
            >
              {format(day, 'd')}
              {isTodayDate && !isSelected && (
                <span
                  className={cn(
                    'absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full',
                    t.calDot
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-5 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-emerald-500/40 bg-emerald-500/30" />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn('h-3 w-3 rounded-full', t.calDay)} />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">Seleccionado</span>
        </div>
      </div>
    </div>
  )
}

// ─── Esquema del formulario del cliente ───────────────────────────────────────

const clientFormSchema = createClientBookingSchema.omit({
  context: true,
  coordinatorId: true,
  date: true,
  startTime: true,
  endTime: true,
})

type ClientFormValues = z.infer<typeof clientFormSchema>

// ─── Main component ───────────────────────────────────────────────────────────

export function BookingFlow({
  coordinatorId,
  contactName,
  availableSlots: initialSlots,
  context,
  showDjPreference = true,
  djMembers = [],
  brandName = 'AURA',
  theme = 'violet',
}: BookingFlowProps) {
  const t = THEME[theme]

  // inputClass con colores de foco según tema
  const inputClass = cn(
    'w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1',
    t.inputFocus
  )

  // ── Estado principal ───────────────────────────────────────────────────────
  const [slots, setSlots] = useState<AvailableSlotData[]>(initialSlots)
  const [step, setStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(
    null
  )
  const [selectedDjs, setSelectedDjs] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // ── Estado de lock ─────────────────────────────────────────────────────────
  const [isLocking, setIsLocking] = useState(false)
  const [lockToken, setLockToken] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(LOCK_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Countdown: arranca cuando lockToken se setea, se detiene cuando se limpia ─
  useEffect(() => {
    if (!lockToken) return

    setCountdown(LOCK_SECONDS)
    let remaining = LOCK_SECONDS

    intervalRef.current = setInterval(() => {
      remaining -= 1
      setCountdown(remaining)

      if (remaining <= 0) {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        void releaseLock(lockToken)
        void getAvailableSlots(coordinatorId, context).then(setSlots)
        setLockToken(null)
        setSelectedSlot(null)
        setStep(0)
        setServerError('El tiempo expiró. Por favor, elegí el horario nuevamente.')
      }
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [lockToken, coordinatorId, context])

  // ── Form ──────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({ resolver: zodResolver(clientFormSchema) })

  const watchedEventType = watch('eventType')

  // ── Multi-select de DJs ───────────────────────────────────────────────────
  function toggleDj(name: string) {
    setSelectedDjs((prev) => {
      const next = prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
      setValue('djPreference', next.join(', '))
      return next
    })
  }

  // ── Slots agrupados por fecha ─────────────────────────────────────────────
  function getSlotsByDate(): Map<string, { startTime: string; endTime: string }[]> {
    const grouped = new Map<string, { startTime: string; endTime: string }[]>()
    for (const slot of slots) {
      if (!grouped.has(slot.date)) grouped.set(slot.date, [])
      grouped.get(slot.date)!.push({ startTime: slot.startTime, endTime: slot.endTime })
    }
    return grouped
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  // ── handleContinue: intenta adquirir el lock antes de avanzar ────────────
  async function handleContinue() {
    if (!selectedDate || !selectedSlot) return
    setServerError(null)
    setIsLocking(true)

    const result = await tryLockSlot(coordinatorId, context, selectedDate, selectedSlot.startTime)

    if (result.success) {
      setLockToken(result.lockToken)
      setStep(1)
    } else {
      setSlots((prev) =>
        prev.filter((s) => !(s.date === selectedDate && s.startTime === selectedSlot.startTime))
      )
      setSelectedSlot(null)
      setServerError('Este horario acaba de ser tomado. Por favor, elegí otro horario.')
      void getAvailableSlots(coordinatorId, context).then(setSlots)
    }

    setIsLocking(false)
  }

  // ── handleBack: vuelve al paso 0 liberando el lock si existe ─────────────
  function handleBack() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (lockToken) {
      void releaseLock(lockToken)
      setLockToken(null)
    }
    setServerError(null)
    setStep(0)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function onSubmit(formData: ClientFormValues) {
    if (!selectedDate || !selectedSlot) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const result = await createClientBooking(
      {
        context,
        coordinatorId,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        ...formData,
      },
      lockToken ?? undefined
    )

    if (result.success) {
      setLockToken(null)
      setDone(true)
    } else {
      setServerError(result.error)
      if (result.error.includes('horario') || result.error.includes('tiempo')) {
        setLockToken(null)
        setSelectedDate(null)
        setSelectedSlot(null)
        setStep(0)
        void getAvailableSlots(coordinatorId, context).then(setSlots)
      }
    }
  }

  // ── Pantalla de éxito ─────────────────────────────────────────────────────
  if (done && selectedDate && selectedSlot) {
    const googleUrl = buildGoogleCalendarUrl(
      selectedDate,
      selectedSlot.startTime,
      selectedSlot.endTime,
      contactName,
      brandName
    )

    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
          <Check className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            ¡Solicitud enviada!
          </h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Te enviamos un email con los detalles. Nos comunicaremos para confirmar la reunión.
          </p>
        </div>

        <div className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.02] px-6 py-4 text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
            Detalle
          </p>
          <p className="mt-2 font-semibold capitalize text-zinc-900 dark:text-white">
            {format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {selectedSlot.startTime} – {selectedSlot.endTime}
            <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-600">45 min</span>
          </p>
          {contactName && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Con {contactName}</p>
          )}
        </div>

        <div className="w-full max-w-sm space-y-2">
          <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <CalendarPlus className="h-3.5 w-3.5" />
            Guardalo en tu calendario
          </p>
          <div className="flex gap-3">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 transition-all hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.04]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google Calendar
            </a>
            <button
              type="button"
              onClick={() =>
                downloadICS(
                  selectedDate,
                  selectedSlot.startTime,
                  selectedSlot.endTime,
                  contactName,
                  brandName
                )
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 transition-all hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.04]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="17"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M8 2v4M16 2v4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Apple / Outlook
            </button>
          </div>
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
            El .ics funciona con Apple Calendar, Outlook y cualquier otro calendario.
          </p>
        </div>
      </div>
    )
  }

  const slotsByDate = getSlotsByDate()
  const availableDates = new Set(slotsByDate.keys())
  const slotsForDay = selectedDate ? (slotsByDate.get(selectedDate) ?? []) : []

  return (
    <div className="space-y-8">
      <StepBar current={step} t={t} />

      {/* ─── Step 0: Fecha y hora ──────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-6">
          {serverError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {serverError}
            </div>
          )}

          {availableDates.size === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 dark:border-white/10 p-8 text-center">
              <p className="text-sm text-zinc-400 dark:text-zinc-600">
                No hay turnos disponibles en este momento. Volvé pronto.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-5 space-y-6">
              <BookingCalendar
                availableDates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                t={t}
              />

              {selectedDate && (
                <div className="space-y-3 border-t border-zinc-100 dark:border-white/5 pt-4">
                  <p className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-200">
                    {format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es })}
                    <span className="ml-2 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                      · Reuniones de 45 min
                    </span>
                  </p>

                  {slotsForDay.length === 0 ? (
                    <p className="text-sm text-zinc-400 dark:text-zinc-600">
                      No hay horarios disponibles para este día.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slotsForDay
                        .slice()
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((slot) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime
                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={cn(
                                'rounded-lg border px-3 py-2 text-left transition-all',
                                isSelected
                                  ? t.slotSel
                                  : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.04]'
                              )}
                            >
                              <span
                                className={cn(
                                  'block text-sm font-semibold',
                                  isSelected ? t.slotSelTxt : 'text-zinc-700 dark:text-zinc-200'
                                )}
                              >
                                {slot.startTime}
                              </span>
                              <span className="block text-[10px] text-zinc-400 dark:text-zinc-600">
                                hasta {slot.endTime}
                              </span>
                            </button>
                          )
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleContinue}
            disabled={!selectedDate || !selectedSlot || isLocking}
            className={cn('w-full', t.btn)}
          >
            {isLocking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando disponibilidad…
              </>
            ) : (
              'Continuar'
            )}
          </Button>
        </div>
      )}

      {/* ─── Step 1: Datos del cliente ─────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Resumen de selección + countdown */}
          {selectedDate && selectedSlot && (
            <div className="rounded-lg border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.02] px-4 py-3 text-sm">
              <p className="font-medium capitalize text-zinc-900 dark:text-white">
                {format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es })}
                {' · '}
                {selectedSlot.startTime} – {selectedSlot.endTime}
              </p>
              {contactName && (
                <p className="mt-0.5 text-zinc-400 dark:text-zinc-500">Con {contactName}</p>
              )}
            </div>
          )}

          {/* Countdown */}
          {lockToken && (
            <div
              className={cn(
                'flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors',
                countdown <= 60
                  ? 'border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400'
                  : t.countdown
              )}
            >
              <Clock className={cn('h-4 w-4 shrink-0', countdown <= 60 && 'animate-pulse')} />
              <span className="flex-1">
                Turno reservado — completá el formulario en{' '}
                <span className="font-bold tabular-nums">{fmtCountdown(countdown)}</span>
              </span>
            </div>
          )}

          {/* Nombre y email */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo *" error={errors.clientName?.message}>
              <input {...register('clientName')} placeholder="Tu nombre" className={inputClass} />
            </Field>
            <Field label="Email *" error={errors.clientEmail?.message}>
              <input
                {...register('clientEmail')}
                type="email"
                placeholder="tu@email.com"
                className={inputClass}
              />
            </Field>
          </div>

          {/* WhatsApp */}
          <Field label="WhatsApp *" error={errors.clientPhone?.message}>
            <input
              {...register('clientPhone')}
              type="tel"
              inputMode="tel"
              placeholder="+5491112345678"
              className={inputClass}
            />
            {!errors.clientPhone && (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-600">
                Solo dígitos con código de país, sin espacios ni guiones. Ej: +5491112345678
              </p>
            )}
          </Field>

          {/* Tipo de evento */}
          <Field label="Tipo de evento *" error={errors.eventType?.message}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EVENT_TYPES.map((type) => (
                <label key={type.value} className="cursor-pointer">
                  <input
                    type="radio"
                    value={type.value}
                    {...register('eventType')}
                    className="peer sr-only"
                  />
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-lg border border-zinc-200 dark:border-white/10 px-3 py-2.5 text-center text-sm font-medium transition-all hover:border-zinc-300 dark:hover:border-white/20 text-zinc-600 dark:text-zinc-300',
                      t.radioSel
                    )}
                  >
                    {type.label}
                  </div>
                </label>
              ))}
            </div>
          </Field>

          {/* Descripción si "otro" */}
          {watchedEventType === 'otro' && (
            <Field label="Contanos qué tipo de evento es" error={errors.eventTypeOther?.message}>
              <input
                {...register('eventTypeOther')}
                placeholder="Ej: Aniversario de empresa, baby shower..."
                className={inputClass}
              />
            </Field>
          )}

          {/* Fecha y hora del evento */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha aproximada del evento" error={errors.eventDate?.message}>
              <input {...register('eventDate')} type="date" className={inputClass} />
            </Field>
            <Field label="Horario aproximado" error={errors.eventTime?.message}>
              <input {...register('eventTime')} type="time" className={inputClass} />
            </Field>
          </div>

          {/* Cantidad de invitados y lugar */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="¿Cuántos invitados?" error={errors.guestCount?.message}>
              <input
                {...register('guestCount', { setValueAs: (v) => (v === '' ? null : Number(v)) })}
                type="number"
                min="1"
                placeholder="Ej: 150"
                className={inputClass}
              />
            </Field>
            <Field label="Lugar del evento" error={errors.eventLocation?.message}>
              <input
                {...register('eventLocation')}
                placeholder="Ej: Salón Los Robles, CABA"
                className={inputClass}
              />
            </Field>
          </div>

          {/* Selección de DJs (solo para AURA) */}
          {showDjPreference && djMembers.length > 0 && (
            <Field label="¿Tienen algún DJ en mente?" error={errors.djPreference?.message}>
              <input type="hidden" {...register('djPreference')} />
              <div className="flex flex-wrap gap-2">
                {djMembers.map((dj) => {
                  const selected = selectedDjs.includes(dj.name)
                  return (
                    <button
                      key={dj.id}
                      type="button"
                      onClick={() => toggleDj(dj.name)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                        selected
                          ? t.djSel
                          : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.04]'
                      )}
                    >
                      {selected && <Check className={cn('h-3 w-3', t.djCheck)} />}
                      {dj.name}
                    </button>
                  )
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-600">
                Opcional — podés seleccionar uno o más DJs
              </p>
            </Field>
          )}

          {/* Mensaje adicional */}
          <Field label="Información adicional" error={errors.message?.message}>
            <textarea
              {...register('message')}
              rows={3}
              placeholder="Cualquier detalle extra que quieras contarnos..."
              className={cn(inputClass, 'resize-none')}
            />
          </Field>

          {serverError && (
            <div className="flex items-start gap-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {serverError}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="gap-2 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>
            <Button type="submit" disabled={isSubmitting} className={cn('flex-1', t.btn)}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar solicitud'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─── Helpers de calendario ────────────────────────────────────────────────────

function toCalUTC(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = timeStr.split(':').map(Number)
  const utcH = h + 3 // ART = UTC-3
  return `${String(y)}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}T${String(utcH).padStart(2, '0')}${String(min).padStart(2, '0')}00Z`
}

function buildGoogleCalendarUrl(
  date: string,
  startTime: string,
  endTime: string,
  contactName: string | null | undefined,
  brandName: string
): string {
  const dtStart = toCalUTC(date, startTime)
  const dtEnd = toCalUTC(date, endTime)
  const p = encodeURIComponent
  const details = contactName ? `Con: ${contactName}` : brandName
  return (
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${p(`Reunión ${brandName}`)}` +
    `&dates=${dtStart}/${dtEnd}` +
    `&details=${p(details)}` +
    `&location=${p('Buenos Aires, Argentina')}`
  )
}

function downloadICS(
  date: string,
  startTime: string,
  endTime: string,
  contactName: string | null | undefined,
  brandName: string
): void {
  const dtStart = toCalUTC(date, startTime)
  const dtEnd = toCalUTC(date, endTime)
  const uid = `${date.replace(/-/g, '')}-${startTime.replace(':', '')}-${brandName.toLowerCase()}@reuniones`
  const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'
  const desc = contactName ? `Con: ${contactName}` : brandName

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${brandName}//Admin//ES`,
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Reunión ${brandName}`,
    `DESCRIPTION:${desc}`,
    'LOCATION:Buenos Aires\\, Argentina',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `reunion-${brandName.toLowerCase().replace(/\s/g, '-')}.ics`,
  })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
