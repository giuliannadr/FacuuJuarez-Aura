'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Check } from 'lucide-react'
import { eventFormSchema, EVENT_STATUSES, type EventFormValues } from '@/lib/schemas/event'
import { createEvent, updateEvent } from '@/app/(dashboard)/events/actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/permissions'

interface TeamMember {
  id: string
  name: string
  bio: string | null
}

interface EventFormProps {
  role: Role
  members: TeamMember[]
  defaultValues?: Partial<EventFormValues>
  eventId?: string // si existe, estamos editando
}

const inputClass =
  'w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string
  error?: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-zinc-600">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function EventForm({ role, members, defaultValues, eventId }: EventFormProps) {
  const router = useRouter()
  const isEditing = !!eventId

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      context: 'aura',
      currency: 'ARS',
      showPrice: false,
      status: 'draft',
      memberIds: [],
      ...defaultValues,
    },
  })

  const showPrice = watch('showPrice')
  const selectedIds = watch('memberIds')

  async function onSubmit(data: EventFormValues) {
    const result = isEditing ? await updateEvent(eventId, data) : await createEvent(data)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(isEditing ? 'Evento actualizado' : 'Evento creado')
    router.push('/events')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* ─── Sección 1: Básicos ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Información del evento
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título del evento *" error={errors.title?.message}>
            <input
              {...register('title')}
              placeholder="Ej: Boda García — Dic 2025"
              className={inputClass}
            />
          </Field>

          {/* Contexto — solo Facundo elige */}
          {role === 'facundo' && (
            <Field label="Contexto *" error={errors.context?.message}>
              <div className="flex gap-2">
                {[
                  { value: 'aura', label: 'AURA' },
                  { value: 'facundo_solo', label: 'Personal' },
                ].map((opt) => (
                  <label key={opt.value} className="flex-1">
                    <input
                      type="radio"
                      value={opt.value}
                      {...register('context')}
                      className="peer sr-only"
                    />
                    <span className="flex cursor-pointer items-center justify-center rounded-md border border-white/10 py-2 text-xs font-medium text-zinc-400 transition-colors peer-checked:border-violet-500 peer-checked:bg-violet-500/10 peer-checked:text-violet-400 hover:border-white/20">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          )}

          <Field label="Estado" error={errors.status?.message}>
            <select {...register('status')} className={cn(inputClass, '[color-scheme:dark]')}>
              {EVENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Descripción del servicio" error={errors.serviceDescription?.message}>
          <textarea
            {...register('serviceDescription')}
            rows={3}
            placeholder="Detallá qué incluye el servicio contratado..."
            className={cn(inputClass, 'resize-none')}
          />
        </Field>
      </section>

      {/* ─── Sección 2: Cliente ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Datos del cliente
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del cliente *" error={errors.clientName?.message}>
            <input
              {...register('clientName')}
              placeholder="Nombre y apellido"
              className={inputClass}
            />
          </Field>
          <Field label="Email del cliente *" error={errors.clientEmail?.message}>
            <input
              {...register('clientEmail')}
              type="email"
              placeholder="cliente@email.com"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {/* ─── Sección 3: Fecha, lugar y precio ──────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Fecha, lugar y precio
        </h3>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Fecha del evento" error={errors.eventDate?.message}>
            <input
              type="date"
              {...register('eventDate')}
              className={cn(inputClass, '[color-scheme:dark]')}
            />
          </Field>
          <Field label="Hora" error={errors.eventTime?.message}>
            <input
              type="time"
              {...register('eventTime')}
              className={cn(inputClass, '[color-scheme:dark]')}
            />
          </Field>
          <Field label="Lugar / Venue" error={errors.venue?.message}>
            <input
              {...register('venue')}
              placeholder="Ej: Salón XYZ, Palermo"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Precio" error={errors.price?.message}>
            <input {...register('price')} placeholder="150000" className={inputClass} />
          </Field>
          <Field label="Moneda">
            <select {...register('currency')} className={cn(inputClass, '[color-scheme:dark]')}>
              <option value="ARS">ARS — Pesos</option>
              <option value="USD">USD — Dólares</option>
            </select>
          </Field>
          <Field label="Mostrar precio al cliente" hint="El cliente verá el precio en su link">
            <label className="flex cursor-pointer items-center gap-2 pt-2">
              <input type="checkbox" {...register('showPrice')} className="peer sr-only" />
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded border transition-colors',
                  showPrice ? 'border-violet-500 bg-violet-500' : 'border-white/20 bg-white/5'
                )}
              >
                {showPrice && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-sm text-zinc-400">Sí, mostrar</span>
            </label>
          </Field>
        </div>
      </section>

      {/* ─── Sección 4: Equipo ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Equipo asignado *
        </h3>
        {errors.memberIds && <p className="text-xs text-red-400">{errors.memberIds.message}</p>}

        <Controller
          control={control}
          name="memberIds"
          render={({ field }) => (
            <div className="grid gap-3 sm:grid-cols-2">
              {members.map((member) => {
                const selected = field.value.includes(member.id)
                return (
                  <div
                    key={member.id}
                    className={cn(
                      'rounded-xl border p-4 transition-all',
                      selected
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-white/5 bg-white/[0.02]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const next = selected
                            ? field.value.filter((id) => id !== member.id)
                            : [...field.value, member.id]
                          field.onChange(next)
                        }}
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
                          selected ? 'border-violet-500 bg-violet-500' : 'border-white/20'
                        )}
                      >
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </button>
                      <div>
                        <p className="text-sm font-medium text-white">{member.name}</p>
                        {member.bio && <p className="text-xs text-zinc-500">{member.bio}</p>}
                      </div>
                    </div>

                    {/* Rol específico en el evento */}
                    {selected && (
                      <input
                        {...register(`memberRoles.${member.id}`)}
                        placeholder="Rol en este evento (ej: DJ Principal)"
                        className={cn(inputClass, 'mt-3 text-xs')}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        />
      </section>

      {/* ─── Sección 5: Notas internas ──────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Notas internas
        </h3>
        <Field label="Notas (solo visibles para el equipo)">
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Detalles logísticos, rider técnico, indicaciones del venue..."
            className={cn(inputClass, 'resize-none')}
          />
        </Field>
      </section>

      {/* ─── Acciones ───────────────────────────────────────────────────── */}
      <div className="flex gap-3 border-t border-white/5 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/events')}
          className="border-white/10 text-zinc-400 hover:text-white"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-violet-600 hover:bg-violet-500"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            'Guardar cambios'
          ) : (
            'Crear evento'
          )}
        </Button>
      </div>
    </form>
  )
}
