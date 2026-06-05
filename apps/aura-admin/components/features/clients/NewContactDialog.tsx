'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { createContact, sendBookingLinkToContact } from '@/app/(dashboard)/clients/actions'
import {
  PhoneInput,
  EventDatePicker,
  TimePicker,
  EventTypeRadioGrid,
} from '@/components/ui/booking-inputs'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Step = 'form' | 'action'

const inputCls =
  'w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors'

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
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pb-1',
        className
      )}
    >
      {children}
    </p>
  )
}

/** Compact inline toggle */
function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}</p>
        {description && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
          checked ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-600'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md ring-0',
            'transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

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
  const [isPotentialClient, setIsPotentialClient] = useState(false)
  const [eventType, setEventType] = useState('fiesta_15')
  const [hasOrganizer, setHasOrganizer] = useState(false)
  const [savedName, setSavedName] = useState('')
  const [savedEmail, setSavedEmail] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    // Quinceañera — festejada
    birthdayPersonName: '',
    birthdayPersonPhone: '',
    birthdayPersonBirthDate: '',
    // Quinceañera — padres
    parent1Name: '',
    parent1Phone: '',
    parent1Email: '',
    parent2Name: '',
    parent2Phone: '',
    parent2Email: '',
    notes: '',
    // Event
    eventTypeOther: '',
    eventDate: '',
    eventTime: '',
    guestCount: '',
    eventLocation: '',
    djPreference: '',
    organizerName: '',
    organizerPhone: '',
    organizerEmail: '',
    eventNotes: '',
  })

  const isQuinceanera = eventType === 'fiesta_15'

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setStep('form')
    setNewContactId(null)
    setGeneratedLink(null)
    setCopiedLink(false)
    setSavedName('')
    setSavedEmail('')
    setIsPotentialClient(false)
    setEventType('fiesta_15')
    setHasOrganizer(false)
    setForm({
      name: '',
      email: '',
      phone: '',
      birthdayPersonName: '',
      birthdayPersonPhone: '',
      birthdayPersonBirthDate: '',
      parent1Name: '',
      parent1Phone: '',
      parent1Email: '',
      parent2Name: '',
      parent2Phone: '',
      parent2Email: '',
      notes: '',
      eventTypeOther: '',
      eventDate: '',
      eventTime: '',
      guestCount: '',
      eventLocation: '',
      djPreference: '',
      organizerName: '',
      organizerPhone: '',
      organizerEmail: '',
      eventNotes: '',
    })
  }

  function handleOpen() {
    resetForm()
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
  }

  function handleSubmit() {
    if (!isQuinceanera && !form.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    if (isQuinceanera && !form.parent1Name.trim() && !form.birthdayPersonName.trim()) {
      toast.error('Ingresá al menos el nombre de la festejada o del padre/tutor 1')
      return
    }

    startTransition(async () => {
      const result = await createContact({
        isPotentialClient,
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        // Quinceañera
        birthdayPersonName: isQuinceanera ? form.birthdayPersonName || undefined : undefined,
        birthdayPersonPhone: isQuinceanera ? form.birthdayPersonPhone || undefined : undefined,
        birthdayPersonBirthDate: isQuinceanera
          ? form.birthdayPersonBirthDate || undefined
          : undefined,
        parent1Name: isQuinceanera ? form.parent1Name || undefined : undefined,
        parent1Phone: isQuinceanera ? form.parent1Phone || undefined : undefined,
        parent1Email: isQuinceanera ? form.parent1Email || undefined : undefined,
        parent2Name: isQuinceanera ? form.parent2Name || undefined : undefined,
        parent2Phone: isQuinceanera ? form.parent2Phone || undefined : undefined,
        parent2Email: isQuinceanera ? form.parent2Email || undefined : undefined,
        notes: form.notes || undefined,
        // Event
        eventType,
        eventTypeOther: eventType === 'otro' ? form.eventTypeOther || undefined : undefined,
        eventDate: form.eventDate || undefined,
        eventTime: form.eventTime || undefined,
        guestCount: form.guestCount ? parseInt(form.guestCount) : undefined,
        eventLocation: form.eventLocation || undefined,
        djPreference: form.djPreference || undefined,
        organizerName: hasOrganizer ? form.organizerName || undefined : undefined,
        organizerPhone: hasOrganizer ? form.organizerPhone || undefined : undefined,
        organizerEmail: hasOrganizer ? form.organizerEmail || undefined : undefined,
        eventNotes: form.eventNotes || undefined,
      })

      if (result.success && result.contactId) {
        setNewContactId(result.contactId)
        setSavedName(form.name)
        setSavedEmail(form.email)
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
        } else if (!savedEmail) {
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
          <div className="w-full max-w-2xl rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex flex-col max-h-[90vh] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-zinc-100 dark:border-white/5 shrink-0">
              <h3 className="font-semibold text-zinc-900 dark:text-white text-base">
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
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
                  {/* ── Switch posible cliente ────────────────────────────── */}
                  <Toggle
                    checked={isPotentialClient}
                    onChange={setIsPotentialClient}
                    label="Posible cliente"
                    description="Marcalo como lead si todavía no está confirmado"
                  />

                  {/* ── Tipo de evento ────────────────────────────────────── */}
                  <div>
                    <SectionTitle>Tipo de evento *</SectionTitle>
                    <EventTypeRadioGrid value={eventType} onChange={setEventType} />
                  </div>

                  {eventType === 'otro' && (
                    <Field label="Describí el evento" required>
                      <input
                        type="text"
                        value={form.eventTypeOther}
                        onChange={(e) => set('eventTypeOther', e.target.value)}
                        placeholder="Ej: Fiesta temática, baby shower..."
                        className={inputCls}
                      />
                    </Field>
                  )}

                  <hr className="border-zinc-100 dark:border-white/5" />

                  {isQuinceanera ? (
                    <>
                      {/* ── Quinceañera: festejada primero ───────────────── */}
                      <div className="space-y-4">
                        <SectionTitle className="text-violet-400 dark:text-violet-500">
                          La festejada
                        </SectionTitle>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Nombre">
                            <input
                              type="text"
                              value={form.birthdayPersonName}
                              onChange={(e) => set('birthdayPersonName', e.target.value)}
                              placeholder="Sofía García"
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Fecha de nacimiento">
                            <input
                              type="date"
                              value={form.birthdayPersonBirthDate}
                              onChange={(e) => set('birthdayPersonBirthDate', e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                        </div>
                        <Field label="Teléfono / WhatsApp">
                          <PhoneInput
                            onChange={(v) => set('birthdayPersonPhone', v)}
                            inputClass={inputCls}
                          />
                        </Field>
                      </div>

                      <hr className="border-zinc-100 dark:border-white/5" />

                      {/* ── Padre / Tutor 1 ──────────────────────────────── */}
                      <div className="space-y-4">
                        <SectionTitle>
                          Padre / Tutor 1{' '}
                          <span className="text-red-400 normal-case font-normal tracking-normal">
                            * requerido
                          </span>
                        </SectionTitle>
                        <Field label="Nombre" required>
                          <input
                            type="text"
                            value={form.parent1Name}
                            onChange={(e) => set('parent1Name', e.target.value)}
                            placeholder="María García"
                            className={inputCls}
                          />
                        </Field>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Teléfono / WhatsApp">
                            <PhoneInput
                              onChange={(v) => set('parent1Phone', v)}
                              inputClass={inputCls}
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

                      {/* ── Padre / Tutor 2 ──────────────────────────────── */}
                      <div className="space-y-4">
                        <SectionTitle>
                          Padre / Tutor 2{' '}
                          <span className="normal-case font-normal tracking-normal text-zinc-400 dark:text-zinc-600">
                            opcional
                          </span>
                        </SectionTitle>
                        <Field label="Nombre">
                          <input
                            type="text"
                            value={form.parent2Name}
                            onChange={(e) => set('parent2Name', e.target.value)}
                            placeholder="Carlos García"
                            className={inputCls}
                          />
                        </Field>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Teléfono / WhatsApp">
                            <PhoneInput
                              onChange={(v) => set('parent2Phone', v)}
                              inputClass={inputCls}
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
                    </>
                  ) : (
                    /* ── Contacto general ────────────────────────────────── */
                    <div className="space-y-4">
                      <SectionTitle>Datos del contacto</SectionTitle>
                      <Field label="Nombre completo" required>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => set('name', e.target.value)}
                          placeholder="Juan Pérez"
                          className={inputCls}
                        />
                      </Field>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          <PhoneInput onChange={(v) => set('phone', v)} inputClass={inputCls} />
                        </Field>
                      </div>
                    </div>
                  )}

                  <hr className="border-zinc-100 dark:border-white/5" />

                  {/* ── Datos del evento ──────────────────────────────────── */}
                  <div className="space-y-4">
                    <SectionTitle>Datos de la fiesta</SectionTitle>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Fecha tentativa">
                        <EventDatePicker
                          value={form.eventDate}
                          onChange={(v) => set('eventDate', v)}
                          inputClass={inputCls}
                        />
                      </Field>
                      <Field label="Horario tentativo">
                        <TimePicker
                          value={form.eventTime}
                          onChange={(v) => set('eventTime', v)}
                          inputClass={inputCls}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      <Field label="Lugar del evento">
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

                    {/* Organizador del evento */}
                    <Toggle
                      checked={hasOrganizer}
                      onChange={setHasOrganizer}
                      label="¿Tienen organizador/a de evento?"
                    />

                    {hasOrganizer && (
                      <div className="space-y-4 rounded-lg border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] p-4">
                        <Field label="Nombre del organizador/a">
                          <input
                            type="text"
                            value={form.organizerName}
                            onChange={(e) => set('organizerName', e.target.value)}
                            placeholder="Laura Martínez"
                            className={inputCls}
                          />
                        </Field>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Teléfono / WhatsApp">
                            <PhoneInput
                              onChange={(v) => set('organizerPhone', v)}
                              inputClass={inputCls}
                            />
                          </Field>
                          <Field label="Email">
                            <input
                              type="email"
                              value={form.organizerEmail}
                              onChange={(e) => set('organizerEmail', e.target.value)}
                              placeholder="laura@eventos.com"
                              className={inputCls}
                            />
                          </Field>
                        </div>
                      </div>
                    )}
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
                <div className="px-6 py-4 border-t border-zinc-100 dark:border-white/5 shrink-0 flex gap-3">
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
              /* ── Action step ────────────────────────────────────────────── */
              <>
                <div className="flex-1 px-6 py-5 space-y-4">
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      {isPotentialClient ? 'Posible cliente' : 'Cliente'}{' '}
                      <strong>{savedName}</strong> guardado correctamente
                    </p>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    ¿Qué querés hacer ahora?
                  </p>

                  {!generatedLink ? (
                    <button
                      onClick={handleSendLink}
                      disabled={isSendingLink}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-700 dark:text-violet-300 transition-colors hover:bg-violet-500/15 disabled:opacity-40"
                    >
                      {isSendingLink ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : savedEmail ? (
                        'Enviar link de reserva por email'
                      ) : (
                        'Obtener link de reserva'
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

                <div className="px-6 py-4 border-t border-zinc-100 dark:border-white/5 shrink-0">
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
