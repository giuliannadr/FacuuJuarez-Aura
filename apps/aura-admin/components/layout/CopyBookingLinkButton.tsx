'use client'

import { useState, useRef, useEffect } from 'react'
import { Copy, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/permissions'

interface Props {
  role: Role
  variant?: 'sidebar' | 'compact'
}

const LINKS = [
  { label: 'AURA', sublabel: '/book', path: '/book' },
  { label: 'Personal', sublabel: '/facuu', path: '/facuu' },
]

// ─── Inner (hooks siempre, el gate está en el wrapper) ───────────────────────

function Inner({ role, variant = 'compact' }: Props) {
  const isFacundo = role === 'facundo'

  const [selectedIdx, setSelectedIdx] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selected = LINKS[selectedIdx]

  // Cierra el dropdown si se hace click afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleCopy() {
    const url = `${window.location.origin}${selected.path}`
    await navigator.clipboard.writeText(url)
    setDropdownOpen(false)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  if (variant === 'sidebar') {
    return (
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Link de reserva
        </p>

        <div className="flex items-center gap-1.5">
          {/* Selector (solo Facuu) o label fijo */}
          {isFacundo ? (
            <div ref={dropdownRef} className="relative flex-1 min-w-0">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className={cn(
                  'flex w-full items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
                  dropdownOpen
                    ? 'border-violet-500 bg-violet-500/5 text-violet-700 dark:text-violet-300'
                    : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20'
                )}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="font-medium">{selected.label}</span>
                  <span className="text-zinc-400 dark:text-zinc-500 truncate">
                    {selected.sublabel}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    'h-3 w-3 shrink-0 text-zinc-400 transition-transform duration-150',
                    dropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1.5 z-50 overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
                  {LINKS.map((link, i) => (
                    <button
                      key={link.path}
                      onClick={() => {
                        setSelectedIdx(i)
                        setDropdownOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors',
                        i === selectedIdx
                          ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5'
                      )}
                    >
                      <span className="font-medium">{link.label}</span>
                      <span className="text-zinc-400 dark:text-zinc-500">{link.sublabel}</span>
                      {i === selectedIdx && <Check className="ml-auto h-3 w-3 text-violet-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="flex-1 truncate rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 px-2.5 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 select-none">
              /book
            </span>
          )}

          {/* Botón copiar */}
          <button
            onClick={handleCopy}
            title={copied ? '¡Copiado!' : 'Copiar link'}
            className={cn(
              'flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border transition-colors',
              copied
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                : 'border-zinc-200 dark:border-white/10 text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    )
  }

  // ── Compact (header de página) ────────────────────────────────────────────────
  return (
    <div className="flex items-center gap-1.5">
      {isFacundo && (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors',
              dropdownOpen
                ? 'border-violet-500 bg-violet-500/5 text-violet-700 dark:text-violet-300'
                : 'border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20'
            )}
          >
            <span>{selected.label}</span>
            <ChevronDown
              className={cn(
                'h-3 w-3 text-zinc-400 transition-transform duration-150',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[130px] overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
              {LINKS.map((link, i) => (
                <button
                  key={link.path}
                  onClick={() => {
                    setSelectedIdx(i)
                    setDropdownOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors',
                    i === selectedIdx
                      ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5'
                  )}
                >
                  <span className="font-medium">{link.label}</span>
                  <span className="text-zinc-400 dark:text-zinc-500">{link.sublabel}</span>
                  {i === selectedIdx && <Check className="ml-auto h-3 w-3 text-violet-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleCopy}
        className={cn(
          'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors',
          copied
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white'
        )}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? '¡Copiado!' : 'Link de reserva'}
      </button>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function CopyBookingLinkButton({ role, variant = 'compact' }: Props) {
  if (role !== 'facundo' && role !== 'aura_admin') return null
  return <Inner role={role} variant={variant} />
}
