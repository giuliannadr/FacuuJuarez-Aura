'use client'

import { useState, useTransition } from 'react'
import { Check, Copy, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createSecondBookingToken } from '@/app/(dashboard)/bookings/actions'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Booking {
  id: string
  clientId: string
  clientName: string
  subject: string
}

interface Member {
  id: string
  name: string
}

interface EnableSecondBookingDialogProps {
  booking: Booking
  allMembers: Member[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EnableSecondBookingDialog({ booking, allMembers }: EnableSecondBookingDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function toggleMember(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleOpen() {
    setOpen(true)
    setSelectedIds([])
    setGeneratedLink(null)
    setCopied(false)
  }

  function handleClose() {
    setOpen(false)
  }

  async function handleGenerate() {
    if (selectedIds.length === 0) return

    startTransition(async () => {
      const result = await createSecondBookingToken({
        firstBookingId: booking.id,
        clientId: booking.clientId,
        selectedDjIds: selectedIds,
      })

      if (result.success) {
        setGeneratedLink(result.link)
        toast.success('Link generado y email enviado al cliente')
      } else {
        toast.error(result.error)
      }
    })
  }

  async function handleCopy() {
    if (!generatedLink) return
    await navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    toast.success('Link copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={handleOpen}
        className="rounded-md border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 transition-colors hover:bg-violet-500/20"
      >
        Habilitar segunda reserva
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 p-5 pb-8 sm:p-6 sm:pb-6 shadow-2xl">
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  Segunda reunión con {booking.clientName}
                </h3>
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                  {booking.subject} · Elegí los DJs que participarán
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!generatedLink ? (
              <>
                {/* DJ selection */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Seleccioná los DJs
                  </p>
                  {allMembers.length === 0 ? (
                    <p className="text-sm text-zinc-400 dark:text-zinc-600">
                      No hay DJs disponibles en el equipo.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {allMembers.map((member) => {
                        const selected = selectedIds.includes(member.id)
                        return (
                          <button
                            key={member.id}
                            onClick={() => toggleMember(member.id)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                              selected
                                ? 'border-violet-500 bg-violet-500/10'
                                : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.04]'
                            )}
                          >
                            <div
                              className={cn(
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                                selected
                                  ? 'border-violet-500 bg-violet-500'
                                  : 'border-zinc-300 dark:border-white/20'
                              )}
                            >
                              {selected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span
                              className={cn(
                                'text-sm font-medium',
                                selected
                                  ? 'text-violet-700 dark:text-violet-300'
                                  : 'text-zinc-700 dark:text-zinc-200'
                              )}
                            >
                              {member.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                  Al generar el link, le enviaremos un email a {booking.clientName} con el acceso
                  para agendar la segunda reunión.
                </p>

                {/* Actions */}
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 rounded-lg border border-zinc-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={selectedIds.length === 0 || isPending}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Enviar link por email'
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Link generado */
              <>
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 mb-5">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Email enviado a {booking.clientName}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    También podés copiar el link y enviárselo por WhatsApp
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-3 py-2">
                    <span className="flex-1 truncate text-xs font-mono text-zinc-600 dark:text-zinc-300">
                      {generatedLink}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="mt-5 w-full rounded-lg border border-zinc-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
