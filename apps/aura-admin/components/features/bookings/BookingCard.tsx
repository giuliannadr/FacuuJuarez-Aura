'use client'

import { useState, useTransition } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, X, CalendarDays, Mail, Clock, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { respondToBooking } from '@/app/(dashboard)/bookings/actions'
import { BookingDetailModal } from './BookingDetailModal'
import type { Role } from '@/lib/permissions'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingDisplay {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  subject: string
  message: string | null
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
  context: 'aura' | 'facundo_solo'
  meetingRound: number
  clientId: string | null
  participants: { memberId: string; name: string; status: 'pending' | 'accepted' | 'rejected' }[]
  myParticipantStatus: 'pending' | 'accepted' | 'rejected' | null
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', variant: 'warning' as const },
  confirmed: { label: 'Confirmada', variant: 'success' as const },
  rejected: { label: 'Rechazada', variant: 'destructive' as const },
  cancelled: { label: 'Cancelada', variant: 'secondary' as const },
}

const CONTEXT_LABEL = {
  aura: 'AURA',
  facundo_solo: 'Personal',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BookingCardProps {
  booking: BookingDisplay
  role: Role
}

export function BookingCard({ booking, role }: BookingCardProps) {
  const [isPending, startTransition] = useTransition()
  const [showDetail, setShowDetail] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)

  const config = STATUS_CONFIG[booking.status]
  const canRespond = booking.status === 'pending' && booking.myParticipantStatus === 'pending'

  function respond(response: 'accepted' | 'rejected') {
    startTransition(async () => {
      const result = await respondToBooking(booking.id, response)
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success(response === 'accepted' ? 'Reserva aceptada' : 'Reserva rechazada')
      }
    })
  }

  return (
    <>
      <div
        className={cn(
          'rounded-xl border bg-white dark:bg-white/[0.02] p-4 md:p-5 transition-colors',
          booking.status === 'pending'
            ? 'border-zinc-200 dark:border-white/[0.08]'
            : 'border-zinc-100 dark:border-white/5'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Título + badges */}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-zinc-900 dark:text-white truncate">
                {booking.subject}
              </h3>
              <Badge variant={config.variant}>{config.label}</Badge>
              {booking.meetingRound === 2 && (
                <Badge
                  variant="outline"
                  className="border-violet-500/30 text-violet-600 dark:text-violet-400 text-[10px]"
                >
                  2ª reunión
                </Badge>
              )}
              {role === 'facundo' && (
                <Badge
                  variant="outline"
                  className="border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-500 text-[10px]"
                >
                  {CONTEXT_LABEL[booking.context]}
                </Badge>
              )}
            </div>

            {/* Fecha, hora y email */}
            <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-400 dark:text-zinc-500 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3 shrink-0" />
                {format(parseISO(booking.date), "d 'de' MMM yyyy", { locale: es })}
                {' · '}
                {booking.startTime}–{booking.endTime}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {booking.clientName} — {booking.clientEmail}
                </span>
              </span>
            </div>

            {booking.message && (
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2">
                {booking.message}
              </p>
            )}

            {/* Participantes */}
            <div className="mt-3 flex flex-wrap gap-2">
              {booking.participants.map((p) => (
                <span
                  key={p.memberId}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                    p.status === 'accepted' &&
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    p.status === 'rejected' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                    p.status === 'pending' && 'bg-zinc-100 dark:bg-white/5 text-zinc-500'
                  )}
                >
                  {p.status === 'accepted' && <Check className="h-2.5 w-2.5" />}
                  {p.status === 'rejected' && <X className="h-2.5 w-2.5" />}
                  {p.status === 'pending' && <Clock className="h-2.5 w-2.5" />}
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          {/* Acciones: aceptar/rechazar + ver detalle */}
          <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
            {/* Confirmación de rechazo — inline */}
            {canRespond && showRejectConfirm && (
              <div className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1.5">
                <span className="text-xs text-red-600 dark:text-red-400 whitespace-nowrap mr-0.5">
                  ¿Rechazar?
                </span>
                <button
                  onClick={() => setShowRejectConfirm(false)}
                  disabled={isPending}
                  className="rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    setShowRejectConfirm(false)
                    respond('rejected')
                  }}
                  disabled={isPending}
                  className="rounded px-1.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Sí
                </button>
              </div>
            )}

            {/* Botones normales: rechazar + aceptar */}
            {canRespond && !showRejectConfirm && (
              <>
                <button
                  onClick={() => setShowRejectConfirm(true)}
                  disabled={isPending}
                  title="Rechazar"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={() => respond('accepted')}
                  disabled={isPending}
                  title="Aceptar"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Ver detalle — siempre visible */}
            <button
              onClick={() => setShowDetail(true)}
              title="Ver detalle"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      <BookingDetailModal
        booking={booking}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  )
}
