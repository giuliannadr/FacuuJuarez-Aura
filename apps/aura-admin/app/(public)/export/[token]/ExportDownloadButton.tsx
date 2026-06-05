'use client'

import { Download } from 'lucide-react'
import type { TemplateGroup } from '@/lib/database-schema'

interface Props {
  database: { name: string }
  entries: { templateId: string | null; data: unknown; createdAt: Date }[]
  schema: TemplateGroup[]
}

export function ExportDownloadButton({ database, entries, schema }: Props) {
  function handleDownload() {
    // Build all unique data field labels across templates
    const allFields: { id: string; label: string; templateName: string }[] = []
    for (const template of schema) {
      for (const f of template.fields) {
        if (f.type !== 'section_header') {
          allFields.push({ id: f.id, label: f.label, templateName: template.name })
        }
      }
    }

    // Dedupe by id
    const seen = new Set<string>()
    const cols = allFields.filter((f) => {
      if (seen.has(f.id)) return false
      seen.add(f.id)
      return true
    })

    const header = ['Tipo', 'Fecha', ...cols.map((c) => c.label)].join(',')
    const rows = entries.map((entry) => {
      const data = entry.data as Record<string, string>
      const templateName = schema.find((g) => g.id === entry.templateId)?.name ?? ''
      const date = new Date(entry.createdAt).toLocaleDateString('es-AR')
      const values = cols.map((c) => `"${(data[c.id] ?? '').replace(/"/g, '""')}"`)
      return [`"${templateName}"`, `"${date}"`, ...values].join(',')
    })

    const csv = [header, ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `${database.name.replace(/\s/g, '_')}.csv`,
    })
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10 transition-colors shrink-0"
    >
      <Download className="h-4 w-4" />
      Descargar CSV
    </button>
  )
}
