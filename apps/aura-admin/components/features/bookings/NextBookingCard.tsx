'use client'

import { useState } from 'react'
import { CalendarDays, Eye } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { BookingDetailModal, type BookingDetail } from './BookingDetailModal'

interface NextBookingCardProps {
  booking: BookingDetail
}

export function NextBookingCard({ booking }: NextBookingCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
            <CalendarDays className="h-4 w-4 text-violet-500 dark:text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Próxima reunión
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white truncate">
              {booking.subject}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {booking.clientName}
              {' · '}
              {format(parseISO(booking.date), "EEEE d 'de' MMM", { locale: es })}
              {' · '}
              {booking.startTime}–{booking.endTime}
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            title="Ver detalle"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/10 text-zinc-400 transition-colors hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <BookingDetailModal booking={booking} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
