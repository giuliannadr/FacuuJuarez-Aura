'use client'

/**
 * Shared booking form input components.
 * Used in: BookingFlow, SecondBookingFlow, NewContactDialog, EditContactDialog.
 */

import { useState, useEffect, useRef } from 'react'
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
  setMonth,
  setYear,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronLeft, ChevronRight, CalendarDays, Clock, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EVENT_TYPES } from '@/lib/schemas/booking'

// ─── Constants ────────────────────────────────────────────────────────────────

export const COUNTRY_CODES = [
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+1', flag: '🇺🇸', name: 'EE.UU.' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
] as const

export const EVENT_TIMES = [
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
  '23:00',
  '23:30',
  '00:00',
  '00:30',
  '01:00',
  '01:30',
  '02:00',
  '02:30',
  '03:00',
]

const DAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const MONTHS_FULL = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const MONTHS_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]

// ─── CalendarNav ─────────────────────────────────────────────────────────────
// Header with ← [Mes ▾] [Año ▾] → for all calendars.

interface CalendarNavProps {
  currentMonth: Date
  onChange: (month: Date) => void
  /** Block navigation before the current month (slot pickers) */
  lockPast?: boolean
}

function CalendarNav({ currentMonth, onChange, lockPast = false }: CalendarNavProps) {
  const [popup, setPopup] = useState<'none' | 'month' | 'year'>('none')
  const containerRef = useRef<HTMLDivElement>(null)

  const currentYear = currentMonth.getFullYear()
  const currentMonthIdx = currentMonth.getMonth()
  const todayYear = new Date().getFullYear()
  const todayMonth = new Date().getMonth()

  // When locked to future: 12 years forward. When past allowed: 30 past + 5 forward
  const yearOptions = lockPast
    ? Array.from({ length: 12 }, (_, i) => todayYear + i)
    : Array.from({ length: 35 }, (_, i) => todayYear - 30 + i)

  const isAtMin = lockPast && currentYear === todayYear && currentMonthIdx <= todayMonth

  useEffect(() => {
    if (popup === 'none') return
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopup('none')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [popup])

  function handlePrev() {
    const prev = subMonths(currentMonth, 1)
    if (lockPast && isBefore(startOfMonth(prev), startOfMonth(new Date()))) return
    onChange(prev)
  }

  function handleNext() {
    onChange(addMonths(currentMonth, 1))
  }

  function selectMonth(idx: number) {
    let next = setMonth(currentMonth, idx)
    // If locking past and new month is before today, jump to today's month
    if (lockPast && isBefore(startOfMonth(next), startOfMonth(new Date()))) {
      next = new Date()
    }
    onChange(next)
    setPopup('none')
  }

  function selectYear(year: number) {
    let next = setYear(currentMonth, year)
    if (lockPast && isBefore(startOfMonth(next), startOfMonth(new Date()))) {
      next = setYear(new Date(), year)
    }
    onChange(next)
    setPopup('none')
  }

  return (
    <div ref={containerRef} className="relative flex items-center justify-between">
      {/* ← */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={isAtMin}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Month + Year selectors */}
      <div className="flex items-center gap-1">
        {/* Month button */}
        <button
          type="button"
          onClick={() => setPopup((p) => (p === 'month' ? 'none' : 'month'))}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
        >
          {MONTHS_SHORT[currentMonthIdx]}
          <ChevronDown
            className={cn(
              'h-3 w-3 text-zinc-400 transition-transform',
              popup === 'month' && 'rotate-180'
            )}
          />
        </button>

        {/* Year button */}
        <button
          type="button"
          onClick={() => setPopup((p) => (p === 'year' ? 'none' : 'year'))}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
        >
          {currentYear}
          <ChevronDown
            className={cn(
              'h-3 w-3 text-zinc-400 transition-transform',
              popup === 'year' && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* → */}
      <button
        type="button"
        onClick={handleNext}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Month popup */}
      {popup === 'month' && (
        <div className="absolute left-1/2 top-full mt-1.5 z-50 -translate-x-1/2 w-56 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl p-2">
          <div className="grid grid-cols-3 gap-1">
            {MONTHS_FULL.map((name, idx) => {
              const isDisabled = lockPast && currentYear === todayYear && idx < todayMonth
              const isSelected = idx === currentMonthIdx
              return (
                <button
                  key={name}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => selectMonth(idx)}
                  className={cn(
                    'rounded-lg px-2 py-2 text-xs font-medium text-center transition-colors',
                    isSelected
                      ? 'bg-violet-600 text-white'
                      : isDisabled
                        ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                        : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
                  )}
                >
                  {MONTHS_SHORT[idx]}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Year popup — same 3-col grid as months, scrollable */}
      {popup === 'year' && (
        <div className="absolute left-1/2 top-full mt-1.5 z-50 -translate-x-1/2 w-56 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl p-2 max-h-60 overflow-y-auto">
          <div className="grid grid-cols-3 gap-1">
            {yearOptions.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => selectYear(year)}
                className={cn(
                  'rounded-lg px-2 py-2 text-xs font-medium text-center transition-colors',
                  year === currentYear
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5'
                )}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── BookingCalendar ──────────────────────────────────────────────────────────
// Standalone calendar for picking meeting slots (shows available/unavailable dates).

interface BookingCalendarProps {
  availableDates: Set<string>
  selectedDate: string | null
  onSelectDate: (date: string) => void
  /** Tailwind class for the selected day circle, e.g. 'bg-violet-600' or 'bg-red-600' */
  accentClass?: string
  /** Tailwind class for the "today" dot, e.g. 'bg-violet-500' */
  dotClass?: string
}

export function BookingCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
  accentClass = 'bg-violet-600',
  dotClass = 'bg-violet-500',
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const todayStart = startOfDay(new Date())

  return (
    <div className="space-y-3">
      <CalendarNav currentMonth={currentMonth} onChange={setCurrentMonth} lockPast />

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
                isSelected && cn(accentClass, 'text-white shadow-sm'),
                !isAvail && !isPast && 'cursor-not-allowed text-zinc-400 dark:text-zinc-500'
              )}
            >
              {format(day, 'd')}
              {isTodayDate && !isSelected && (
                <span
                  className={cn(
                    'absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full',
                    dotClass
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
          <span className={cn('h-3 w-3 rounded-full', accentClass)} />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">Seleccionado</span>
        </div>
      </div>
    </div>
  )
}

// ─── EventDatePicker ──────────────────────────────────────────────────────────
// Dropdown trigger that opens a calendar for selecting an event date.

interface EventDatePickerProps {
  value: string
  onChange: (v: string) => void
  inputClass: string
  /** Allow selecting past dates (e.g. for birthdates). Default: false */
  allowPast?: boolean
}

export function EventDatePicker({
  value,
  onChange,
  inputClass,
  allowPast = false,
}: EventDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? parseISO(value) : new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const todayStart = startOfDay(new Date())

  const displayValue = value ? format(parseISO(value), "d 'de' MMMM yyyy", { locale: es }) : null

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(inputClass, 'flex cursor-pointer items-center justify-between text-left')}
      >
        <span
          className={cn(
            'capitalize',
            displayValue ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600'
          )}
        >
          {displayValue ?? 'Seleccioná la fecha'}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {value && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <CalendarDays className="h-4 w-4 text-zinc-400" />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-1.5 w-full min-w-[288px] rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-4 shadow-2xl">
          <CalendarNav
            currentMonth={currentMonth}
            onChange={setCurrentMonth}
            lockPast={!allowPast}
          />

          <div className="mb-1 mt-3 grid grid-cols-7">
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
              const isDisabled = isPast && !allowPast
              const isSelected = value === dateStr
              const isTodayDate = isToday(day)

              if (!inMonth) return <div key={dateStr} />

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(dateStr)
                    setOpen(false)
                  }}
                  className={cn(
                    'relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all',
                    isDisabled && 'cursor-not-allowed text-zinc-300 dark:text-zinc-700',
                    !isDisabled &&
                      !isSelected &&
                      'cursor-pointer text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10',
                    isSelected && 'bg-violet-600 text-white shadow-sm',
                    isTodayDate && !isSelected && !isDisabled && 'font-bold'
                  )}
                >
                  {format(day, 'd')}
                  {isTodayDate && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TimePicker ───────────────────────────────────────────────────────────────

interface TimePickerProps {
  value: string
  onChange: (v: string) => void
  inputClass: string
}

export function TimePicker({ value, onChange, inputClass }: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(inputClass, 'flex cursor-pointer items-center justify-between text-left')}
      >
        <span
          className={value ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600'}
        >
          {value || 'Sin especificar'}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {value && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <Clock className="h-4 w-4 text-zinc-400" />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-1.5 w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-3 shadow-2xl">
          <div className="grid grid-cols-5 gap-1.5">
            {EVENT_TIMES.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => {
                  onChange(time)
                  setOpen(false)
                }}
                className={cn(
                  'rounded-lg border px-1 py-2 text-xs font-medium text-center transition-all',
                  value === time
                    ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                    : 'border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.04]'
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PhoneInput ───────────────────────────────────────────────────────────────

interface PhoneInputProps {
  onChange: (v: string) => void
  inputClass: string
  /** Pre-populate with an existing value like "+5491112345678" */
  defaultValue?: string
}

function parsePhone(value: string): { code: string; local: string } {
  if (!value) return { code: '+54', local: '' }
  const sorted = COUNTRY_CODES.map((c) => c.code).sort((a, b) => b.length - a.length)
  const match = sorted.find((c) => value.startsWith(c))
  if (match) return { code: match, local: value.slice(match.length) }
  return { code: '+54', local: value }
}

export function PhoneInput({ onChange, inputClass, defaultValue }: PhoneInputProps) {
  const parsed = parsePhone(defaultValue ?? '')
  const [countryCode, setCountryCode] = useState(parsed.code)
  const [localNumber, setLocalNumber] = useState(parsed.local)
  const [dropOpen, setDropOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0]

  useEffect(() => {
    if (!dropOpen) return
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropOpen])

  function handleCountryChange(code: string) {
    setCountryCode(code)
    setDropOpen(false)
    const digits = localNumber.replace(/\D/g, '')
    onChange(digits ? `${code}${digits}` : '')
  }

  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d\s()-]/g, '')
    setLocalNumber(raw)
    const digits = raw.replace(/\D/g, '')
    onChange(digits ? `${countryCode}${digits}` : '')
  }

  return (
    <div ref={containerRef} className="flex items-stretch gap-2">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setDropOpen((v) => !v)}
          className="flex h-full items-center gap-1.5 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-2.5 py-2 text-sm text-zinc-900 dark:text-white transition-colors hover:bg-zinc-50 dark:hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/20"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="min-w-[32px] text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {selected.code}
          </span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-zinc-400 transition-transform duration-150',
              dropOpen && 'rotate-180'
            )}
          />
        </button>

        {dropOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-48 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-xl py-1 overflow-hidden">
            {COUNTRY_CODES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountryChange(country.code)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-white/5',
                  countryCode === country.code
                    ? 'bg-zinc-50 dark:bg-white/5 font-medium text-zinc-900 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-300'
                )}
              >
                <span className="text-base">{country.flag}</span>
                <span className="flex-1 text-left">{country.name}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-600">{country.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="tel"
        inputMode="numeric"
        value={localNumber}
        onChange={handleLocalChange}
        placeholder="11 1234 5678"
        className={cn(inputClass, 'flex-1')}
      />
    </div>
  )
}

// ─── EventTypeRadioGrid ───────────────────────────────────────────────────────

interface EventTypeRadioGridProps {
  value: string
  onChange: (v: string) => void
}

export function EventTypeRadioGrid({ value, onChange }: EventTypeRadioGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {EVENT_TYPES.map((type) => {
        const selected = value === type.value
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={cn(
              'flex items-center justify-center rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-all',
              selected
                ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.04]'
            )}
          >
            {selected && <Check className="mr-1.5 h-3 w-3 shrink-0" />}
            {type.label}
          </button>
        )
      })}
    </div>
  )
}
