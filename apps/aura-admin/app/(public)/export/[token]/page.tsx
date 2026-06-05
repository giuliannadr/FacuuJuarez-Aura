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

  const isExpired = tokenRow && new Date() > tokenRow.expiresAt

  if (!tokenRow || isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-white/[0.02] px-8 py-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-amber-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-white">
            {isExpired ? 'Link caducado' : 'Link inválido'}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {isExpired
              ? 'Este link de exportación venció (validez de 48 horas). Pedí uno nuevo desde el panel de AURA.'
              : 'Este link no existe o ya no está disponible. Verificá que esté completo o pedí uno nuevo.'}
          </p>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[3px] text-zinc-600">
            AURA
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
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                    {dataFields.map((f) => {
                      const val = (entry.data as Record<string, string>)[f.id]
                      if (!val) return null

                      // Teléfono → botón de WhatsApp
                      if (f.type === 'phone') {
                        const digits = val.replace(/\D/g, '')
                        return (
                          <div key={f.id} className="flex flex-col gap-1">
                            <dt className="text-[11px] font-medium text-zinc-500">{f.label}</dt>
                            <dd>
                              {digits ? (
                                <a
                                  href={`https://wa.me/${digits}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-3.5 w-3.5 fill-current shrink-0"
                                  >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.287 7.042L.788 23.478a.5.5 0 00.609.637l4.571-1.462A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.378 0-4.586-.734-6.408-1.988l-.328-.217-3.399 1.087 1.108-3.286-.236-.345A9.957 9.957 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                                  </svg>
                                  {val}
                                </a>
                              ) : (
                                <span className="text-sm text-zinc-200">{val}</span>
                              )}
                            </dd>
                          </div>
                        )
                      }

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
