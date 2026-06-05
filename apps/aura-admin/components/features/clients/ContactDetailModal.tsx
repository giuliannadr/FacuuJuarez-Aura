'use client'

import { X, Phone, Mail, CalendarDays, MapPin, Users, Music2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ContactStatusBadge } from './ContactStatusBadge'
import type { ContactStatus } from '@aura/db'
import { eventTypeLabel } from '@/lib/schemas/booking'

export interface ContactDetailData {
  id: string
  name: string
  email: string | null
  phone: string | null
  isPotentialClient: boolean
  parent1Name: string | null
  parent1Phone: string | null
  parent1Email: string | null
  parent2Name: string | null
  parent2Phone: string | null
  parent2Email: string | null
  birthdayPersonName: string | null
  birthdayPersonPhone: string | null
  birthdayPersonBirthDate: string | null
  notes: string | null
  source: string
  createdAt: Date
  events: Array<{
    id: string
    status: ContactStatus
    eventType: string | null
    eventTypeOther: string | null
    eventDate: string | null
    eventTime: string | null
    guestCount: number | null
    eventLocation: string | null
    djPreference: string | null
    organizerName: string | null
    organizerPhone: string | null
    organizerEmail: string | null
    notes: string | null
    createdAt: Date
  }>
}

interface ContactDetailModalProps {
  contact: ContactDetailData
  open: boolean
  onClose: () => void
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {label}
      </dt>
      <dd className="text-sm text-zinc-800 dark:text-zinc-200">{value}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {title}
      </h4>
      <dl className="space-y-3">{children}</dl>
    </div>
  )
}

export function ContactDetailModal({ contact, open, onClose }: ContactDetailModalProps) {
  if (!open) return null

  const isQuinceanera = contact.events[0]?.eventType === 'fiesta_15'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-white/5 shrink-0">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">{contact.name}</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {contact.source === 'booking' ? 'Creado desde reserva' : 'Cargado manualmente'} ·{' '}
              {format(new Date(contact.createdAt), "d 'de' MMM yyyy", { locale: es })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
          {/* Datos principales */}
          <Section title="Datos de contacto">
            <Row label="Nombre" value={contact.name} />
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
                >
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <a
                  href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.notes && <Row label="Notas" value={contact.notes} />}
          </Section>

          {/* Quinceañera — padres y festejada */}
          {isQuinceanera && (contact.parent1Name || contact.birthdayPersonName) && (
            <Section title="Quinceañera — Familia">
              {contact.parent1Name && (
                <div className="rounded-lg border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] px-3 py-2.5 space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Padre / Tutor 1
                  </p>
                  <Row label="" value={contact.parent1Name} />
                  {contact.parent1Phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {contact.parent1Phone}
                      </span>
                    </div>
                  )}
                  {contact.parent1Email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {contact.parent1Email}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {contact.parent2Name && (
                <div className="rounded-lg border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] px-3 py-2.5 space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Padre / Tutor 2
                  </p>
                  <Row label="" value={contact.parent2Name} />
                  {contact.parent2Phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {contact.parent2Phone}
                      </span>
                    </div>
                  )}
                  {contact.parent2Email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {contact.parent2Email}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {contact.birthdayPersonName && (
                <div className="rounded-lg border border-violet-100 dark:border-violet-500/10 bg-violet-50 dark:bg-violet-500/5 px-3 py-2.5 space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-400 dark:text-violet-500">
                    La festejada
                  </p>
                  <Row label="" value={contact.birthdayPersonName} />
                  {contact.birthdayPersonBirthDate && (
                    <Row
                      label="Fecha de nacimiento"
                      value={format(parseISO(contact.birthdayPersonBirthDate), "d 'de' MMMM yyyy", {
                        locale: es,
                      })}
                    />
                  )}
                  {contact.birthdayPersonPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-violet-400 shrink-0" />
                      <span className="text-sm text-violet-700 dark:text-violet-300">
                        {contact.birthdayPersonPhone}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Section>
          )}

          {/* Historial de eventos */}
          {contact.events.length > 0 && (
            <Section title={`Eventos (${contact.events.length})`}>
              <div className="space-y-3">
                {contact.events.map((ev, i) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Evento {contact.events.length - i}
                      </span>
                      <ContactStatusBadge status={ev.status} />
                    </div>
                    <dl className="space-y-1.5">
                      {ev.eventType && (
                        <Row
                          label="Tipo"
                          value={
                            ev.eventType === 'otro'
                              ? (ev.eventTypeOther ?? 'Otro')
                              : eventTypeLabel(ev.eventType)
                          }
                        />
                      )}
                      {ev.eventDate && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {format(parseISO(ev.eventDate), "d 'de' MMMM yyyy", { locale: es })}
                            {ev.eventTime && ` · ${ev.eventTime}`}
                          </span>
                        </div>
                      )}
                      {ev.eventLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {ev.eventLocation}
                          </span>
                        </div>
                      )}
                      {ev.guestCount && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {ev.guestCount} personas
                          </span>
                        </div>
                      )}
                      {ev.djPreference && (
                        <div className="flex items-center gap-2">
                          <Music2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {ev.djPreference}
                          </span>
                        </div>
                      )}
                      {ev.organizerName && (
                        <Row
                          label="Organizador/a"
                          value={`${ev.organizerName}${ev.organizerPhone ? ` · ${ev.organizerPhone}` : ''}${ev.organizerEmail ? ` · ${ev.organizerEmail}` : ''}`}
                        />
                      )}
                      {ev.notes && <Row label="Notas" value={ev.notes} />}
                    </dl>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-100 dark:border-white/5 shrink-0">
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
