import { z } from 'zod'

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

// ─── Slot individual (un día puntual) ─────────────────────────────────────────
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

// ─── Horario semanal (varios días y franjas) ──────────────────────────────────
const timeRangeSchema = z
  .object({
    startTime: z.string().regex(TIME_REGEX, 'Formato inválido'),
    endTime: z.string().regex(TIME_REGEX, 'Formato inválido'),
  })
  .refine((r) => r.startTime < r.endTime, {
    message: 'El horario de fin debe ser posterior al inicio',
    path: ['endTime'],
  })

export const addWeeklySlotsSchema = z
  .object({
    /** Días de la semana: valores JS getDay() — 0=Dom, 1=Lun … 6=Sáb */
    daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1, 'Seleccioná al menos un día'),
    timeRanges: z
      .array(timeRangeSchema)
      .min(1, 'Agregá al menos una franja horaria')
      .max(8, 'Máximo 8 franjas por horario'),
    dateFrom: z.string().min(1, 'Seleccioná la fecha de inicio'),
    dateTo: z.string().min(1, 'Seleccioná la fecha de fin'),
    context: z.enum(['aura', 'facundo_solo']),
  })
  .refine((d) => d.dateFrom <= d.dateTo, {
    message: 'La fecha de inicio debe ser anterior o igual a la de fin',
    path: ['dateTo'],
  })

export type AddWeeklySlotsInput = z.infer<typeof addWeeklySlotsSchema>

// ─── Guardar plantilla de horario base ────────────────────────────────────────
export const saveScheduleTemplateSchema = z.object({
  context: z.enum(['aura', 'facundo_solo']),
  activeDays: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      timeRanges: z
        .array(timeRangeSchema)
        .min(1, 'Agregá al menos una franja por día')
        .max(8, 'Máximo 8 franjas por día'),
    })
  ),
})

export type SaveScheduleTemplateInput = z.infer<typeof saveScheduleTemplateSchema>

// ─── Aplicar plantilla a un rango de fechas ───────────────────────────────────
export const applyTemplateSchema = z.object({
  context: z.enum(['aura', 'facundo_solo']),
  weeks: z.number().int().min(1).max(52),
})
