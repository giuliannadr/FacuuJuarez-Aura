import { z } from 'zod'

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

export const addSlotSchema = z
  .object({
    date: z.string().min(1, 'Seleccioná una fecha'),
    startTime: z
      .string()
      .regex(TIME_REGEX, 'Formato inválido (HH:MM)')
      .min(1, 'Ingresá un horario de inicio'),
    endTime: z
      .string()
      .regex(TIME_REGEX, 'Formato inválido (HH:MM)')
      .min(1, 'Ingresá un horario de fin'),
    context: z.enum(['aura', 'facundo_solo']),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'El horario de fin debe ser posterior al inicio',
    path: ['endTime'],
  })

export type AddSlotInput = z.infer<typeof addSlotSchema>
