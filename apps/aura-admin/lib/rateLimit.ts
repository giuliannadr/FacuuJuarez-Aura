/**
 * Rate limiter en memoria — sliding window counter por clave (IP + acción).
 *
 * ⚠️  No persiste entre reinicios del proceso. Para multi-instancia en producción
 *     reemplazar por Upstash Redis o similar. Para esta app de escala pequeña
 *     es suficiente como primera línea de defensa.
 */

interface Bucket {
  count: number
  resetAt: number
}

// Map global que vive mientras el proceso corre
const buckets = new Map<string, Bucket>()

/**
 * Verifica y registra un intento.
 *
 * @param key      Identificador único (p.ej. "lock:1.2.3.4")
 * @param max      Máximo de intentos permitidos en la ventana
 * @param windowMs Duración de la ventana en milisegundos
 * @returns true si está dentro del límite, false si fue bloqueado
 */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= max) return false

  bucket.count++
  return true
}

/**
 * Extrae la IP real del cliente desde los headers de la request.
 * Funciona en Vercel (x-forwarded-for) y tras nginx/proxy (x-real-ip).
 */
export function getClientIp(headersList: Headers): string {
  const forwarded = headersList.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()

  const realIp = headersList.get('x-real-ip')
  if (realIp) return realIp.trim()

  return 'unknown'
}

// Limpieza periódica para evitar memory leaks en procesos long-running (Docker)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (now >= bucket.resetAt) buckets.delete(key)
    }
  }, 5 * 60_000) // cada 5 minutos
}
