'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { createContact, sendBookingLinkToContact } from '@/app/(dashboard)/clients/actions'
import { EVENT_TYPES } from '@/lib/schemas/booking'
import { cn } from '@/lib/utils'

type Step = 'form' | 'action'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-colors'

export function NewContactDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [newContactId, setNewContactId] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()
  const [isSendingLink, startSendLinkTransition] = useTransition()

  // Form state
  const [eventType, setEventType] = useState('fiesta_15')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    // Quinceañera
    parent1Name: '',
    parent1Phone: '',
    parent1Email: '',
    parent2Name: '',
    parent2Phone: '',
    parent2Email: '',
    birthdayPersonName: '',
    birthdayPersonPhone: '',
    notes: '',
    // Event
    eventTypeOther: '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    eventLocation: '',
    djPreference: '',
    eventNotes: '',
  })

  const isQuinceanera = eventType === 'fiesta_15'

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleOpen() {
    setOpen(true)
    setStep('form')
    setNewContactId(null)
    setGeneratedLink(null)
    setCopiedLink(false)
    setEventType('fiesta_15')
    setForm({
      name: '',
      email: '',
      phone: '',
      parent1Name: '',
      parent1Phone: '',
      parent1Email: '',
      parent2Name: '',
      parent2Phone: '',
      parent2Email: '',
      birthdayPersonName: '',
      birthdayPersonPhone: '',
      notes: '',
      eventTypeOther: '',
      eventDate: '',
      eventTime: '',
      guestCount: '',
      eventLocation: '',
      djPreference: '',
      eventNotes: '',
    })
  }

  function handleClose() {
    setOpen(false)
  }

  function handleSubmit() {
    // Validate required fields
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    if (isQuinceanera && !form.parent1Name.trim()) {
      toast.error('El nombre del padre/tutor 1 es obligatorio para quinceañera')
      return
    }

    startTransition(async () => {
      const result = await createContact({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        parent1Name: isQuinceanera ? form.parent1Name || undefined : undefined,
        parent1Phone: isQuinceanera ? form.parent1Phone || undefined : undefined,
        parent1Email: isQuinceanera ? form.parent1Email || undefined : undefined,
        parent2Name: isQuinceanera ? form.parent2Name || undefined : undefined,
        parent2Phone: isQuinceanera ? form.parent2Phone || undefined : undefined,
        parent2Email: isQuinceanera ? form.parent2Email || undefined : undefined,
        birthdayPersonName: isQuinceanera ? form.birthdayPersonName || undefined : undefined,
        birthdayPersonPhone: isQuinceanera ? form.birthdayPersonPhone || undefined : undefined,
        notes: form.notes || undefined,
        eventType,
        eventTypeOther: eventType === 'otro' ? form.eventTypeOther || undefined : undefined,
        eventDate: form.eventDate || undefined,
        eventTime: form.eventTime || undefined,
        guestCount: form.guestCount ? parseInt(form.guestCount) : undefined,
        eventLocation: form.eventLocation || undefined,
        djPreference: form.djPreference || undefined,
        eventNotes: form.eventNotes || undefined,
      })

      if (result.success && result.contactId) {
        setNewContactId(result.contactId)
        setStep('action')
      } else if (!result.success) {
        toast.error(result.error)
      }
    })
  }

  function handleSendLink() {
    if (!newContactId) return
    startSendLinkTransition(async () => {
      const result = await sendBookingLinkToContact(newContactId)
      if (result.success) {
        setGeneratedLink(result.link)
        if (result.emailSent) {
          toast.success('Link de reserva enviado por email')
        } else if (!form.email) {
          toast.warning('Contacto sin email — copiá el link y envialo manualmente')
        } else {
          toast.warning('Link generado, pero el email no pudo enviarse — copiá el link')
        }
      } else {
        toast.error(result.error)
      }
    })
  }

  async function handleCopyLink() {
    if (!generatedLink) return
    await navigator.clipboard.writeText(generatedLink)
    setCopiedLink(true)
    toast.success('Link copiado')
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function handleFinish() {
    handleClose()
    router.refresh()
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
      >
        <Plus className="h-4 w-4" />
        Nuevo contacto
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex flex-col max-h-[90vh] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-white/5 shrink-0">
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                {step === 'form' ? 'Nuevo contacto' : '¿Qué hacemos ahora?'}
              </h3>
              <button
                onClick={handleClose}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {step === 'form' ? (
              <>
                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
                  {/* Tipo de evento */}
                  <Field label="Tipo de evento" required>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className={inputCls}
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {eventType === 'otro' && (
                    <Field label="Describí el evento" required>
                      <input
                        type="text"
                        value={form.eventTypeOther}
                        onChange={(e) => set('eventTypeOther', e.target.value)}
                        placeholder="Ej: Fiesta temática"
                        className={inputCls}
                      />
                    </Field>
                  )}

                  <hr className="border-zinc-100 dark:border-white/5" />

                  {/* Datos del contacto principal */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                      {isQuinceanera ? 'Organizador / Responsable principal' : 'Datos del contacto'}
                    </p>
                    <div className="space-y-3">
                      <Field label="Nombre completo" required>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => set('name', e.target.value)}
                          placeholder="Juan Pérez"
                          className={inputCls}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Email">
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                            placeholder="juan@email.com"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Teléfono / WhatsApp">
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => set('phone', e.target.value)}
                            placeholder="+5491112345678"
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Quinceañera — padres */}
                  {isQuinceanera && (
                    <>
                      <hr className="border-zinc-100 dark:border-white/5" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                          Padre / Tutor 1{' '}
                          <span className="text-red-400 normal-case font-normal">* requerido</span>
                        </p>
                        <div className="space-y-3">
                          <Field label="Nombre" required>
                            <input
                              type="text"
                              value={form.parent1Name}
                              onChange={(e) => set('parent1Name', e.target.value)}
                              placeholder="María García"
                              className={inputCls}
                            />
                          </Field>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Teléfono">
                              <input
                                type="tel"
                                value={form.parent1Phone}
                                onChange={(e) => set('parent1Phone', e.target.value)}
                                placeholder="+549..."
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Email">
                              <input
                                type="email"
                                value={form.parent1Email}
                                onChange={(e) => set('parent1Email', e.target.value)}
                                placeholder="maria@email.com"
                                className={inputCls}
                              />
                            </Field>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                          Padre / Tutor 2{' '}
                          <span className="normal-case font-normal text-zinc-400 dark:text-zinc-600">
                            opcional
                          </span>
                        </p>
                        <div className="space-y-3">
                          <Field label="Nombre">
                            <input
                              type="text"
                              value={form.parent2Name}
                              onChange={(e) => set('parent2Name', e.target.value)}
                              placeholder="Carlos García"
                              className={inputCls}
                            />
                          </Field>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Teléfono">
                              <input
                                type="tel"
                                value={form.parent2Phone}
                                onChange={(e) => set('parent2Phone', e.target.value)}
                                placeholder="+549..."
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Email">
                              <input
                                type="email"
                                value={form.parent2Email}
                                onChange={(e) => set('parent2Email', e.target.value)}
                                placeholder="carlos@email.com"
                                className={inputCls}
                              />
                            </Field>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 dark:text-violet-500 mb-3">
                          La festejada
                        </p>
                        <div className="space-y-3">
                          <Field label="Nombre">
                            <input
                              type="text"
                              value={form.birthdayPersonName}
                              onChange={(e) => set('birthdayPersonName', e.target.value)}
                              placeholder="Sofía García"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Teléfono">
                            <input
                              type="tel"
                              value={form.birthdayPersonPhone}
                              onChange={(e) => set('birthdayPersonPhone', e.target.value)}
                              placeholder="+549..."
                              className={inputCls}
                            />
                          </Field>
                        </div>
                      </div>
                    </>
                  )}

                  <hr className="border-zinc-100 dark:border-white/5" />

                  {/* Datos del evento */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">
                      Datos del evento
                    </p>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Fecha tentativa">
                          <input
                            type="date"
                            value={form.eventDate}
                            onChange={(e) => set('eventDate', e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Hora tentativa">
                          <input
                            type="time"
                            value={form.eventTime}
                            onChange={(e) => set('eventTime', e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Cantidad de personas">
                          <input
                            type="number"
                            min="1"
                            value={form.guestCount}
                            onChange={(e) => set('guestCount', e.target.value)}
                            placeholder="150"
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Lugar">
                          <input
                            type="text"
                            value={form.eventLocation}
                            onChange={(e) => set('eventLocation', e.target.value)}
                            placeholder="Salón Las Palmas"
                            className={inputCls}
                          />
                        </Field>
                      </div>
                      <Field label="Preferencia de DJ">
                        <input
                          type="text"
                          value={form.djPreference}
                          onChange={(e) => set('djPreference', e.target.value)}
                          placeholder="Sin preferencia"
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </div>

                  <Field label="Notas internas">
                    <textarea
                      rows={2}
                      value={form.eventNotes}
                      onChange={(e) => set('eventNotes', e.target.value)}
                      placeholder="Contexto adicional..."
                      className={cn(inputCls, 'resize-none')}
                    />
                  </Field>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-zinc-100 dark:border-white/5 shrink-0 flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 rounded-lg border border-zinc-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar contacto'}
                  </button>
                </div>
              </>
            ) : (
              /* Step: action */
              <>
                <div className="flex-1 px-5 py-5 space-y-4">
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Contacto <strong>{form.name}</strong> guardado correctamente
                    </p>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    ¿Qué querés hacer ahora?
                  </p>

                  <div className="space-y-2">
                    {!generatedLink ? (
                      <button
                        onClick={handleSendLink}
                        disabled={isSendingLink}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-700 dark:text-violet-300 transition-colors hover:bg-violet-500/15 disabled:opacity-40"
                      >
                        {isSendingLink ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {form.email
                              ? 'Enviar link de reserva por email'
                              : 'Obtener link de reserva'}
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 p-3 space-y-2">
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Link de reserva
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="flex-1 truncate text-xs font-mono text-zinc-600 dark:text-zinc-300">
                            {generatedLink}
                          </span>
                          <button
                            onClick={handleCopyLink}
                            className="flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
                          >
                            {copiedLink ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            {copiedLink ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-4 border-t border-zinc-100 dark:border-white/5 shrink-0">
                  <button
                    onClick={handleFinish}
                    className="w-full rounded-lg border border-zinc-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
                  >
                    Listo, cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
