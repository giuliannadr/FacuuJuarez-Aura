'use client'

import { X, CalendarDays, Clock, Users, MessageSquare, Check } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ─── Type ─────────────────────────────────────────────────────────────────────

export interface BookingDetail {
  id: string
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  subject: string
  message: string | null
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
  context: 'aura' | 'facundo_solo'
  meetingRound?: number
  clientId?: string | null
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

// ─── Component ────────────────────────────────────────────────────────────────

interface BookingDetailModalProps {
  booking: BookingDetail | null
  open: boolean
  onClose: () => void
}

export function BookingDetailModal({ booking, open, onClose }: BookingDetailModalProps) {
  if (!open || !booking) return null

  const config = STATUS_CONFIG[booking.status]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-white/5">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2 leading-snug">
              {booking.subject}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={config.variant}>{config.label}</Badge>
              {(booking.meetingRound ?? 1) === 2 && (
                <Badge
                  variant="outline"
                  className="border-violet-500/30 text-violet-600 dark:text-violet-400 text-[10px]"
                >
                  2ª reunión
                </Badge>
              )}
              {booking.context === 'facundo_solo' && (
                <Badge
                  variant="outline"
                  className="border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-500 text-[10px]"
                >
                  Personal
                </Badge>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="divide-y divide-zinc-100 dark:divide-white/5 max-h-[65vh] overflow-y-auto">
          {/* Cliente */}
          <div className="px-5 py-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Cliente
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-sm font-bold text-violet-600 dark:text-violet-400">
                {booking.clientName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {booking.clientName}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">{booking.clientEmail}</p>
              </div>
            </div>

            {/* WhatsApp */}
            {booking.clientPhone && (
              <a
                href={`https://wa.me/${booking.clientPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-500/10"
              >
                {/* WhatsApp icon */}
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 fill-current"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Escribir por WhatsApp
                <span className="ml-auto text-xs text-emerald-600/60 dark:text-emerald-500/60 font-normal">
                  {booking.clientPhone}
                </span>
              </a>
            )}
          </div>

          {/* Fecha y horario */}
          <div className="px-5 py-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Fecha y horario
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-lg border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] px-3 py-2.5">
                <CalendarDays className="h-4 w-4 shrink-0 text-violet-500" />
                <div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none mb-0.5">
                    Fecha
                  </p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
                    {format(parseISO(booking.date), "d 'de' MMM", { locale: es })}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none mt-0.5">
                    {format(parseISO(booking.date), 'yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] px-3 py-2.5">
                <Clock className="h-4 w-4 shrink-0 text-violet-500" />
                <div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none mb-0.5">
                    Horario
                  </p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
                    {booking.startTime}–{booking.endTime}
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none mt-0.5">
                    45 min
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Participantes */}
          {booking.participants.length > 0 && (
            <div className="px-5 py-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-zinc-400" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Participantes
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.participants.map((p) => (
                  <span
                    key={p.memberId}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                      p.status === 'accepted' &&
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                      p.status === 'rejected' && 'bg-red-500/10 text-red-600 dark:text-red-400',
                      p.status === 'pending' &&
                        'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400'
                    )}
                  >
                    {p.status === 'accepted' && <Check className="h-3 w-3" />}
                    {p.status === 'rejected' && <X className="h-3 w-3" />}
                    {p.status === 'pending' && <Clock className="h-3 w-3" />}
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje */}
          {booking.message && (
            <div className="px-5 py-4">
              <div className="mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Mensaje del cliente
                </p>
              </div>
              <p className="rounded-lg border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {booking.message}
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-zinc-100 dark:border-white/5">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-zinc-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
