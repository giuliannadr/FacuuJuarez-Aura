/**
 * Pure types + constants for the database feature.
 * Safe to import in Client Components — zero Node.js / pg / drizzle deps.
 */

export type FieldType = 'text' | 'phone' | 'date' | 'section_header'

export interface FieldDef {
  id: string
  type: FieldType
  label: string
  required?: boolean
  /** true when type === 'phone' */
  isPhone?: boolean
  /** true when type === 'date' and past dates should be allowed */
  allowPast?: boolean
}

export interface TemplateGroup {
  id: string
  name: string
  fields: FieldDef[]
}

// ─── Pre-built templates ──────────────────────────────────────────────────────

export const PRESET_TEMPLATES: TemplateGroup[] = [
  {
    id: 'menor',
    name: 'Cliente Menor',
    fields: [
      { id: 'menor_header', type: 'section_header', label: 'Datos del menor' },
      { id: 'menor_nombre', type: 'text', label: 'Nombre completo', required: true },
      { id: 'menor_nacimiento', type: 'date', label: 'Fecha de nacimiento', allowPast: true },
      { id: 'menor_whatsapp', type: 'phone', label: 'WhatsApp del menor', isPhone: true },
      {
        id: 'responsable_header',
        type: 'section_header',
        label: 'Datos del padre / responsable',
      },
      { id: 'responsable_nombre', type: 'text', label: 'Nombre completo', required: true },
      {
        id: 'responsable_whatsapp',
        type: 'phone',
        label: 'WhatsApp del responsable',
        required: true,
        isPhone: true,
      },
    ],
  },
  {
    id: 'adulto',
    name: 'Cliente Adulto',
    fields: [
      { id: 'adulto_nombre', type: 'text', label: 'Nombre completo', required: true },
      {
        id: 'adulto_whatsapp',
        type: 'phone',
        label: 'WhatsApp',
        required: true,
        isPhone: true,
      },
    ],
  },
]
