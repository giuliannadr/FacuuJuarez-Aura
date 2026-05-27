import { describe, it, expect, vi } from 'vitest'

vi.mock('@aura/db', () => ({
  db: {},
  availabilitySlots: {},
  bookings: {},
  bookingParticipants: {},
  slotLocks: {},
}))

import { generateSlots, type SlotWindow, type BookedSlot } from '@/lib/slotUtils'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const FACUU_ID = 'facuu-uuid-0000-0000-000000000001'
const FUTURE = '2099-12-15' // fecha futura fija — nunca es "hoy" en los tests
const FAR_PAST = '2000-01-01' // nowMin = 0 (medianoche) — todos los slots del día pasan

/**
 * Ventana de 3 horas: de 14:00 a 17:00
 * Genera 3 slots: 14:00–14:45, 14:55–15:40, 15:50–16:35
 */
const WINDOW_14_17: SlotWindow = {
  date: FUTURE,
  startTime: '14:00',
  endTime: '17:00',
}

const NO_BOOKED: BookedSlot[] = []
const NO_LOCKED = new Set<string>()

// ─── Generación básica ────────────────────────────────────────────────────────

describe('generateSlots — generación básica', () => {
  it('genera 3 slots en una ventana de 3h (14:00–17:00)', () => {
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], NO_BOOKED, NO_LOCKED, FAR_PAST, 0)
    expect(slots).toHaveLength(3)
  })

  it('los slots tienen el memberId del coordinador', () => {
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], NO_BOOKED, NO_LOCKED, FAR_PAST, 0)
    expect(slots.every((s) => s.memberId === FACUU_ID)).toBe(true)
  })

  it('el primer slot empieza al inicio de la ventana', () => {
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], NO_BOOKED, NO_LOCKED, FAR_PAST, 0)
    expect(slots[0].startTime).toBe('14:00')
    expect(slots[0].endTime).toBe('14:45')
  })

  it('el segundo slot respeta el gap de 10 minutos', () => {
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], NO_BOOKED, NO_LOCKED, FAR_PAST, 0)
    // 14:45 fin + 10 min gap = 14:55 inicio
    expect(slots[1].startTime).toBe('14:55')
    expect(slots[1].endTime).toBe('15:40')
  })

  it('el tercer slot es correcto', () => {
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], NO_BOOKED, NO_LOCKED, FAR_PAST, 0)
    expect(slots[2].startTime).toBe('15:50')
    expect(slots[2].endTime).toBe('16:35')
  })

  it('retorna vacío si no hay ventanas', () => {
    const slots = generateSlots(FACUU_ID, [], NO_BOOKED, NO_LOCKED, FAR_PAST, 0)
    expect(slots).toHaveLength(0)
  })

  it('retorna vacío si la ventana es más corta que un slot (44 min)', () => {
    const window: SlotWindow = { date: FUTURE, startTime: '10:00', endTime: '10:44' }
    const slots = generateSlots(FACUU_ID, [window], NO_BOOKED, NO_LOCKED, FAR_PAST, 0)
    expect(slots).toHaveLength(0)
  })

  it('genera exactamente 1 slot en una ventana de 45 minutos exactos', () => {
    const window: SlotWindow = { date: FUTURE, startTime: '10:00', endTime: '10:45' }
    const slots = generateSlots(FACUU_ID, [window], NO_BOOKED, NO_LOCKED, FAR_PAST, 0)
    expect(slots).toHaveLength(1)
  })

  it('combina múltiples ventanas en el mismo día', () => {
    const morning: SlotWindow = { date: FUTURE, startTime: '09:00', endTime: '10:45' } // 2 slots
    const afternoon: SlotWindow = { date: FUTURE, startTime: '15:00', endTime: '16:45' } // 2 slots
    const slots = generateSlots(FACUU_ID, [morning, afternoon], NO_BOOKED, NO_LOCKED, FAR_PAST, 0)
    expect(slots).toHaveLength(4)
  })
})

// ─── Filtrado de slots pasados ────────────────────────────────────────────────

describe('generateSlots — filtrado de slots pasados', () => {
  it('no filtra nada en fechas futuras, independientemente de nowMin', () => {
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], NO_BOOKED, NO_LOCKED, FAR_PAST, 23 * 60)
    // FUTURE !== FAR_PAST → today check no aplica
    expect(slots).toHaveLength(3)
  })

  it('filtra slots pasados en "hoy"', () => {
    // today = FUTURE, nowMin = 15:00 (900) → solo el slot de 15:50 pasa
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], NO_BOOKED, NO_LOCKED, FUTURE, 900)
    // 14:00 < 900 → skip, 14:55 < 900 → skip, 15:50 >= 900 → OK
    expect(slots).toHaveLength(1)
    expect(slots[0].startTime).toBe('15:50')
  })

  it('filtra todos los slots si nowMin es igual al fin de la ventana', () => {
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], NO_BOOKED, NO_LOCKED, FUTURE, 17 * 60)
    expect(slots).toHaveLength(0)
  })
})

// ─── ESCENARIO PRINCIPAL: 2ª reunión AURA bloquea agenda personal de Facuu ───

describe('ESCENARIO: 2ª reunión AURA bloquea agenda personal de Facuu', () => {
  /**
   * Situación: un cliente tuvo su 1ª reunión con AURA, la confirmaron,
   * y eligió a Facuu Juarez para la 2ª reunión a las 14:00.
   *
   * Esperado: ese slot (14:00) NO aparece en /facuu para sus clientes personales.
   */
  it('bloquea en /facuu el slot de una 2ª reunión AURA confirmada con Facuu', () => {
    const auraBooking: BookedSlot = {
      date: FUTURE,
      startTime: '14:00',
      endTime: '14:45',
    }

    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], [auraBooking], NO_LOCKED, FAR_PAST, 0)

    expect(slots).toHaveLength(2)
    expect(slots.find((s) => s.startTime === '14:00')).toBeUndefined()
    expect(slots[0].startTime).toBe('14:55')
    expect(slots[1].startTime).toBe('15:50')
  })

  it('bloquea en /facuu el slot de una 2ª reunión AURA pendiente con Facuu', () => {
    // Status 'pending' también debe bloquear (llega a generateSlots igual que 'confirmed')
    const pendingBooking: BookedSlot = {
      date: FUTURE,
      startTime: '14:55',
      endTime: '15:40',
    }

    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], [pendingBooking], NO_LOCKED, FAR_PAST, 0)

    expect(slots.find((s) => s.startTime === '14:55')).toBeUndefined()
    expect(slots).toHaveLength(2)
    expect(slots.map((s) => s.startTime)).toEqual(['14:00', '15:50'])
  })

  it('bloquea múltiples slots si Facuu tiene varias 2ª reuniones AURA ese día', () => {
    const booking1: BookedSlot = { date: FUTURE, startTime: '14:00', endTime: '14:45' }
    const booking2: BookedSlot = { date: FUTURE, startTime: '15:50', endTime: '16:35' }

    const slots = generateSlots(
      FACUU_ID,
      [WINDOW_14_17],
      [booking1, booking2],
      NO_LOCKED,
      FAR_PAST,
      0
    )

    expect(slots).toHaveLength(1)
    expect(slots[0].startTime).toBe('14:55')
  })

  it('bloquea todos los slots si Facuu está ocupado toda la ventana', () => {
    const allDay: BookedSlot = { date: FUTURE, startTime: '14:00', endTime: '17:00' }

    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], [allDay], NO_LOCKED, FAR_PAST, 0)

    expect(slots).toHaveLength(0)
  })
})

// ─── ESCENARIO RECÍPROCO: reserva personal de Facuu bloquea agenda AURA ──────

describe('ESCENARIO recíproco: reserva personal de Facuu bloquea agenda AURA', () => {
  /**
   * Situación: un cliente de /facuu reservó a Facuu a las 14:00.
   * Ese slot debe quedar bloqueado también para /book (AURA).
   * buildAvailableSlots incluye reservas de TODOS los contextos —
   * generateSlots solo ve la lista de "booked" ya filtrada, sin importar el origen.
   */
  it('el generador trata igual una reserva AURA que una personal — ambas bloquean', () => {
    const personalBooking: BookedSlot = {
      date: FUTURE,
      startTime: '14:00',
      endTime: '14:45',
    }

    // Desde la perspectiva de generateSlots, no hay diferencia entre contextos.
    // buildAvailableSlots ya pasó ambos tipos de reserva juntos en la lista 'booked'.
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], [personalBooking], NO_LOCKED, FAR_PAST, 0)

    expect(slots.find((s) => s.startTime === '14:00')).toBeUndefined()
    expect(slots).toHaveLength(2)
  })
})

// ─── Locks temporales ─────────────────────────────────────────────────────────

describe('generateSlots — locks temporales', () => {
  it('bloquea un slot que tiene lock activo', () => {
    const locked = new Set([`${FUTURE}|14:00`])
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], NO_BOOKED, locked, FAR_PAST, 0)

    expect(slots.find((s) => s.startTime === '14:00')).toBeUndefined()
    expect(slots).toHaveLength(2)
  })

  it('un lock en un slot no afecta a los otros', () => {
    const locked = new Set([`${FUTURE}|14:55`])
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], NO_BOOKED, locked, FAR_PAST, 0)

    expect(slots.map((s) => s.startTime)).toEqual(['14:00', '15:50'])
  })

  it('slot con lock Y reserva sigue bloqueado', () => {
    const booked: BookedSlot[] = [{ date: FUTURE, startTime: '14:00', endTime: '14:45' }]
    const locked = new Set([`${FUTURE}|14:00`])
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], booked, locked, FAR_PAST, 0)

    expect(slots.find((s) => s.startTime === '14:00')).toBeUndefined()
    expect(slots).toHaveLength(2)
  })
})

// ─── Overlap parcial ──────────────────────────────────────────────────────────

describe('generateSlots — overlap parcial de reservas', () => {
  it('bloquea un slot si la reserva empieza a mitad del slot', () => {
    // Reserva a las 14:20: overlapa con el slot 14:00–14:45
    const booking: BookedSlot = { date: FUTURE, startTime: '14:20', endTime: '15:05' }
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], [booking], NO_LOCKED, FAR_PAST, 0)

    expect(slots.find((s) => s.startTime === '14:00')).toBeUndefined()
  })

  it('no bloquea un slot adyacente que termina justo cuando empieza otro', () => {
    // Reserva 14:45–15:30: termina justo cuando termina el slot 14:00.
    // El slot 14:00–14:45 no overlapa (14:45 es adyacente, no solapado).
    const booking: BookedSlot = { date: FUTURE, startTime: '14:45', endTime: '15:30' }
    const slots = generateSlots(FACUU_ID, [WINDOW_14_17], [booking], NO_LOCKED, FAR_PAST, 0)

    expect(slots.find((s) => s.startTime === '14:00')).toBeDefined()
  })
})

// ─── Múltiples días ───────────────────────────────────────────────────────────

describe('generateSlots — múltiples días', () => {
  const DAY2 = '2099-12-16'

  it('genera slots en múltiples días independientemente', () => {
    const windows: SlotWindow[] = [
      { date: FUTURE, startTime: '10:00', endTime: '11:45' }, // 2 slots
      { date: DAY2, startTime: '15:00', endTime: '16:45' }, // 2 slots
    ]
    const slots = generateSlots(FACUU_ID, windows, NO_BOOKED, NO_LOCKED, FAR_PAST, 0)
    expect(slots).toHaveLength(4)
    expect(slots.filter((s) => s.date === FUTURE)).toHaveLength(2)
    expect(slots.filter((s) => s.date === DAY2)).toHaveLength(2)
  })

  it('una reserva en el día 1 no afecta al día 2', () => {
    const windows: SlotWindow[] = [
      { date: FUTURE, startTime: '10:00', endTime: '10:45' },
      { date: DAY2, startTime: '10:00', endTime: '10:45' },
    ]
    const booked: BookedSlot[] = [{ date: FUTURE, startTime: '10:00', endTime: '10:45' }]
    const slots = generateSlots(FACUU_ID, windows, booked, NO_LOCKED, FAR_PAST, 0)

    expect(slots.filter((s) => s.date === FUTURE)).toHaveLength(0)
    expect(slots.filter((s) => s.date === DAY2)).toHaveLength(1)
  })
})
