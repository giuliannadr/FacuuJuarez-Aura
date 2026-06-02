'use client'

import { useState } from 'react'
import { Copy, Check, CalendarDays, Send } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PendingSecondToken {
  id: string
  link: string
  clientName: string
  subject: string
  date: string
  startTime: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PendingSecondTokens({ tokens }: { tokens: PendingSecondToken[] }) {
  if (tokens.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Send className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Link enviado — esperando al cliente
        </span>
      </div>
      {tokens.map((t) => (
        <TokenRow key={t.id} token={t} />
      ))}
    </div>
  )
}

function TokenRow({ token }: { token: PendingSecondToken }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(token.link)
    setCopied(true)
    toast.success('Link copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-white">
          Esperando que <span className="text-zinc-700 dark:text-zinc-200">{token.clientName}</span>{' '}
          elija horario
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-400 dark:text-zinc-500">
          <span className="truncate">{token.subject}</span>
          <span className="flex items-center gap-1 shrink-0">
            <CalendarDays className="h-3 w-3" />
            {format(parseISO(token.date), "d 'de' MMM yyyy", { locale: es })}
            {' · '}
            {token.startTime}
          </span>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="flex shrink-0 items-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? 'Copiado' : 'Copiar link'}
      </button>
    </div>
  )
}
