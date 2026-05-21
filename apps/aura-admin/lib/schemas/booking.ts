import { z } from 'zod'

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
  memberIds: z.array(z.string().uuid()).min(1, 'Seleccioná al menos un participante'),
  date: z.string().min(1, 'Seleccioná una fecha'),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  subject: z.string().min(4),
  message: z.string().optional(),
})

export type BookingContactInput = z.infer<typeof bookingContactSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
