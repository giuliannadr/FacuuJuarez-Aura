'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Pencil, Trash2, Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { updateContactEventStatus, deleteContact } from '@/app/(dashboard)/clients/actions'
import { ContactStatusBadge, STATUS_LABELS } from './ContactStatusBadge'
import { ContactDetailModal } from './ContactDetailModal'
import { EditContactDialog } from './EditContactDialog'
import type { ContactStatus } from '@aura/db'
import type { ContactDetailData } from './ContactDetailModal'
import { eventTypeLabel } from '@/lib/schemas/booking'
import { cn } from '@/lib/utils'

const ALL_STATUSES: ContactStatus[] = [
  'sin_contacto',
  'reunion_1_reservada',
  'reunion_1_hecha',
  'reunion_2_reservada',
  'reunion_2_hecha',
  'contratado',
  'en_proceso',
  'completado',
]

interface ContactCardProps {
  contact: ContactDetailData
}

export function ContactCard({ contact }: ContactCardProps) {
  const router = useRouter()
  const [showDetail, setShowDetail] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [isUpdatingStatus, startStatusTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  const latestEvent = contact.events[0] ?? null
  const currentStatus = latestEvent?.status ?? 'sin_contacto'

  function handleStatusChange(status: ContactStatus) {
    if (!latestEvent) return
    setShowStatusMenu(false)
    startStatusTransition(async () => {
      const result = await updateContactEventStatus(latestEvent.id, status)
      if (result.success) {
        toast.success('Estado actualizado')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar a ${contact.name}? Esta acción no se puede deshacer.`)) return
    startDeleteTransition(async () => {
      const result = await deleteContact(contact.id)
      if (result.success) {
        toast.success('Contacto eliminado')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const eventLabel =
    latestEvent?.eventType === 'otro'
      ? (latestEvent.eventTypeOther ?? 'Otro')
      : latestEvent?.eventType
        ? eventTypeLabel(latestEvent.eventType)
        : null

  return (
    <>
      <div className="relative rounded-xl border border-zinc-200 dark:border-white/8 bg-white dark:bg-zinc-900 p-4 transition-shadow hover:shadow-sm">
        {/* Top row: name + status + actions */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
              {contact.name}
            </p>
            {(contact.email || contact.phone) && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                {contact.email ?? contact.phone}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowDetail(true)}
              title="Ver detalle"
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowEdit(true)}
              title="Editar"
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Eliminar"
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-40"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Event info */}
        {latestEvent && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400 dark:text-zinc-500 mb-3">
            {eventLabel && <span>{eventLabel}</span>}
            {latestEvent.eventDate && (
              <span>{format(parseISO(latestEvent.eventDate), 'd MMM yyyy', { locale: es })}</span>
            )}
            {latestEvent.eventLocation && <span>{latestEvent.eventLocation}</span>}
          </div>
        )}

        {/* Status pill + change */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu((v) => !v)}
              disabled={isUpdatingStatus || !latestEvent}
              className="flex items-center gap-1 disabled:opacity-50"
            >
              {isUpdatingStatus ? (
                <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
              ) : (
                <>
                  <ContactStatusBadge status={currentStatus} />
                  {latestEvent && <ChevronDown className="h-3 w-3 text-zinc-400" />}
                </>
              )}
            </button>

            {showStatusMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                <div className="absolute left-0 top-full mt-1 z-20 w-52 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-lg py-1 overflow-hidden">
                  {ALL_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={cn(
                        'flex w-full items-center px-3 py-2 text-xs font-medium transition-colors',
                        s === currentStatus
                          ? 'bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-white'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                      )}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {contact.events.length > 1 && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
              {contact.events.length} eventos
            </span>
          )}
        </div>
      </div>

      <ContactDetailModal
        contact={contact}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />

      <EditContactDialog contact={contact} open={showEdit} onClose={() => setShowEdit(false)} />
    </>
  )
}
