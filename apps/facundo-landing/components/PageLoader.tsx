'use client'

import { useEffect, useState } from 'react'

const BEBES = "'Bebas Neue', 'Arial Black', sans-serif"

// [heightPx, animDelay, eqAnim, animSpeed]
const BARS: [number, number, string, number][] = [
  [16, 0.2, 'eq2', 1.05],
  [26, 0.08, 'eq1', 0.92],
  [38, 0.35, 'eq3', 0.8],
  [46, 0.15, 'eq2', 1.1],
  [36, 0.28, 'eq1', 0.86],
  [56, 0.05, 'eq3', 1.2],
  [64, 0.22, 'eq1', 0.88],
  [50, 0.12, 'eq2', 0.76],
  [72, 0.38, 'eq3', 1.04],
  [76, 0.0, 'eq1', 0.78],
  [68, 0.18, 'eq2', 0.96],
  [80, 0.1, 'eq3', 0.68],
  [76, 0.25, 'eq1', 0.84],
  [72, 0.08, 'eq2', 0.74],
  [66, 0.32, 'eq3', 0.92],
  [58, 0.15, 'eq1', 0.66],
  [48, 0.4, 'eq2', 1.0],
  [54, 0.05, 'eq3', 0.88],
  [42, 0.22, 'eq1', 0.9],
  [32, 0.35, 'eq2', 1.1],
  [24, 0.12, 'eq3', 1.04],
  [16, 0.28, 'eq1', 0.96],
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
      className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center gap-5"
      style={{ transition: 'opacity 0.55s ease', opacity: exiting ? 0 : 1 }}
    >
      {/* EQ bars */}
      <div
        className="flex items-end gap-[3px]"
        style={{ animation: 'loaderTextIn 0.35s 0.05s ease-out both' }}
      >
        {BARS.map(([h, delay, anim, speed], i) => (
          <div
            key={i}
            className="w-[8px] rounded-t-sm origin-bottom bg-white"
            style={{
              height: h,
              animation: [
                `loaderBarIn 0.38s ${delay}s cubic-bezier(0.16,1,0.3,1) both`,
                `${anim} ${speed}s ${(delay + 0.36).toFixed(2)}s ease-in-out infinite`,
              ].join(', '),
            }}
          />
        ))}
      </div>

      {/* Name */}
      <p
        className="text-white tracking-[0.3em] uppercase"
        style={{
          fontFamily: BEBES,
          fontSize: 13,
          animation: 'loaderTextIn 0.4s 0.45s ease-out both',
        }}
      >
        FACUU JUAREZ
      </p>

      {/* Progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111]">
        <div
          className="h-full bg-red-500 origin-left"
          style={{
            animation: 'loaderProgress 1.9s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
          }}
        />
      </div>
    </div>
  )
}
