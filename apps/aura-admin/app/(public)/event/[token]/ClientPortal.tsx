'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Send, LogOut, Loader2, MessageCircle, ShieldCheck } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { addComment } from './actions'
import { cn } from '@/lib/utils'
import type { Session } from '@supabase/supabase-js'

export interface EventCommentData {
  id: string
  authorName: string
  authorEmail: string
  body: string
  isFromTeam: boolean
  createdAt: string
}

interface ClientPortalProps {
  eventId: string
  clientEmail: string
  initialComments: EventCommentData[]
}

const inputClass =
  'h-10 w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'

// ─── Auth form ────────────────────────────────────────────────────────────────
function AuthForm({ clientEmail }: { clientEmail: string }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState(clientEmail)
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [signedUp, setSignedUp] = useState(false)
  const [isPending, startTransition] = useTransition()
  const supabase = createSupabaseBrowserClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError('Email o contraseña incorrectos')
      } else {
        if (!name.trim()) {
          setError('Ingresá tu nombre')
          return
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        })
        if (error) setError(error.message)
        else setSignedUp(true)
      }
    })
  }

  if (signedUp) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          ¡Cuenta creada!
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Revisá tu email para confirmar la cuenta y luego iniciá sesión.
        </p>
        <button
          onClick={() => {
            setMode('login')
            setSignedUp(false)
          }}
          className="mt-3 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300"
        >
          Ir al login
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['login', 'signup'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m)
              setError(null)
            }}
            className={cn(
              'flex-1 rounded-lg border py-2 text-xs font-medium transition-colors',
              mode === m
                ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                : 'border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className={inputClass}
            required
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className={inputClass}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className={inputClass}
          required
          minLength={6}
        />

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === 'login' ? (
            'Ingresar'
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>

      {mode === 'login' && (
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
          ¿Primera vez?{' '}
          <button
            onClick={() => {
              setMode('signup')
              setError(null)
            }}
            className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300"
          >
            Creá tu cuenta
          </button>
        </p>
      )}
    </div>
  )
}

// ─── Comments section ─────────────────────────────────────────────────────────
function CommentsSection({
  eventId,
  userEmail,
  userName,
  comments,
  onNewComment,
}: {
  eventId: string
  userEmail: string
  userName: string
  comments: EventCommentData[]
  onNewComment: (c: EventCommentData) => void
}) {
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setError(null)

    const optimisticComment: EventCommentData = {
      id: crypto.randomUUID(),
      authorEmail: userEmail,
      authorName: userName,
      body: body.trim(),
      isFromTeam: false,
      createdAt: new Date().toISOString(),
    }

    onNewComment(optimisticComment)
    setBody('')

    startTransition(async () => {
      const result = await addComment({ eventId, body: optimisticComment.body })
      if (!result.success) setError(result.error)
    })
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-600">
          Aún no hay mensajes. ¡Sé el primero en escribir!
        </p>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div
              key={c.id}
              className={cn(
                'rounded-xl border p-4',
                c.isFromTeam
                  ? 'border-violet-500/20 bg-violet-500/5'
                  : 'border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02]'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-900 dark:text-white">
                  {c.authorName}
                </span>
                {c.isFromTeam && (
                  <span className="flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-400">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Equipo
                  </span>
                )}
                <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-600">
                  {format(parseISO(c.createdAt), 'd MMM · HH:mm', { locale: es })}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {c.body}
              </p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribí tu mensaje..."
          className={cn(inputClass, 'flex-1')}
        />
        <button
          type="submit"
          disabled={isPending || !body.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ClientPortal({ eventId, clientEmail, initialComments }: ClientPortalProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [comments, setComments] = useState<EventCommentData[]>(initialComments)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setAuthLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel(`event-comments:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_comments',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const newComment = payload.new as EventCommentData
          setComments((prev) => {
            if (prev.some((c) => c.id === newComment.id)) return prev
            return [...prev, newComment]
          })
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  const userEmail = session?.user.email ?? null
  const userName = session?.user.user_metadata?.full_name ?? userEmail ?? 'Cliente'
  const isAuthorized = userEmail === clientEmail

  return (
    <section className="rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/[0.02] p-6">
      <div className="mb-5 flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-violet-500 dark:text-violet-400" />
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Mensajes del evento</h2>
      </div>

      {authLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-300 dark:text-zinc-600" />
        </div>
      ) : !session ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Iniciá sesión con el email que usaste al agendar para dejar mensajes al equipo.
          </p>
          <AuthForm clientEmail={clientEmail} />
        </div>
      ) : !isAuthorized ? (
        <div className="space-y-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            La cuenta <span className="font-medium">{userEmail}</span> no tiene acceso a este
            evento.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Cerrá sesión e ingresá con el email que usaste al agendar la reunión.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Conectado como <span className="text-zinc-700 dark:text-zinc-300">{userName}</span>
            </p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-400"
            >
              <LogOut className="h-3 w-3" />
              Salir
            </button>
          </div>
          <CommentsSection
            eventId={eventId}
            userEmail={userEmail!}
            userName={userName}
            comments={comments}
            onNewComment={(c) => setComments((prev) => [...prev, c])}
          />
        </div>
      )}
    </section>
  )
}
