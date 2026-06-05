'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
  Loader2,
  Settings2,
} from 'lucide-react'
import { toast } from 'sonner'
import { saveEventDatabaseSchema } from '@/app/(dashboard)/database/actions'
import type { TemplateGroup, FieldDef, FieldType } from '@/lib/database-schema'
import { PRESET_TEMPLATES } from '@/lib/database-schema'
import { cn } from '@/lib/utils'

interface SchemaBuilderProps {
  databaseId: string
  initialSchema: TemplateGroup[]
  entryCount: number
}

const inputCls =
  'w-full rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors'

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Texto',
  phone: 'Teléfono / WhatsApp',
  date: 'Fecha',
  section_header: 'Título de sección',
}

function newField(type: FieldType = 'text'): FieldDef {
  return {
    id: crypto.randomUUID(),
    type,
    label: '',
    required: type !== 'section_header',
    isPhone: type === 'phone',
    allowPast: type === 'date',
  }
}

function FieldRow({
  field,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  field: FieldDef
  onChange: (f: FieldDef) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) {
  if (field.type === 'section_header') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5 px-3 py-2">
        <GripVertical className="h-4 w-4 shrink-0 text-violet-300 dark:text-violet-700" />
        <input
          type="text"
          value={field.label}
          onChange={(e) => onChange({ ...field, label: e.target.value })}
          placeholder="Título de sección"
          className="flex-1 bg-transparent text-sm font-semibold text-violet-700 dark:text-violet-300 placeholder:text-violet-300 focus:outline-none"
        />
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={onMoveUp}
            className="flex h-6 w-6 items-center justify-center rounded text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/10 disabled:opacity-30"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={onMoveDown}
            className="flex h-6 w-6 items-center justify-center rounded text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/10 disabled:opacity-30"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded text-violet-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-white/8 bg-white dark:bg-zinc-900 px-3 py-2">
      <GripVertical className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-700" />

      <input
        type="text"
        value={field.label}
        onChange={(e) => onChange({ ...field, label: e.target.value })}
        placeholder="Nombre del campo"
        className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
      />

      <select
        value={field.type}
        onChange={(e) =>
          onChange({
            ...field,
            type: e.target.value as FieldType,
            isPhone: e.target.value === 'phone',
            allowPast: e.target.value === 'date',
          })
        }
        className="rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-300 focus:outline-none"
      >
        {Object.entries(FIELD_TYPE_LABELS)
          .filter(([t]) => t !== 'section_header')
          .map(([t, l]) => (
            <option key={t} value={t}>
              {l}
            </option>
          ))}
      </select>

      <button
        type="button"
        onClick={() => onChange({ ...field, required: !field.required })}
        title={
          field.required
            ? 'Obligatorio — click para hacer opcional'
            : 'Opcional — click para hacer obligatorio'
        }
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded text-xs font-bold transition-colors',
          field.required
            ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
            : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
        )}
      >
        *
      </button>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          disabled={isFirst}
          onClick={onMoveUp}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 disabled:opacity-30"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={onMoveDown}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 disabled:opacity-30"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function SchemaBuilder({ databaseId, initialSchema, entryCount }: SchemaBuilderProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(initialSchema.length === 0)
  const [schema, setSchema] = useState<TemplateGroup[]>(
    initialSchema.length > 0 ? initialSchema : []
  )
  const [isPending, startTransition] = useTransition()

  const hasExistingEntries = entryCount > 0

  function addPreset(preset: TemplateGroup) {
    const alreadyAdded = schema.some((g) => g.id === preset.id)
    if (alreadyAdded) {
      setSchema((s) => s.filter((g) => g.id !== preset.id))
    } else {
      setSchema((s) => [
        ...s,
        { ...preset, fields: preset.fields.map((f) => ({ ...f, id: crypto.randomUUID() })) },
      ])
    }
  }

  function addGroup() {
    setSchema((s) => [...s, { id: crypto.randomUUID(), name: 'Nuevo grupo', fields: [] }])
  }

  function updateGroup(idx: number, group: TemplateGroup) {
    setSchema((s) => s.map((g, i) => (i === idx ? group : g)))
  }

  function removeGroup(idx: number) {
    setSchema((s) => s.filter((_, i) => i !== idx))
  }

  function addFieldToGroup(groupIdx: number, type: FieldType = 'text') {
    setSchema((s) =>
      s.map((g, i) => (i === groupIdx ? { ...g, fields: [...g.fields, newField(type)] } : g))
    )
  }

  function updateField(groupIdx: number, fieldIdx: number, field: FieldDef) {
    setSchema((s) =>
      s.map((g, i) =>
        i === groupIdx ? { ...g, fields: g.fields.map((f, j) => (j === fieldIdx ? field : f)) } : g
      )
    )
  }

  function removeField(groupIdx: number, fieldIdx: number) {
    setSchema((s) =>
      s.map((g, i) =>
        i === groupIdx ? { ...g, fields: g.fields.filter((_, j) => j !== fieldIdx) } : g
      )
    )
  }

  function moveField(groupIdx: number, fieldIdx: number, dir: -1 | 1) {
    setSchema((s) =>
      s.map((g, i) => {
        if (i !== groupIdx) return g
        const fields = [...g.fields]
        const target = fieldIdx + dir
        if (target < 0 || target >= fields.length) return g
        ;[fields[fieldIdx], fields[target]] = [fields[target], fields[fieldIdx]]
        return { ...g, fields }
      })
    )
  }

  function handleSave() {
    if (schema.length === 0) {
      toast.error('Agregá al menos un formulario')
      return
    }
    if (schema.some((g) => g.fields.filter((f) => f.type !== 'section_header').length === 0)) {
      toast.error('Cada formulario debe tener al menos un campo')
      return
    }
    startTransition(async () => {
      const r = await saveEventDatabaseSchema(databaseId, schema)
      if (r.success) {
        toast.success('Formulario guardado')
        setExpanded(false)
        router.refresh()
      } else {
        toast.error(r.error)
      }
    })
  }

  const isSaved = initialSchema.length > 0

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-white/8 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Settings2 className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
            Configurar formulario
          </span>
          {isSaved && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">
              <Check className="h-3 w-3" /> Configurado
            </span>
          )}
        </div>
        <ChevronDown
          className={cn('h-4 w-4 text-zinc-400 transition-transform', expanded && 'rotate-180')}
        />
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 dark:border-white/5 px-5 py-5 space-y-6">
          {hasExistingEntries && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
              ⚠ Ya hay {entryCount} registro{entryCount !== 1 ? 's' : ''} cargado
              {entryCount !== 1 ? 's' : ''}. Los nuevos campos aparecerán vacíos en los registros
              existentes.
            </div>
          )}

          {/* Preset templates */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Plantillas predefinidas
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_TEMPLATES.map((preset) => {
                const active = schema.some((g) => g.id === preset.id)
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => addPreset(preset)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                      active
                        ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                        : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:border-violet-300 dark:hover:border-violet-500/30'
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {preset.name}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={addGroup}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-white/15 px-3 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-white/25 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Formulario personalizado
              </button>
            </div>
          </div>

          {/* Form groups */}
          {schema.length > 0 && (
            <div className="space-y-5">
              {schema.map((group, gi) => (
                <div
                  key={group.id}
                  className="rounded-xl border border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02] p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateGroup(gi, { ...group, name: e.target.value })}
                      className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none border-b border-transparent focus:border-zinc-300 dark:focus:border-white/20 pb-0.5"
                    />
                    <button
                      type="button"
                      onClick={() => removeGroup(gi)}
                      className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {group.fields.map((field, fi) => (
                      <FieldRow
                        key={field.id}
                        field={field}
                        onChange={(f) => updateField(gi, fi, f)}
                        onRemove={() => removeField(gi, fi)}
                        onMoveUp={() => moveField(gi, fi, -1)}
                        onMoveDown={() => moveField(gi, fi, 1)}
                        isFirst={fi === 0}
                        isLast={fi === group.fields.length - 1}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {(['text', 'phone', 'date', 'section_header'] as FieldType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addFieldToGroup(gi, type)}
                        className="flex items-center gap-1 rounded-md border border-dashed border-zinc-300 dark:border-white/10 px-2.5 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        {FIELD_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || schema.length === 0}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40 transition-colors"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Guardar formulario
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
