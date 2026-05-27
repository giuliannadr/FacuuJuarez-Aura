import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit } from '@/lib/rateLimit'

// Reseteamos el módulo antes de cada test para limpiar el Map interno
beforeEach(() => {
  vi.resetModules()
})

describe('checkRateLimit', () => {
  it('permite el primer intento siempre', async () => {
    const { checkRateLimit } = await import('@/lib/rateLimit')
    expect(checkRateLimit('test:unique-key-1', 5, 60_000)).toBe(true)
  })

  it('permite hasta el límite exacto', async () => {
    const { checkRateLimit } = await import('@/lib/rateLimit')
    const key = 'test:exact-limit'
    const max = 3

    expect(checkRateLimit(key, max, 60_000)).toBe(true) // 1
    expect(checkRateLimit(key, max, 60_000)).toBe(true) // 2
    expect(checkRateLimit(key, max, 60_000)).toBe(true) // 3
  })

  it('bloquea cuando se supera el límite', async () => {
    const { checkRateLimit } = await import('@/lib/rateLimit')
    const key = 'test:over-limit'
    const max = 3

    checkRateLimit(key, max, 60_000) // 1
    checkRateLimit(key, max, 60_000) // 2
    checkRateLimit(key, max, 60_000) // 3

    expect(checkRateLimit(key, max, 60_000)).toBe(false) // 4 → bloqueado
    expect(checkRateLimit(key, max, 60_000)).toBe(false) // 5 → bloqueado
  })

  it('claves distintas son independientes', async () => {
    const { checkRateLimit } = await import('@/lib/rateLimit')
    const max = 2

    checkRateLimit('test:ip-a', max, 60_000)
    checkRateLimit('test:ip-a', max, 60_000)

    // ip-a está llena
    expect(checkRateLimit('test:ip-a', max, 60_000)).toBe(false)
    // ip-b no fue tocada → debe pasar
    expect(checkRateLimit('test:ip-b', max, 60_000)).toBe(true)
  })

  it('resetea el contador cuando vence la ventana', async () => {
    vi.useFakeTimers()
    const { checkRateLimit } = await import('@/lib/rateLimit')
    const key = 'test:window-reset'
    const max = 2
    const windowMs = 5_000 // 5 segundos

    checkRateLimit(key, max, windowMs) // 1
    checkRateLimit(key, max, windowMs) // 2
    expect(checkRateLimit(key, max, windowMs)).toBe(false) // bloqueado

    // Avanzamos el tiempo más allá de la ventana
    vi.advanceTimersByTime(windowMs + 1)

    // Después del reset debe permitir de nuevo
    expect(checkRateLimit(key, max, windowMs)).toBe(true)

    vi.useRealTimers()
  })
})
