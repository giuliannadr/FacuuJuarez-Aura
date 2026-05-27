'use client'

import { useState, useTransition } from 'react'
import { Check, X, Eye, CalendarDays, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { respondToBooking } from '@/app/(dashboard)/bookings/actions'
import { BookingDetailModal, type BookingDetail } from './BookingDetailModal'
import { EnableSecondBookingDialog } from './EnableSecondBookingDialog'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PriorityBooking {
  id: string
  clientName: string
  clientId: string | null
  subject: string
  date: string
  startTime: string // ya en formato HH:MM
}

interface Member {
  id: string
  name: string
}

interface DashboardRecentBookingsProps {
  bookings: BookingDetail[]
  priorityBookings: PriorityBooking[]
  allMembers: Member[]
  canSeeSecondBooking: boolean
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', variant: 'warning' as const },
  confirmed: { label: 'Confirmada', variant: 'success' as const },
  rejected: { label: 'Rechazada', variant: 'destructive' as const },
  cancelled: { label: 'Cancelada', variant: 'secondary' as const },
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardRecentBookings({
  bookings,
  priorityBookings,
  allMembers,
  canSeeSecondBooking,
}: DashboardRecentBookingsProps) {
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function respond(bookingId: string, response: 'accepted' | 'rejected') {
    setPendingId(bookingId)
    startTransition(async () => {
      const result = await respondToBooking(bookingId, response)
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success(response === 'accepted' ? 'Reserva aceptada' : 'Reserva rechazada')
      }
      setPendingId(null)
    })
  }

  return (
    <>
      {/* ── Segunda reserva ──────────────────────────────────────────────── */}
      {canSeeSecondBooking && priorityBookings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              Habilitá la segunda reserva
            </span>
          </div>

          {priorityBookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-xl border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  ¿Acabás de tener reunión con{' '}
                  <span className="text-violet-700 dark:text-violet-400">{b.clientName}</span>?
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                  <span>{b.subject}</span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {format(parseISO(b.date), "d 'de' MMM yyyy", { locale: es })}
                    {' · '}
                    {b.startTime}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {b.clientId ? (
                  <EnableSecondBookingDialog
                    booking={{
                      id: b.id,
                      clientId: b.clientId,
                      clientName: b.clientName,
                      subject: b.subject,
                    }}
                    allMembers={allMembers}
                  />
                ) : (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 italic">
                    Reserva creada con el formulario antiguo
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="border-t border-zinc-200 dark:border-white/5" />
        </div>
      )}

      {/* ── Reservas recientes ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Reservas recientes</h3>

        {bookings.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-white/10">
            <p className="text-sm text-zinc-400 dark:text-zinc-600">No hay reservas aún</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((booking) => {
              const config = STATUS_CONFIG[booking.status]
              const canAct =
                booking.status === 'pending' && booking.myParticipantStatus === 'pending'
              const isLoading = pendingId === booking.id

              return (
                <div
                  key={booking.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                    booking.status === 'pending'
                      ? 'border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02]'
                      : 'border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.01]'
                  )}
                >
                  {/* Dot */}
                  <div
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      booking.status === 'pending' && 'bg-amber-400',
                      booking.status === 'confirmed' && 'bg-emerald-400',
                      booking.status === 'rejected' && 'bg-red-400',
                      booking.status === 'cancelled' && 'bg-zinc-300 dark:bg-zinc-600'
                    )}
                  />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {booking.clientName}
                      </span>
                      <Badge variant={config.variant} className="text-[10px] shrink-0">
                        {config.label}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0 text-xs text-zinc-400 dark:text-zinc-500">
                      <span className="truncate max-w-[140px]">{booking.subject}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <CalendarDays className="h-3 w-3" />
                        {format(parseISO(booking.date), 'd MMM', { locale: es })}
                        {' · '}
                        {booking.startTime}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    {canAct && (
                      <>
                        <button
                          onClick={() => respond(booking.id, 'rejected')}
                          disabled={isLoading}
                          title="Rechazar"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40"
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => respond(booking.id, 'accepted')}
                          disabled={isLoading}
                          title="Aceptar"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-40"
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </>
                    )}

                    {/* Ver detalle */}
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      title="Ver detalle"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal de detalle ─────────────────────────────────────────────── */}
      <BookingDetailModal
        booking={selectedBooking}
        open={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
      />
    </>
  )
}
