'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateContact } from '@/app/(dashboard)/clients/actions'
import type { ContactDetailData } from './ContactDetailModal'
import { PhoneInput } from '@/components/ui/booking-inputs'
import { cn } from '@/lib/utils'

const inputCls =
  'w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</label>
      {children}
    </div>
  )
}

interface EditContactDialogProps {
  contact: ContactDetailData
  open: boolean
  onClose: () => void
}

export function EditContactDialog({ contact, open, onClose }: EditContactDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const isQuinceanera = contact.events[0]?.eventType === 'fiesta_15'

  const [form, setForm] = useState({
    name: contact.name,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    parent1Name: contact.parent1Name ?? '',
    parent1Phone: contact.parent1Phone ?? '',
    parent1Email: contact.parent1Email ?? '',
    parent2Name: contact.parent2Name ?? '',
    parent2Phone: contact.parent2Phone ?? '',
    parent2Email: contact.parent2Email ?? '',
    birthdayPersonName: contact.birthdayPersonName ?? '',
    birthdayPersonPhone: contact.birthdayPersonPhone ?? '',
    notes: contact.notes ?? '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    startTransition(async () => {
      const result = await updateContact({
        contactId: contact.id,
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
      })
      if (result.success) {
        toast.success('Contacto actualizado')
        onClose()
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex flex-col max-h-[90vh] shadow-2xl">
        <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-white/5 shrink-0">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Editar contacto</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div className="space-y-3">
            <Field label="Nombre completo *">
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Teléfono / WhatsApp">
                <PhoneInput
                  onChange={(v) => set('phone', v)}
                  inputClass={inputCls}
                  defaultValue={form.phone}
                />
              </Field>
            </div>
            <Field label="Notas">
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                className={cn(inputCls, 'resize-none')}
              />
            </Field>
          </div>

          {isQuinceanera && (
            <>
              <hr className="border-zinc-100 dark:border-white/5" />
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Padre / Tutor 1
              </p>
              <div className="space-y-3">
                <Field label="Nombre">
                  <input
                    type="text"
                    value={form.parent1Name}
                    onChange={(e) => set('parent1Name', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Teléfono / WhatsApp">
                    <PhoneInput
                      onChange={(v) => set('parent1Phone', v)}
                      inputClass={inputCls}
                      defaultValue={form.parent1Phone}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.parent1Email}
                      onChange={(e) => set('parent1Email', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Padre / Tutor 2
              </p>
              <div className="space-y-3">
                <Field label="Nombre">
                  <input
                    type="text"
                    value={form.parent2Name}
                    onChange={(e) => set('parent2Name', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Teléfono / WhatsApp">
                    <PhoneInput
                      onChange={(v) => set('parent2Phone', v)}
                      inputClass={inputCls}
                      defaultValue={form.parent2Phone}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.parent2Email}
                      onChange={(e) => set('parent2Email', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 dark:text-violet-500">
                La festejada
              </p>
              <div className="space-y-3">
                <Field label="Nombre">
                  <input
                    type="text"
                    value={form.birthdayPersonName}
                    onChange={(e) => set('birthdayPersonName', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Teléfono / WhatsApp">
                  <PhoneInput
                    onChange={(v) => set('birthdayPersonPhone', v)}
                    inputClass={inputCls}
                    defaultValue={form.birthdayPersonPhone}
                  />
                </Field>
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-zinc-100 dark:border-white/5 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
