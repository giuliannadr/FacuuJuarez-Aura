'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, ChevronLeft, Loader2, Users, CalendarDays, ClipboardList } from 'lucide-react'
import { bookingContactSchema, type BookingContactInput } from '@/lib/schemas/booking'
import { createBooking } from '@/app/(dashboard)/bookings/actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Member {
  id: string
  name: string
  role: 'facundo' | 'aura_admin' | 'aura_member'
  bio: string | null
  avatarUrl: string | null
}

interface AvailableSlot {
  memberId: string
  date: string
  startTime: string
  endTime: string
}

interface BookingFlowProps {
  members: Member[]
  availableSlots: AvailableSlot[]
}

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Participantes', icon: Users },
  { label: 'Horario', icon: CalendarDays },
  { label: 'Tus datos', icon: ClipboardList },
]

function StepBar({ current }: { current: number }) {
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
                  done && 'border-violet-500 bg-violet-500 text-white',
                  active && 'border-violet-500 bg-violet-500/10 text-violet-400',
                  !done && !active && 'border-white/10 text-zinc-600'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium',
                  active ? 'text-zinc-300' : done ? 'text-zinc-500' : 'text-zinc-700'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-2 mb-5 h-[1px] flex-1 transition-colors',
                  i < current ? 'bg-violet-500' : 'bg-white/5'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BookingFlow({ members, availableSlots }: BookingFlowProps) {
  const [step, setStep] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(
    null
  )
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingContactInput>({ resolver: zodResolver(bookingContactSchema) })

  // Calcula slots disponibles para los miembros seleccionados
  // Solo muestra slots donde TODOS los seleccionados están disponibles
  function getCommonSlots(): { date: string; startTime: string; endTime: string }[] {
    if (selectedIds.length === 0) return []

    const slotsByMember = selectedIds.map((id) =>
      availableSlots
        .filter((s) => s.memberId === id)
        .map((s) => `${s.date}|${s.startTime}|${s.endTime}`)
    )

    const common = slotsByMember[0].filter((slot) =>
      slotsByMember.every((memberSlots) => memberSlots.includes(slot))
    )

    return common.map((s) => {
      const [date, startTime, endTime] = s.split('|')
      return { date, startTime, endTime }
    })
  }

  // Agrupa slots comunes por fecha
  function getSlotsByDate() {
    const common = getCommonSlots()
    const grouped = new Map<string, { startTime: string; endTime: string }[]>()
    for (const slot of common) {
      if (!grouped.has(slot.date)) grouped.set(slot.date, [])
      grouped.get(slot.date)!.push({ startTime: slot.startTime, endTime: slot.endTime })
    }
    return grouped
  }

  function toggleMember(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    setSelectedDate(null)
    setSelectedSlot(null)
  }

  function selectAll() {
    setSelectedIds(members.map((m) => m.id))
    setSelectedDate(null)
    setSelectedSlot(null)
  }

  async function onSubmit(data: BookingContactInput) {
    if (!selectedDate || !selectedSlot) return

    const result = await createBooking({
      context: 'aura',
      memberIds: selectedIds,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      ...data,
    })

    if (result.success) setDone(true)
  }

  // ─── Success screen ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
          <Check className="h-8 w-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">¡Solicitud enviada!</h2>
          <p className="mt-2 max-w-sm text-sm text-zinc-400">
            Nos comunicaremos con vos al confirmar la reunión. Revisá tu bandeja de entrada.
          </p>
        </div>
        {selectedDate && selectedSlot && (
          <div className="rounded-lg border border-white/5 bg-white/[0.02] px-6 py-4 text-sm text-zinc-400">
            <p className="font-medium text-white">
              {format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es })}
            </p>
            <p>
              {selectedSlot.startTime} – {selectedSlot.endTime}
            </p>
          </div>
        )}
      </div>
    )
  }

  const slotsByDate = getSlotsByDate()
  const availableDates = [...slotsByDate.keys()].sort()

  return (
    <div className="space-y-8">
      <StepBar current={step} />

      {/* ─── Step 0: Participantes ─────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Seleccioná con quién querés reunirte</p>
            <button
              onClick={selectAll}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Seleccionar todos
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {members.map((member) => {
              const selected = selectedIds.includes(member.id)
              return (
                <button
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border p-4 text-left transition-all',
                    selected
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                      selected ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-300'
                    )}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{member.name}</p>
                    {member.bio && <p className="text-xs text-zinc-500 truncate">{member.bio}</p>}
                  </div>
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                      selected ? 'border-violet-500 bg-violet-500' : 'border-white/20'
                    )}
                  >
                    {selected && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
              )
            })}
          </div>

          <Button
            onClick={() => setStep(1)}
            disabled={selectedIds.length === 0}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40"
          >
            Continuar
          </Button>
        </div>
      )}

      {/* ─── Step 1: Horario ───────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          {availableDates.length === 0 ? (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-8 text-center">
              <p className="text-sm text-zinc-400">
                No hay horarios comunes disponibles para los participantes seleccionados.
              </p>
              <button
                onClick={() => setStep(0)}
                className="mt-3 text-sm text-violet-400 hover:text-violet-300"
              >
                Modificar selección
              </button>
            </div>
          ) : (
            availableDates.map((date) => {
              const slots = slotsByDate.get(date)!
              return (
                <div key={date} className="space-y-2">
                  <p className="text-sm font-medium capitalize text-zinc-300">
                    {format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => {
                      const isSelected =
                        selectedDate === date && selectedSlot?.startTime === slot.startTime
                      return (
                        <button
                          key={`${date}-${slot.startTime}`}
                          onClick={() => {
                            setSelectedDate(date)
                            setSelectedSlot(slot)
                          }}
                          className={cn(
                            'rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                            isSelected
                              ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                              : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                          )}
                        >
                          {slot.startTime} – {slot.endTime}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(0)}
              className="gap-2 border-white/10 text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedDate || !selectedSlot}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40"
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Datos de contacto ─────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Resumen */}
          {selectedDate && selectedSlot && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 text-sm">
              <p className="font-medium text-white capitalize">
                {format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es })} ·{' '}
                {selectedSlot.startTime} – {selectedSlot.endTime}
              </p>
              <p className="mt-0.5 text-zinc-500">
                Con:{' '}
                {members
                  .filter((m) => selectedIds.includes(m.id))
                  .map((m) => m.name)
                  .join(', ')}
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo" error={errors.clientName?.message}>
              <input {...register('clientName')} placeholder="Tu nombre" className={inputClass} />
            </Field>
            <Field label="Email" error={errors.clientEmail?.message}>
              <input
                {...register('clientEmail')}
                type="email"
                placeholder="tu@email.com"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Motivo de la reunión" error={errors.subject?.message}>
            <input
              {...register('subject')}
              placeholder="Ej: Propuesta para evento corporativo"
              className={inputClass}
            />
          </Field>

          <Field label="Mensaje (opcional)" error={errors.message?.message}>
            <textarea
              {...register('message')}
              rows={3}
              placeholder="Contanos más sobre lo que tenés en mente..."
              className={cn(inputClass, 'resize-none')}
            />
          </Field>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="gap-2 border-white/10 text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-violet-600 hover:bg-violet-500"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar solicitud'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputClass =
  'w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'

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
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
