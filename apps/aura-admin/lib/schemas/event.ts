import { z } from 'zod'

export const EVENT_STATUSES = [
  { value: 'draft', label: 'Borrador', color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
  { value: 'confirmed', label: 'Confirmado', color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { value: 'in_progress', label: 'En curso', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { value: 'completed', label: 'Completado', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { value: 'cancelled', label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/10' },
] as const

export type EventStatus = (typeof EVENT_STATUSES)[number]['value']

export const eventFormSchema = z.object({
  context: z.enum(['aura', 'facundo_solo']),
  title: z.string().min(3, 'El título es obligatorio'),
  clientName: z.string().min(2, 'Nombre del cliente obligatorio'),
  clientEmail: z.string().email('Email inválido'),
  serviceDescription: z.string().optional(),
  price: z.string().optional(),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  showPrice: z.boolean().default(false),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  venue: z.string().optional(),
  status: z.enum(['draft', 'confirmed', 'in_progress', 'completed', 'cancelled']).default('draft'),
  memberIds: z.array(z.string()).min(1, 'Asigná al menos un integrante'),
  memberRoles: z.record(z.string(), z.string()).optional(),
  notes: z.string().optional(),
})

// EventFormValues = input type (what the form holds; in Zod v4, z.input<> = pre-parse)
// Used with useForm<EventFormValues> so zodResolver's Resolver<input> types align
export type EventFormValues = z.input<typeof eventFormSchema>

// EventFormInput = output type (defaults resolved; in Zod v4, z.infer/z.output<> = post-parse)
export type EventFormInput = z.output<typeof eventFormSchema>
