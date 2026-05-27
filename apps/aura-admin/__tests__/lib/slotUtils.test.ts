import { describe, it, expect, vi } from 'vitest'

// Mockeamos @aura/db para que el cliente de Supabase no se inicialice en tests
vi.mock('@aura/db', () => ({
  db: {},
  availabilitySlots: {},
  bookings: {},
  bookingParticipants: {},
  slotLocks: {},
}))

import { toMin, fromMin, overlaps, SLOT_DURATION, SLOT_GAP } from '@/lib/slotUtils'

// ─── toMin ────────────────────────────────────────────────────────────────────

describe('toMin', () => {
  it('convierte "00:00" a 0', () => {
    expect(toMin('00:00')).toBe(0)
  })

  it('convierte "01:00" a 60', () => {
    expect(toMin('01:00')).toBe(60)
  })

  it('convierte "09:30" a 570', () => {
    expect(toMin('09:30')).toBe(570)
  })

  it('convierte "23:59" a 1439', () => {
    expect(toMin('23:59')).toBe(1439)
  })

  it('convierte "14:45" a 885', () => {
    expect(toMin('14:45')).toBe(885)
  })
})

// ─── fromMin ──────────────────────────────────────────────────────────────────

describe('fromMin', () => {
  it('convierte 0 a "00:00"', () => {
    expect(fromMin(0)).toBe('00:00')
  })

  it('convierte 60 a "01:00"', () => {
    expect(fromMin(60)).toBe('01:00')
  })

  it('convierte 570 a "09:30"', () => {
    expect(fromMin(570)).toBe('09:30')
  })

  it('convierte 1439 a "23:59"', () => {
    expect(fromMin(1439)).toBe('23:59')
  })

  it('es inversa de toMin', () => {
    const cases = ['00:00', '09:00', '14:30', '22:15', '23:59']
    for (const t of cases) {
      expect(fromMin(toMin(t))).toBe(t)
    }
  })
})

// ─── overlaps ─────────────────────────────────────────────────────────────────

describe('overlaps', () => {
  // Caso: s1 termina antes de que s2 empiece — no overlap
  it('retorna false cuando s1 termina antes de s2', () => {
    expect(overlaps('09:00', '09:45', '10:00', '10:45')).toBe(false)
  })

  // Caso: s1 empieza después de que s2 termina — no overlap
  it('retorna false cuando s1 empieza después de s2', () => {
    expect(overlaps('11:00', '11:45', '09:00', '09:45')).toBe(false)
  })

  // Caso: exactamente adyacentes (s1 termina cuando s2 empieza) — no overlap
  it('retorna false para slots adyacentes exactos', () => {
    expect(overlaps('09:00', '09:45', '09:45', '10:30')).toBe(false)
  })

  // Caso: solapamiento parcial — s1 comienza durante s2
  it('retorna true cuando s1 empieza durante s2', () => {
    expect(overlaps('09:30', '10:15', '09:00', '09:45')).toBe(true)
  })

  // Caso: solapamiento parcial — s1 termina durante s2
  it('retorna true cuando s1 termina durante s2', () => {
    expect(overlaps('09:00', '09:45', '09:30', '10:15')).toBe(true)
  })

  // Caso: s1 contiene completamente a s2
  it('retorna true cuando s1 contiene a s2', () => {
    expect(overlaps('09:00', '11:00', '09:30', '10:30')).toBe(true)
  })

  // Caso: s2 contiene completamente a s1
  it('retorna true cuando s2 contiene a s1', () => {
    expect(overlaps('09:30', '10:00', '09:00', '11:00')).toBe(true)
  })

  // Caso: slots idénticos — overlap total
  it('retorna true para slots idénticos', () => {
    expect(overlaps('14:00', '14:45', '14:00', '14:45')).toBe(true)
  })
})

// ─── Constantes ───────────────────────────────────────────────────────────────

describe('constantes de slot', () => {
  it('SLOT_DURATION es 45 minutos', () => {
    expect(SLOT_DURATION).toBe(45)
  })

  it('SLOT_GAP es 10 minutos', () => {
    expect(SLOT_GAP).toBe(10)
  })

  it('un slot completo con gap es 55 minutos', () => {
    expect(SLOT_DURATION + SLOT_GAP).toBe(55)
  })

  it('en una ventana de 3h caben exactamente 3 slots (con gap)', () => {
    // 3h = 180 min / 55 min por slot = 3.27 → floor = 3
    const windowMin = toMin('11:00') - toMin('08:00') // 180 min
    const slotsCount = Math.floor(windowMin / (SLOT_DURATION + SLOT_GAP))
    expect(slotsCount).toBe(3)
  })
})
