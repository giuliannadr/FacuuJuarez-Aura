'use client'

import { useTransition } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, X, CalendarDays, Mail, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { respondToBooking } from '@/app/(dashboard)/bookings/actions'
import type { Role } from '@/lib/permissions'

export interface BookingDisplay {
  id: string
  clientName: string
  clientEmail: string
  subject: string
  message: string | null
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
  context: 'aura' | 'facundo_solo'
  participants: { memberId: string; name: string; status: 'pending' | 'accepted' | 'rejected' }[]
  myParticipantStatus: 'pending' | 'accepted' | 'rejected' | null
}

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

interface BookingCardProps {
  booking: BookingDisplay
  role: Role
}

export function BookingCard({ booking, role }: BookingCardProps) {
  const [isPending, startTransition] = useTransition()

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
    <div
      className={cn(
        'rounded-xl border bg-white/[0.02] p-5 transition-colors',
        booking.status === 'pending' ? 'border-white/8' : 'border-white/5'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-white truncate">{booking.subject}</h3>
            <Badge variant={config.variant}>{config.label}</Badge>
            {role === 'facundo' && (
              <Badge variant="outline" className="border-white/10 text-zinc-500 text-[10px]">
                {CONTEXT_LABEL[booking.context]}
              </Badge>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(parseISO(booking.date), "d 'de' MMM yyyy", { locale: es })} ·{' '}
              {booking.startTime}–{booking.endTime}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {booking.clientName} — {booking.clientEmail}
            </span>
          </div>

          {booking.message && (
            <p className="mt-2 text-xs text-zinc-500 line-clamp-2">{booking.message}</p>
          )}

          {/* Participants */}
          <div className="mt-3 flex flex-wrap gap-2">
            {booking.participants.map((p) => (
              <span
                key={p.memberId}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                  p.status === 'accepted' && 'bg-emerald-500/10 text-emerald-400',
                  p.status === 'rejected' && 'bg-red-500/10 text-red-400',
                  p.status === 'pending' && 'bg-white/5 text-zinc-500'
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

        {/* Accept / Reject buttons */}
        {canRespond && (
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => respond('rejected')}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              title="Rechazar"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={() => respond('accepted')}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50"
              title="Aceptar"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
