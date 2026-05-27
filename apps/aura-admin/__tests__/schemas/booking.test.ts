import { describe, it, expect } from 'vitest'
import {
  createClientBookingSchema,
  createSecondBookingSchema,
  createSecondBookingTokenSchema,
  eventTypeLabel,
} from '@/lib/schemas/booking'

// ─── Datos de base válidos ────────────────────────────────────────────────────

const validBooking = {
  context: 'aura' as const,
  coordinatorId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  date: '2026-07-15',
  startTime: '10:00',
  endTime: '10:45',
  clientName: 'María García',
  clientEmail: 'maria@example.com',
  clientPhone: '+5491112345678',
  eventType: 'casamiento' as const,
}

// ─── createClientBookingSchema ────────────────────────────────────────────────

describe('createClientBookingSchema', () => {
  it('acepta datos completamente válidos', () => {
    const result = createClientBookingSchema.safeParse(validBooking)
    expect(result.success).toBe(true)
  })

  it('acepta contexto "facundo_solo"', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      context: 'facundo_solo',
    })
    expect(result.success).toBe(true)
  })

  // ── clientName ─────────────────────────────────────────────────────────────

  it('rechaza nombre con menos de 2 caracteres', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      clientName: 'A',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('nombre')
  })

  it('acepta nombre con exactamente 2 caracteres', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      clientName: 'Al',
    })
    expect(result.success).toBe(true)
  })

  // ── clientEmail ────────────────────────────────────────────────────────────

  it('rechaza email inválido', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      clientEmail: 'no-es-un-email',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('Email')
  })

  it('rechaza email sin dominio', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      clientEmail: 'usuario@',
    })
    expect(result.success).toBe(false)
  })

  // ── clientPhone ────────────────────────────────────────────────────────────

  it('acepta teléfono con código de país y +', () => {
    const phones = ['+5491112345678', '+12025551234', '+447911123456']
    for (const clientPhone of phones) {
      const result = createClientBookingSchema.safeParse({ ...validBooking, clientPhone })
      expect(result.success, `falló para ${clientPhone}`).toBe(true)
    }
  })

  it('acepta teléfono sin + (solo dígitos)', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      clientPhone: '5491112345678',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza teléfono con letras', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      clientPhone: '+549XXXXXXXXX',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza teléfono con espacios', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      clientPhone: '+549 1112 345678',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza teléfono con guiones', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      clientPhone: '+549-1112-345678',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza teléfono muy corto (menos de 8 dígitos)', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      clientPhone: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza teléfono muy largo (más de 15 dígitos)', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      clientPhone: '1234567890123456', // 16 dígitos
    })
    expect(result.success).toBe(false)
  })

  it('rechaza teléfono vacío', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      clientPhone: '',
    })
    expect(result.success).toBe(false)
  })

  // ── coordinatorId ──────────────────────────────────────────────────────────

  it('rechaza coordinatorId que no sea UUID', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      coordinatorId: 'no-es-un-uuid',
    })
    expect(result.success).toBe(false)
  })

  // ── context ────────────────────────────────────────────────────────────────

  it('rechaza contexto inválido', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      context: 'invalido',
    })
    expect(result.success).toBe(false)
  })

  // ── eventType ──────────────────────────────────────────────────────────────

  it('acepta todos los tipos de evento válidos', () => {
    const validTypes = [
      'fiesta_15',
      'fiesta_18',
      'cumpleanos',
      'corporativo',
      'casamiento',
      'otro',
    ] as const
    for (const eventType of validTypes) {
      const result = createClientBookingSchema.safeParse({ ...validBooking, eventType })
      expect(result.success, `falló para eventType=${eventType}`).toBe(true)
    }
  })

  it('rechaza tipo de evento inválido', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      eventType: 'boda', // no está en el enum
    })
    expect(result.success).toBe(false)
  })

  // ── campos opcionales ──────────────────────────────────────────────────────

  it('acepta sin campos opcionales', () => {
    const result = createClientBookingSchema.safeParse(validBooking)
    expect(result.success).toBe(true)
  })

  it('acepta con todos los campos opcionales', () => {
    const result = createClientBookingSchema.safeParse({
      ...validBooking,
      eventType: 'otro',
      eventTypeOther: 'Fiesta de graduación',
      eventDate: '2026-12-15',
      eventTime: '21:00',
      guestCount: 150,
      eventLocation: 'Salón Royal, Buenos Aires',
      djPreference: 'dj-uuid-1234',
      message: 'Necesitamos música electrónica y cumbia',
    })
    expect(result.success).toBe(true)
  })
})

// ─── createSecondBookingSchema ────────────────────────────────────────────────

describe('createSecondBookingSchema', () => {
  const validSecond = {
    token: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    date: '2026-08-01',
    startTime: '15:00',
    endTime: '15:45',
  }

  it('acepta datos válidos', () => {
    const result = createSecondBookingSchema.safeParse(validSecond)
    expect(result.success).toBe(true)
  })

  it('rechaza token que no sea UUID', () => {
    const result = createSecondBookingSchema.safeParse({
      ...validSecond,
      token: 'no-es-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza date vacía', () => {
    const result = createSecondBookingSchema.safeParse({
      ...validSecond,
      date: '',
    })
    expect(result.success).toBe(false)
  })

  it('rechaza startTime vacía', () => {
    const result = createSecondBookingSchema.safeParse({
      ...validSecond,
      startTime: '',
    })
    expect(result.success).toBe(false)
  })
})

// ─── createSecondBookingTokenSchema ──────────────────────────────────────────

describe('createSecondBookingTokenSchema', () => {
  const validToken = {
    firstBookingId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    clientId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    selectedDjIds: ['c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'],
  }

  it('acepta datos válidos', () => {
    const result = createSecondBookingTokenSchema.safeParse(validToken)
    expect(result.success).toBe(true)
  })

  it('acepta múltiples DJs', () => {
    const result = createSecondBookingTokenSchema.safeParse({
      ...validToken,
      selectedDjIds: [
        'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rechaza selectedDjIds vacío', () => {
    const result = createSecondBookingTokenSchema.safeParse({
      ...validToken,
      selectedDjIds: [],
    })
    expect(result.success).toBe(false)
  })

  it('rechaza DjId que no sea UUID', () => {
    const result = createSecondBookingTokenSchema.safeParse({
      ...validToken,
      selectedDjIds: ['no-soy-uuid'],
    })
    expect(result.success).toBe(false)
  })

  it('rechaza firstBookingId que no sea UUID', () => {
    const result = createSecondBookingTokenSchema.safeParse({
      ...validToken,
      firstBookingId: '12345',
    })
    expect(result.success).toBe(false)
  })
})

// ─── eventTypeLabel ───────────────────────────────────────────────────────────

describe('eventTypeLabel', () => {
  it('devuelve el label correcto para cada tipo', () => {
    expect(eventTypeLabel('fiesta_15')).toBe('Fiesta de XV')
    expect(eventTypeLabel('fiesta_18')).toBe('Fiesta de 18')
    expect(eventTypeLabel('cumpleanos')).toBe('Cumpleaños')
    expect(eventTypeLabel('corporativo')).toBe('Evento corporativo')
    expect(eventTypeLabel('casamiento')).toBe('Casamiento')
    expect(eventTypeLabel('otro')).toBe('Otro')
  })

  it('devuelve el valor original si el tipo es desconocido', () => {
    expect(eventTypeLabel('tipo_raro')).toBe('tipo_raro')
  })
})
