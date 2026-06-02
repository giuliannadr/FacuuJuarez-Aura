'use client'

import { useState } from 'react'
import { CalendarDays, Eye } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { EnableSecondBookingDialog } from './EnableSecondBookingDialog'
import { BookingDetailModal, type BookingDetail } from './BookingDetailModal'

interface Member {
  id: string
  name: string
  role: string
}

interface PriorityBookingCardProps {
  booking: {
    id: string
    clientId: string
    clientName: string
    subject: string
    date: string
    startTime: string
    context: string
  }
  detail: BookingDetail
  allMembers: Member[]
}

export function PriorityBookingCard({ booking, detail, allMembers }: PriorityBookingCardProps) {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">
            ¿Ya tuviste reunión con{' '}
            <span className="text-violet-700 dark:text-violet-400">{booking.clientName}</span>?
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            <span>{booking.subject}</span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(parseISO(booking.date), "d 'de' MMM yyyy", { locale: es })}
              {' · '}
              {booking.startTime}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setShowDetail(true)}
            title="Ver detalle"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-200 dark:border-violet-500/20 text-violet-400 dark:text-violet-500 transition-colors hover:bg-violet-100 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-300"
          >
            <Eye className="h-4 w-4" />
          </button>
          <EnableSecondBookingDialog
            booking={{
              id: booking.id,
              clientId: booking.clientId,
              clientName: booking.clientName,
              subject: booking.subject,
            }}
            allMembers={allMembers}
            context={booking.context}
          />
        </div>
      </div>

      <BookingDetailModal booking={detail} open={showDetail} onClose={() => setShowDetail(false)} />
    </>
  )
}
