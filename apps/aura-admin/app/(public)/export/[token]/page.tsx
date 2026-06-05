import { eq } from 'drizzle-orm'
import { db, exportTokens, eventDatabases, eventDatabaseEntries } from '@aura/db'
import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TemplateGroup, FieldDef } from '@aura/db'
import { ExportDownloadButton } from './ExportDownloadButton'

interface Props {
  params: Promise<{ token: string }>
}

export default async function ExportPage({ params }: Props) {
  const { token } = await params

  const [tokenRow] = await db
    .select()
    .from(exportTokens)
    .where(eq(exportTokens.token, token))
    .limit(1)

  if (!tokenRow) notFound()
  if (new Date() > tokenRow.expiresAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8 text-center">
        <div>
          <p className="text-lg font-semibold text-white">Link expirado</p>
          <p className="mt-2 text-sm text-zinc-400">
            Este link de exportación venció. Generá uno nuevo desde el panel.
          </p>
        </div>
      </div>
    )
  }

  const [database] = await db
    .select()
    .from(eventDatabases)
    .where(eq(eventDatabases.id, tokenRow.databaseId))
    .limit(1)

  if (!database) notFound()

  const entries = await db
    .select()
    .from(eventDatabaseEntries)
    .where(eq(eventDatabaseEntries.databaseId, database.id))

  const schema = (database.schema ?? []) as TemplateGroup[]

  function getLabel(templateId: string | null, fieldId: string): string {
    const t = schema.find((g) => g.id === templateId) ?? schema[0]
    return t?.fields.find((f) => f.id === fieldId)?.label ?? fieldId
  }

  function getAllDataFields(templateId: string | null): FieldDef[] {
    const t = schema.find((g) => g.id === templateId) ?? schema[0]
    return t?.fields.filter((f) => f.type !== 'section_header') ?? []
  }

  const expiresLabel = format(tokenRow.expiresAt, "d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Base de datos
            </p>
            <h1 className="text-2xl font-bold text-white">{database.name}</h1>
            {database.eventDate && (
              <p className="text-sm text-zinc-400 mt-1">
                {format(parseISO(database.eventDate), "d 'de' MMMM yyyy", { locale: es })}
              </p>
            )}
            <p className="text-xs text-zinc-600 mt-2">
              {entries.length} registro{entries.length !== 1 ? 's' : ''} · Link válido hasta{' '}
              {expiresLabel}
            </p>
          </div>
          <ExportDownloadButton database={database} entries={entries} schema={schema} />
        </div>

        {/* Table */}
        {entries.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-10 text-center">
            <p className="text-zinc-500">No hay registros en esta base de datos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const dataFields = getAllDataFields(entry.templateId)
              const templateName = schema.find((g) => g.id === entry.templateId)?.name
              return (
                <div
                  key={entry.id}
                  className="rounded-xl border border-white/8 bg-white/[0.03] px-5 py-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    {templateName && (
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-400">
                        {templateName}
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-600">
                      {format(new Date(entry.createdAt), 'd MMM yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                    {dataFields.map((f) => {
                      const val = (entry.data as Record<string, string>)[f.id]
                      if (!val) return null
                      return (
                        <div key={f.id} className="flex flex-col gap-0.5">
                          <dt className="text-[11px] font-medium text-zinc-500">{f.label}</dt>
                          <dd className="text-sm text-zinc-200">{val}</dd>
                        </div>
                      )
                    })}
                  </dl>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
