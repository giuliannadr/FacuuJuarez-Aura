import { cn } from '@/lib/utils'
import type { ContactStatus } from '@aura/db'

export const STATUS_LABELS: Record<ContactStatus, string> = {
  sin_contacto: 'Sin contacto',
  reunion_1_reservada: 'Reunión 1 reservada',
  reunion_1_hecha: 'Reunión 1 hecha',
  reunion_2_reservada: 'Reunión 2 reservada',
  reunion_2_hecha: 'Reunión 2 hecha',
  contratado: 'Contratado',
  en_proceso: 'En proceso',
  completado: 'Completado',
}

export const STATUS_STYLES: Record<ContactStatus, string> = {
  sin_contacto:
    'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
  reunion_1_reservada:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  reunion_1_hecha:
    'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
  reunion_2_reservada:
    'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
  reunion_2_hecha:
    'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
  contratado:
    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  en_proceso:
    'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
  completado:
    'bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-white/10',
}

interface ContactStatusBadgeProps {
  status: ContactStatus
  className?: string
}

export function ContactStatusBadge({ status, className }: ContactStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none',
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
