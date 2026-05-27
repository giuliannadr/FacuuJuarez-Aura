'use client'

import { useEffect, useState } from 'react'

const BEBES = "'Bebas Neue', 'Arial Black', sans-serif"

// [heightVh, animDelay, eqAnim, animSpeedS, isRed]
// Heights follow a multi-peak frequency spectrum — tallest in center
const BARS: readonly [number, number, string, number, boolean][] = [
  [14, 0.22, 'eq2', 1.05, false],
  [20, 0.08, 'eq1', 0.92, false],
  [28, 0.38, 'eq3', 0.8, false],
  [38, 0.15, 'eq2', 1.1, false],
  [48, 0.28, 'eq1', 0.86, false],
  [34, 0.05, 'eq3', 1.2, true], // red
  [56, 0.32, 'eq2', 0.9, false],
  [64, 0.12, 'eq1', 0.76, false],
  [52, 0.25, 'eq3', 1.04, false],
  [70, 0.0, 'eq1', 0.8, false],
  [64, 0.4, 'eq2', 0.96, false],
  [74, 0.18, 'eq3', 0.7, true], // red
  [68, 0.1, 'eq1', 0.84, false],
  [78, 0.33, 'eq2', 0.74, false],
  [74, 0.08, 'eq3', 0.92, false],
  [83, 0.22, 'eq1', 0.66, false],
  [85, 0.02, 'eq2', 0.7, true], // red — center left
  [88, 0.14, 'eq3', 0.6, false], // peak
  [85, 0.29, 'eq1', 0.64, false],
  [81, 0.08, 'eq2', 0.7, true], // red — center right
  [76, 0.38, 'eq3', 0.8, false],
  [70, 0.18, 'eq1', 0.86, false],
  [66, 0.25, 'eq2', 0.92, false],
  [60, 0.05, 'eq3', 0.96, false],
  [56, 0.42, 'eq1', 1.0, true], // red
  [48, 0.12, 'eq2', 1.06, false],
  [40, 0.28, 'eq3', 0.86, false],
  [34, 0.08, 'eq1', 0.92, false],
  [28, 0.22, 'eq2', 1.1, false],
  [22, 0.35, 'eq3', 1.16, false],
  [16, 0.15, 'eq1', 1.04, false],
  [12, 0.3, 'eq2', 0.96, false],
]

export default function PageLoader() {
  const [exiting, setExiting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 1900)
    const t2 = setTimeout(() => setDone(true), 2450)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (done) return null

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col overflow-hidden"
      style={{ transition: 'opacity 0.55s cubic-bezier(0.4,0,1,1)', opacity: exiting ? 0 : 1 }}
    >
      {/* ── EQ bars — full width, bottom-aligned ── */}
      <div className="flex-1 flex items-end gap-[2px] px-[2px] overflow-hidden">
        {BARS.map(([h, delay, anim, speed, red], i) => (
          <div
            key={i}
            className="flex-1 origin-bottom"
            style={{
              height: `${h}vh`,
              backgroundColor: red
                ? '#ef4444'
                : `rgba(255,255,255,${(0.1 + (h / 88) * 0.2).toFixed(2)})`,
              boxShadow: red
                ? '0 0 18px rgba(239,68,68,0.55), 0 0 4px rgba(239,68,68,0.8)'
                : '0 0 6px rgba(255,255,255,0.06)',
              animation: [
                `loaderBarIn 0.40s ${delay}s cubic-bezier(0.16,1,0.3,1) both`,
                `${anim} ${speed}s ${(delay + 0.38).toFixed(2)}s ease-in-out infinite`,
              ].join(', '),
            }}
          />
        ))}
      </div>

      {/* ── Nombre DJ — flota sobre las barras ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none select-none">
        {/* FACUU JUAREZ */}
        <p
          className="text-transparent leading-none tracking-[0.04em]"
          style={{
            fontFamily: BEBES,
            fontSize: 'clamp(40px, 8.5vw, 122px)',
            WebkitTextStroke: '1.5px rgba(255,255,255,0.88)',
            textShadow: '0 0 80px rgba(0,0,0,0.98), 0 0 160px rgba(0,0,0,0.85)',
            animation: 'loaderTextIn 0.55s 0.30s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          FACUU JUAREZ
        </p>

        {/* Subtítulo con separadores rojos */}
        <div
          className="flex items-center gap-3 mt-3.5"
          style={{ animation: 'loaderTextIn 0.45s 0.55s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <div className="w-5 h-[1.5px] bg-red-500" />
          <p
            className="text-red-500 tracking-[0.42em] uppercase"
            style={{
              fontFamily: BEBES,
              fontSize: 11,
              textShadow: '0 0 24px rgba(239,68,68,0.6)',
            }}
          >
            DJ · TUCUMÁN · ARGENTINA
          </p>
          <div className="w-5 h-[1.5px] bg-red-500" />
        </div>
      </div>

      {/* ── Barra de progreso roja ── */}
      <div className="h-[3px] bg-[#0d0d0d] flex-shrink-0 relative">
        <div
          className="absolute inset-0 origin-left bg-red-500"
          style={{
            animation: 'loaderProgress 1.9s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
            boxShadow: '0 0 12px rgba(239,68,68,0.7)',
          }}
        />
      </div>
    </div>
  )
}
