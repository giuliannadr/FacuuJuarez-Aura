'use server'

import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase'

export type CommentResult = { success: true } | { success: false; error: string }

const addCommentSchema = z.object({
  eventId: z.string().uuid(),
  body: z.string().min(1, 'El mensaje no puede estar vacío').max(2000),
})

export async function addComment(raw: unknown): Promise<CommentResult> {
  const parsed = addCommentSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createSupabaseServerClient()

  // Verificar que hay un usuario autenticado (puede ser cliente o team member)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Debés iniciar sesión para comentar' }

  // Determinar si es del equipo (tiene perfil en la tabla profiles)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('id', user.id)
    .single()

  const isFromTeam = !!profile
  const authorName = profile?.name ?? user.email ?? 'Cliente'

  // TODO: reemplazar con Drizzle cuando esté la DB:
  //
  // import { db } from '@/../../packages/db/client'
  // import { events, eventComments } from '@/../../packages/db/schema'
  // import { eq } from 'drizzle-orm'
  //
  // 1. Verificar que el evento existe y que el usuario tiene acceso
  //    (o es del equipo, o su email coincide con el clientEmail del evento)
  // const event = await db.query.events.findFirst({
  //   where: eq(events.id, parsed.data.eventId),
  // })
  // if (!event) return { success: false, error: 'Evento no encontrado' }
  //
  // const hasAccess = isFromTeam || event.clientEmail === user.email
  // if (!hasAccess) {
  //   return { success: false, error: 'Tu cuenta no tiene acceso a este evento' }
  // }
  //
  // 2. Insertar comentario
  // await db.insert(eventComments).values({
  //   eventId: parsed.data.eventId,
  //   authorEmail: user.email!,
  //   authorName,
  //   body: parsed.data.body,
  //   isFromTeam,
  // })

  console.log('[addComment] mock insert:', {
    eventId: parsed.data.eventId,
    authorEmail: user.email,
    authorName,
    body: parsed.data.body,
    isFromTeam,
  })

  return { success: true }
}

export async function signInClient(
  email: string,
  password: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: 'Email o contraseña incorrectos' }
  return { success: true }
}

export async function signUpClient(
  email: string,
  password: string,
  name: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  })
  if (error) return { success: false, error: error.message }
  return { success: true }
}
