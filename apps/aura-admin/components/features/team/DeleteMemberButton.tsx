'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { deleteMember } from '@/app/(dashboard)/team/actions'

interface DeleteMemberButtonProps {
  memberId: string
  memberName: string
}

export function DeleteMemberButton({ memberId, memberName }: DeleteMemberButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteMember(memberId)
      if (result.success) {
        toast.success(`${memberName} fue eliminado del equipo`)
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={isPending}
        title={`Eliminar a ${memberName}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 dark:text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar miembro</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <TriangleAlert className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              ¿Eliminás a{' '}
              <span className="font-semibold text-zinc-900 dark:text-white">{memberName}</span> del
              equipo? Se borrará su cuenta y todos sus datos.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-md px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Sí, eliminar'
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
