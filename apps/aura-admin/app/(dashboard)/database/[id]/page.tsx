import { eq, desc } from 'drizzle-orm'
import { db, eventDatabases, eventDatabaseEntries } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { redirect, notFound } from 'next/navigation'
import { can } from '@/lib/permissions'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { SchemaBuilder } from '@/components/features/database/SchemaBuilder'
import { EntryList } from '@/components/features/database/EntryList'
import type { TemplateGroup } from '@aura/db'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DatabaseDetailPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect('/login')
  if (!can(session.profile.role, 'canManageDatabase')) redirect('/dashboard')

  const context = session.profile.role === 'facundo' ? 'facundo_solo' : 'aura'

  const [database] = await db
    .select()
    .from(eventDatabases)
    .where(eq(eventDatabases.id, id))
    .limit(1)

  if (!database || database.context !== context) notFound()

  const entries = await db
    .select()
    .from(eventDatabaseEntries)
    .where(eq(eventDatabaseEntries.databaseId, id))
    .orderBy(desc(eventDatabaseEntries.createdAt))

  const schema = (database.schema ?? []) as TemplateGroup[]
  const hasSchema = schema.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/database"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mb-3"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Base de datos
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">{database.name}</h1>
            {database.eventDate && (
              <p className="flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(parseISO(database.eventDate), "d 'de' MMMM yyyy", { locale: es })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Schema builder — always visible, collapsible once configured */}
      <SchemaBuilder databaseId={id} initialSchema={schema} entryCount={entries.length} />

      {/* Entry list — only visible once schema is configured */}
      {hasSchema && (
        <EntryList
          databaseId={id}
          schema={schema}
          entries={entries.map((e) => ({
            id: e.id,
            templateId: e.templateId,
            data: e.data as Record<string, string>,
            createdAt: e.createdAt,
          }))}
        />
      )}
    </div>
  )
}
