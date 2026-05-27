'use client'

import { useState, useTransition } from 'react'
import { Check, Copy, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { saveBookingContactName } from './actions'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingSettingsSectionProps {
  role: 'facundo' | 'aura_admin' | 'aura_member'
  isCoordinator: boolean
  appUrl: string
  currentContactName: string
}

// ─── Small copy button ────────────────────────────────────────────────────────

function CopyLinkRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-500/10">
        <Link2 className="h-3.5 w-3.5 text-violet-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">{label}</p>
        <p className="truncate text-[11px] font-mono text-zinc-400 dark:text-zinc-500">{url}</p>
      </div>
      <button
        onClick={handleCopy}
        className="flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-white/10"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BookingSettingsSection({
  role,
  isCoordinator,
  appUrl,
  currentContactName,
}: BookingSettingsSectionProps) {
  const [contactName, setContactName] = useState(currentContactName)
  const [isPending, startTransition] = useTransition()

  const isAdmin = role === 'facundo' || role === 'aura_admin' || isCoordinator
  const auraUrl = `${appUrl}/book`
  const facuUrl = `${appUrl}/facuu`

  function handleSave() {
    startTransition(async () => {
      const result = await saveBookingContactName(contactName)
      if (result.success) {
        toast.success('Nombre guardado')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* ── Links de reserva ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.02] overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Links de reserva
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Compartí estos links con clientes para que agenden reuniones.
          </p>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-white/5 px-5">
          <CopyLinkRow label="Reservas AURA" url={auraUrl} />
          {role === 'facundo' && <CopyLinkRow label="Reservas personales (Facuu)" url={facuUrl} />}
        </div>

        <div className="px-5 pb-5" />
      </div>

      {/* ── Nombre en formulario (solo admins) ───────────────────────────── */}
      {isAdmin && (
        <div className="rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-white/[0.02]">
          <div className="px-5 pt-5 pb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Nombre del encargado de reuniones
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Aparece en el formulario público de AURA como "Con ____". Dejalo vacío para no mostrar
              ningún nombre.
            </p>
          </div>

          <div className="px-5 pb-5 space-y-3">
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ej: Giuliana — AURA Agency"
              className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            >
              {isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
