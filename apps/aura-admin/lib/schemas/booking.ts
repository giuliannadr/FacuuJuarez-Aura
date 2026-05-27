import { z } from 'zod'

// ─── Tipos de evento ──────────────────────────────────────────────────────────

export const EVENT_TYPES = [
  { value: 'fiesta_15', label: 'Fiesta de XV' },
  { value: 'fiesta_18', label: 'Fiesta de 18' },
  { value: 'cumpleanos', label: 'Cumpleaños' },
  { value: 'corporativo', label: 'Evento corporativo' },
  { value: 'casamiento', label: 'Casamiento' },
  { value: 'otro', label: 'Otro' },
] as const

export type EventType = (typeof EVENT_TYPES)[number]['value']

export function eventTypeLabel(type: string): string {
  return EVENT_TYPES.find((t) => t.value === type)?.label ?? type
}

// ─── Esquema: primera reunión (formulario público /book y /facuu) ─────────────

export const createClientBookingSchema = z.object({
  context: z.enum(['aura', 'facundo_solo']),
  coordinatorId: z.string().uuid(),
  date: z.string().min(1, 'Seleccioná una fecha'),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  // Datos del cliente
  clientName: z.string().min(2, 'Ingresá tu nombre completo'),
  clientEmail: z.string().email('Email inválido'),
  clientPhone: z
    .string()
    .min(1, 'Ingresá tu número de WhatsApp')
    .regex(/^\+?[0-9]{8,15}$/, 'Solo dígitos, puede comenzar con +. Ej: +5491112345678'),
  // Detalles del evento
  eventType: z.enum(['fiesta_15', 'fiesta_18', 'cumpleanos', 'corporativo', 'casamiento', 'otro']),
  eventTypeOther: z.string().optional(),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  guestCount: z.coerce.number().int().positive().nullable().optional(),
  eventLocation: z.string().optional(),
  djPreference: z.string().optional(),
  message: z.string().optional(),
})

export type CreateClientBookingInput = z.infer<typeof createClientBookingSchema>

// ─── Esquema: generar token de segunda reserva (dashboard) ────────────────────

export const createSecondBookingTokenSchema = z.object({
  firstBookingId: z.string().uuid(),
  clientId: z.string().uuid(),
  selectedDjIds: z.array(z.string().uuid()).min(1, 'Seleccioná al menos un DJ'),
})

export type CreateSecondBookingTokenInput = z.infer<typeof createSecondBookingTokenSchema>

// ─── Esquema: segunda reunión (formulario público /book/segunda/[token]) ───────

export const createSecondBookingSchema = z.object({
  token: z.string().uuid(),
  date: z.string().min(1, 'Seleccioná una fecha'),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
})

export type CreateSecondBookingInput = z.infer<typeof createSecondBookingSchema>

// ─── Legacy (compatibilidad hacia atrás) ──────────────────────────────────────

export const MEETING_TYPES = [
  {
    value: 'meeting',
    label: 'Reunión general',
    description: 'Consulta, presentación o seguimiento',
  },
  {
    value: 'quote',
    label: 'Solicitar presupuesto',
    description: 'Quiero conocer precios y disponibilidad',
  },
] as const

export type MeetingType = 'meeting' | 'quote'

export const bookingContactSchema = z.object({
  meetingType: z.enum(['meeting', 'quote']),
  clientName: z.string().min(2, 'Ingresá tu nombre completo'),
  clientEmail: z.string().email('Email inválido'),
  subject: z.string().min(4, 'Contanos brevemente el motivo'),
  message: z.string().optional(),
})

export const createBookingSchema = z.object({
  context: z.enum(['aura', 'facundo_solo']),
  meetingType: z.enum(['meeting', 'quote']),
  memberIds: z.array(z.string().uuid()).min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  subject: z.string().min(4),
  message: z.string().optional(),
})

export type BookingContactInput = z.infer<typeof bookingContactSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
