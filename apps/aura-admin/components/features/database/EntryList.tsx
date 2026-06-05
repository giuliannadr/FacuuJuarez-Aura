'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Pencil, Loader2, X, Check, Copy, Download, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  createEntry,
  updateEntry,
  deleteEntry,
  generateExportToken,
} from '@/app/(dashboard)/database/actions'
import type { TemplateGroup, FieldDef } from '@/lib/database-schema'
import { PhoneInput, EventDatePicker } from '@/components/ui/booking-inputs'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const inputCls =
  'w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors'

interface Entry {
  id: string
  templateId: string | null
  data: Record<string, string>
  createdAt: Date
}

interface EntryListProps {
  databaseId: string
  schema: TemplateGroup[]
  entries: Entry[]
}

// ─── Dynamic field renderer ───────────────────────────────────────────────────

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
}) {
  if (field.type === 'section_header') return null
  if (field.type === 'phone') {
    return <PhoneInput onChange={onChange} inputClass={inputCls} defaultValue={value} />
  }
  if (field.type === 'date') {
    return (
      <EventDatePicker
        value={value}
        onChange={onChange}
        inputClass={inputCls}
        allowPast={field.allowPast}
      />
    )
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.label}
      className={inputCls}
    />
  )
}

// ─── Entry form modal ─────────────────────────────────────────────────────────

function EntryFormModal({
  databaseId,
  schema,
  entry,
  onClose,
}: {
  databaseId: string
  schema: TemplateGroup[]
  entry?: Entry
  onClose: () => void
}) {
  const router = useRouter()
  const isEdit = !!entry

  // If multiple templates and creating new, pick template first
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    isEdit ? (entry.templateId ?? schema[0]?.id ?? null) : schema.length === 1 ? schema[0].id : null
  )
  const [data, setData] = useState<Record<string, string>>(isEdit ? { ...entry.data } : {})
  const [isPending, startTransition] = useTransition()

  const template = schema.find((g) => g.id === selectedTemplate) ?? null
  const dataFields = template?.fields.filter((f) => f.type !== 'section_header') ?? []

  function setField(fieldId: string, value: string) {
    setData((d) => ({ ...d, [fieldId]: value }))
  }

  function validate() {
    if (!template) return false
    return template.fields
      .filter((f) => f.required && f.type !== 'section_header')
      .every((f) => (data[f.id] ?? '').trim().length > 0)
  }

  function handleSubmit() {
    if (!template) {
      toast.error('Seleccioná un formulario')
      return
    }
    if (!validate()) {
      toast.error('Completá los campos obligatorios')
      return
    }

    startTransition(async () => {
      const r = isEdit
        ? await updateEntry(entry.id, data)
        : await createEntry(databaseId, template.id, data)

      if (r.success) {
        toast.success(isEdit ? 'Registro actualizado' : 'Registro guardado')
        onClose()
        router.refresh()
      } else {
        toast.error(r.error)
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex flex-col max-h-[90vh] shadow-2xl">
        <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-white/5 shrink-0">
          <h3 className="font-semibold text-zinc-900 dark:text-white text-base">
            {isEdit ? 'Editar registro' : 'Nuevo registro'}
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Template selector */}
          {schema.length > 1 && !isEdit && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Tipo de cliente
              </label>
              <div className="flex flex-wrap gap-2">
                {schema.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(g.id)
                      setData({})
                    }}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                      selectedTemplate === g.id
                        ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                        : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:border-violet-300 dark:hover:border-violet-500/30'
                    )}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic fields */}
          {template?.fields.map((field) => {
            if (field.type === 'section_header') {
              return (
                <div key={field.id} className="pt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-white/5 pb-1">
                    {field.label}
                  </p>
                </div>
              )
            }
            return (
              <div key={field.id} className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <DynamicField
                  field={field}
                  value={data[field.id] ?? ''}
                  onChange={(v) => setField(field.id, v)}
                />
              </div>
            )
          })}

          {!selectedTemplate && (
            <p className="text-sm text-zinc-400 dark:text-zinc-600 text-center py-4">
              Seleccioná el tipo de cliente para continuar
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-zinc-100 dark:border-white/5 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !selectedTemplate}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              'Guardar cambios'
            ) : (
              'Agregar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── WhatsApp button ──────────────────────────────────────────────────────────

function WhatsAppBtn({ phone, label }: { phone: string; label?: string }) {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      title={label ?? 'WhatsApp'}
      className="flex items-center gap-1.5 rounded-md border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current shrink-0">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.287 7.042L.788 23.478a.5.5 0 00.609.637l4.571-1.462A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.378 0-4.586-.734-6.408-1.988l-.328-.217-3.399 1.087 1.108-3.286-.236-.345A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      </svg>
      {label ?? phone}
    </a>
  )
}

// ─── Main EntryList ───────────────────────────────────────────────────────────

export function EntryList({ databaseId, schema, entries }: EntryListProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()
  const [exportUrl, setExportUrl] = useState<string | null>(null)
  const [copiedExport, setCopiedExport] = useState(false)
  const [isExporting, startExportTransition] = useTransition()

  function handleDelete(entry: Entry) {
    if (!confirm('¿Eliminar este registro?')) return
    startDeleteTransition(async () => {
      const r = await deleteEntry(entry.id, databaseId)
      if (r.success) {
        toast.success('Registro eliminado')
        router.refresh()
      } else toast.error(r.error)
    })
  }

  function handleExport() {
    startExportTransition(async () => {
      const r = await generateExportToken(databaseId)
      if (r.success && r.url) {
        setExportUrl(r.url)
      } else if (!r.success) {
        toast.error(r.error)
      }
    })
  }

  async function handleCopyExport() {
    if (!exportUrl) return
    await navigator.clipboard.writeText(exportUrl)
    setCopiedExport(true)
    toast.success('Link copiado')
    setTimeout(() => setCopiedExport(false), 2000)
  }

  // Find phone fields in schema for WhatsApp buttons
  function getPhoneFields(templateId: string | null): FieldDef[] {
    const template = schema.find((g) => g.id === templateId) ?? schema[0]
    return template?.fields.filter((f) => f.type === 'phone') ?? []
  }

  // Get "name" field value (first text field)
  function getDisplayName(entry: Entry): string {
    const template = schema.find((g) => g.id === entry.templateId) ?? schema[0]
    const nameField = template?.fields.find(
      (f) => f.type === 'text' && f.label.toLowerCase().includes('nombre')
    )
    if (nameField) return entry.data[nameField.id] ?? '—'
    const firstText = template?.fields.find((f) => f.type === 'text')
    return firstText ? (entry.data[firstText.id] ?? '—') : '—'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Registros</h2>
          <span className="text-xs text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-white/5 rounded-full px-2 py-0.5 font-medium">
            {entries.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Export */}
          {entries.length > 0 && (
            <>
              {exportUrl ? (
                <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 pl-3 pr-1.5 py-1.5">
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-[160px] truncate">
                    {exportUrl.replace(/^https?:\/\//, '')}
                  </span>
                  <button
                    onClick={handleCopyExport}
                    className="flex items-center gap-1 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
                  >
                    {copiedExport ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copiedExport ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
                >
                  {isExporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Link2 className="h-3.5 w-3.5" />
                  )}
                  Exportar (48h)
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-500 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </button>
        </div>
      </div>

      {/* Entry cards */}
      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] px-6 py-10 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">Aún no hay registros</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const phoneFields = getPhoneFields(entry.templateId)
            const displayName = getDisplayName(entry)
            const template = schema.find((g) => g.id === entry.templateId)

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-white/8 bg-white dark:bg-zinc-900 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  {template && (
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">
                      {template.name} ·{' '}
                      {format(new Date(entry.createdAt), 'd MMM yyyy', { locale: es })}
                    </p>
                  )}
                </div>

                {/* WhatsApp buttons */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {phoneFields.map((f) => {
                    const phone = entry.data[f.id] ?? ''
                    if (!phone) return null
                    return (
                      <WhatsAppBtn
                        key={f.id}
                        phone={phone}
                        label={
                          phoneFields.length > 1
                            ? f.label.replace(/whatsapp/i, '').trim() || 'WA'
                            : undefined
                        }
                      />
                    )
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => setEditEntry(entry)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry)}
                    disabled={isDeleting}
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
            )
          })}
        </div>
      )}

      {showAdd && (
        <EntryFormModal databaseId={databaseId} schema={schema} onClose={() => setShowAdd(false)} />
      )}

      {editEntry && (
        <EntryFormModal
          databaseId={databaseId}
          schema={schema}
          entry={editEntry}
          onClose={() => setEditEntry(null)}
        />
      )}
    </div>
  )
}
