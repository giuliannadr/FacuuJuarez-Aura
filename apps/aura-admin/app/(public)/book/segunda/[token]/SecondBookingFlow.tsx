'use client'

import { useState } from 'react'
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
import { Check, ChevronLeft, ChevronRight, Loader2, CalendarDays, CalendarPlus } from 'lucide-react'
import { createSecondBooking } from '@/app/(dashboard)/bookings/actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvailableSlot {
  memberId: string
  date: string
  startTime: string
  endTime: string
}

interface SecondBookingFlowProps {
  token: string
  clientName: string
  djNames: string[]
  availableSlots: AvailableSlot[]
}

// ─── Calendario ───────────────────────────────────────────────────────────────

const DAY_HEADERS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function BookingCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
}: {
  availableDates: Set<string>
  selectedDate: string | null
  onSelectDate: (date: string) => void
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
                isPast && 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed',
                isAvail &&
                  !isSelected &&
                  !isPast &&
                  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 cursor-pointer',
                isSelected && 'bg-violet-600 text-white shadow-sm',
                !isAvail && !isPast && 'text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
              )}
            >
              {format(day, 'd')}
              {isTodayDate && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-500" />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-5 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-500/30 border border-emerald-500/40" />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-violet-600" />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">Seleccionado</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SecondBookingFlow({
  token,
  clientName,
  djNames,
  availableSlots,
}: SecondBookingFlowProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // Agrupar slots por fecha (necesitamos que TODOS los DJs coincidan)
  function getSlotsByDate(): Map<string, { startTime: string; endTime: string }[]> {
    const djIds = [...new Set(availableSlots.map((s) => s.memberId))]

    // Solo incluir slots donde TODOS los DJs tienen disponibilidad
    const slotKeys = availableSlots
      .filter((s) => s.memberId === djIds[0])
      .map((s) => `${s.date}|${s.startTime}|${s.endTime}`)
      .filter((key) =>
        djIds.every((id) =>
          availableSlots.some(
            (s) => s.memberId === id && `${s.date}|${s.startTime}|${s.endTime}` === key
          )
        )
      )

    const grouped = new Map<string, { startTime: string; endTime: string }[]>()
    for (const key of slotKeys) {
      const [date, startTime, endTime] = key.split('|')
      if (!grouped.has(date)) grouped.set(date, [])
      grouped.get(date)!.push({ startTime, endTime })
    }
    return grouped
  }

  const slotsByDate = getSlotsByDate()
  const availableDates = new Set(slotsByDate.keys())
  const slotsForDay = selectedDate ? (slotsByDate.get(selectedDate) ?? []) : []

  function handleDateSelect(date: string) {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  async function handleSubmit() {
    if (!selectedDate || !selectedSlot) return
    setIsSubmitting(true)
    setServerError(null)

    const result = await createSecondBooking({
      token,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    })

    setIsSubmitting(false)

    if (result.success) {
      setDone(true)
    } else {
      setServerError(result.error)
      if (result.error.includes('horario')) {
        setSelectedDate(null)
        setSelectedSlot(null)
      }
    }
  }

  // ── Pantalla de éxito ─────────────────────────────────────────────────────

  if (done && selectedDate && selectedSlot) {
    const googleUrl = buildGoogleCalendarUrl(
      selectedDate,
      selectedSlot.startTime,
      selectedSlot.endTime,
      djNames
    )

    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
          <Check className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            ¡Listo, {clientName}!
          </h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Tu reunión con los DJs está agendada. Te enviamos un email con los detalles.
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
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Con {djNames.join(', ')}
          </p>
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
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 transition-all hover:border-zinc-300 dark:hover:border-white/20"
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
                downloadICS(selectedDate, selectedSlot.startTime, selectedSlot.endTime, djNames)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 transition-all hover:border-zinc-300 dark:hover:border-white/20"
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
        </div>
      </div>
    )
  }

  // ── Pantalla principal ─────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {serverError}
        </div>
      )}

      {availableDates.size === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-white/10 p-8 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            No hay turnos disponibles en este momento. Contactanos para coordinar.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-5 space-y-6">
          <BookingCalendar
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
          />

          {selectedDate && (
            <div className="space-y-3 border-t border-zinc-100 dark:border-white/5 pt-4">
              <p className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-200">
                {format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es })}
                <span className="ml-2 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                  · 45 min
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
                      const isSel = selectedSlot?.startTime === slot.startTime
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={cn(
                            'rounded-lg border px-3 py-2 text-left transition-all',
                            isSel
                              ? 'border-violet-500 bg-violet-500/10'
                              : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.04]'
                          )}
                        >
                          <span
                            className={cn(
                              'block text-sm font-semibold',
                              isSel
                                ? 'text-violet-600 dark:text-violet-400'
                                : 'text-zinc-700 dark:text-zinc-200'
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
        onClick={handleSubmit}
        disabled={!selectedDate || !selectedSlot || isSubmitting}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar reunión'}
      </Button>
    </div>
  )
}

// ─── Helpers de calendario ────────────────────────────────────────────────────

function toCalUTC(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = timeStr.split(':').map(Number)
  const utcH = h + 3
  return `${String(y)}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}T${String(utcH).padStart(2, '0')}${String(min).padStart(2, '0')}00Z`
}

function buildGoogleCalendarUrl(
  date: string,
  startTime: string,
  endTime: string,
  djNames: string[]
): string {
  const dtStart = toCalUTC(date, startTime)
  const dtEnd = toCalUTC(date, endTime)
  const p = encodeURIComponent
  return (
    `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=${p('Reunión con DJs — AURA')}` +
    `&dates=${dtStart}/${dtEnd}` +
    `&details=${p(`Con: ${djNames.join(', ')}`)}`
  )
}

function downloadICS(date: string, startTime: string, endTime: string, djNames: string[]): void {
  const dtStart = toCalUTC(date, startTime)
  const dtEnd = toCalUTC(date, endTime)
  const uid = `${date.replace(/-/g, '')}-${startTime.replace(':', '')}-aura-djs@reuniones`
  const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AURA//DJs//ES',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    'SUMMARY:Reunión con DJs — AURA',
    `DESCRIPTION:Con: ${djNames.join('\\, ')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: 'reunion-djs-aura.ics',
  })
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
