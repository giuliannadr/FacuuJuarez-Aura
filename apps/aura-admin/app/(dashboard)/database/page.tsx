import { desc, eq } from 'drizzle-orm'
import { db, eventDatabases, eventDatabaseEntries } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { can } from '@/lib/permissions'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CreateDatabaseButton } from '@/components/features/database/CreateDatabaseButton'
import { DatabaseCardMenu } from '@/components/features/database/DatabaseCardMenu'
import { CalendarDays, Users } from 'lucide-react'
import Link from 'next/link'

export default async function DatabasePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!can(session.profile.role, 'canManageDatabase')) redirect('/dashboard')

  const context = session.profile.role === 'facundo' ? 'facundo_solo' : 'aura'

  const dbs = await db
    .select()
    .from(eventDatabases)
    .where(eq(eventDatabases.context, context))
    .orderBy(desc(eventDatabases.createdAt))

  // Entry counts
  const counts = await Promise.all(
    dbs.map(async (d) => {
      const rows = await db
        .select({ id: eventDatabaseEntries.id })
        .from(eventDatabaseEntries)
        .where(eq(eventDatabaseEntries.databaseId, d.id))
      return { id: d.id, count: rows.length }
    })
  )
  const countMap = Object.fromEntries(counts.map((c) => [c.id, c.count]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Base de datos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {dbs.length === 0
              ? 'Sin bases de datos todavía'
              : `${dbs.length} base${dbs.length !== 1 ? 's' : ''} de datos`}
          </p>
        </div>
        <CreateDatabaseButton />
      </div>

      {dbs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] px-6 py-14 text-center">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No hay bases de datos aún
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
            Creá una por evento para registrar los datos de tus clientes.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dbs.map((d) => (
            <div
              key={d.id}
              className="relative group rounded-xl border border-zinc-200 dark:border-white/8 bg-white dark:bg-zinc-900 p-5 transition-shadow hover:shadow-sm"
            >
              <Link href={`/database/${d.id}`} className="absolute inset-0 rounded-xl" />

              <div className="flex items-start justify-between gap-2 mb-3">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white leading-snug pr-6">
                  {d.name}
                </h2>
                <div className="relative z-10 shrink-0">
                  <DatabaseCardMenu dbId={d.id} dbName={d.name} dbDate={d.eventDate} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
                {d.eventDate && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" />
                    {format(parseISO(d.eventDate), "d 'de' MMMM yyyy", { locale: es })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="h-3 w-3" />
                  {countMap[d.id] ?? 0} {(countMap[d.id] ?? 0) === 1 ? 'registro' : 'registros'}
                </span>
              </div>

              {(d.schema as unknown[]).length === 0 && (
                <p className="mt-2 text-[11px] text-amber-500 dark:text-amber-400 font-medium">
                  ⚠ Sin formulario configurado
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
