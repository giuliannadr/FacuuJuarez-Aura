import { desc, eq, inArray } from 'drizzle-orm'
import { db, contacts, contactEvents } from '@aura/db'
import { getSession } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { can } from '@/lib/permissions'
import { ContactCard } from '@/components/features/clients/ContactCard'
import { NewContactDialog } from '@/components/features/clients/NewContactDialog'
import type { ContactDetailData } from '@/components/features/clients/ContactDetailModal'
import type { ContactStatus } from '@aura/db'

function buildKanbanGroups(data: ContactDetailData[]) {
  return [
    {
      key: 'sin_contacto' as ContactStatus,
      label: 'Sin contacto',
      contacts: data.filter((c) => (c.events[0]?.status ?? 'sin_contacto') === 'sin_contacto'),
    },
    {
      key: 'reunion_1_reservada' as ContactStatus,
      label: 'Reunión 1 reservada',
      contacts: data.filter((c) => c.events[0]?.status === 'reunion_1_reservada'),
    },
    {
      key: 'reunion_1_hecha' as ContactStatus,
      label: 'Reunión 1 hecha',
      contacts: data.filter((c) => c.events[0]?.status === 'reunion_1_hecha'),
    },
    {
      key: 'reunion_2_reservada' as ContactStatus,
      label: 'Reunión 2 reservada',
      contacts: data.filter((c) => c.events[0]?.status === 'reunion_2_reservada'),
    },
    {
      key: 'reunion_2_hecha' as ContactStatus,
      label: 'Reunión 2 hecha',
      contacts: data.filter((c) => c.events[0]?.status === 'reunion_2_hecha'),
    },
    {
      key: 'contratado' as ContactStatus,
      label: 'Contratados',
      contacts: data.filter((c) => c.events[0]?.status === 'contratado'),
    },
    {
      key: 'en_proceso' as ContactStatus,
      label: 'En proceso',
      contacts: data.filter((c) => c.events[0]?.status === 'en_proceso'),
    },
    {
      key: 'completado' as ContactStatus,
      label: 'Completados',
      contacts: data.filter((c) => c.events[0]?.status === 'completado'),
    },
  ].filter((g) => g.contacts.length > 0)
}

function KanbanBoard({ groups }: { groups: ReturnType<typeof buildKanbanGroups> }) {
  if (groups.length === 0) return null
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4" style={{ minWidth: `${groups.length * 260}px` }}>
        {groups.map((group) => (
          <div key={group.key} className="flex-shrink-0 w-64">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {group.label}
              </h3>
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-white/5 rounded-full px-2 py-0.5">
                {group.contacts.length}
              </span>
            </div>
            <div className="space-y-2">
              {group.contacts.map((c) => (
                <ContactCard key={c.id} contact={c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ClientsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (!can(session.profile.role, 'canManageClients')) redirect('/dashboard')

  const context = session.profile.role === 'facundo' ? 'facundo_solo' : 'aura'

  const rawContacts = await db
    .select()
    .from(contacts)
    .where(eq(contacts.context, context))
    .orderBy(desc(contacts.createdAt))

  const contactIds = rawContacts.map((c) => c.id)

  let allEvents: (typeof contactEvents.$inferSelect)[] = []
  if (contactIds.length > 0) {
    allEvents = await db
      .select()
      .from(contactEvents)
      .where(inArray(contactEvents.contactId, contactIds))
      .orderBy(desc(contactEvents.createdAt))
  }

  const eventsByContact = new Map<string, (typeof contactEvents.$inferSelect)[]>()
  for (const ev of allEvents) {
    const existing = eventsByContact.get(ev.contactId) ?? []
    existing.push(ev)
    eventsByContact.set(ev.contactId, existing)
  }

  const contactData: ContactDetailData[] = rawContacts.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    isPotentialClient: c.isPotentialClient,
    parent1Name: c.parent1Name,
    parent1Phone: c.parent1Phone,
    parent1Email: c.parent1Email,
    parent2Name: c.parent2Name,
    parent2Phone: c.parent2Phone,
    parent2Email: c.parent2Email,
    birthdayPersonName: c.birthdayPersonName,
    birthdayPersonPhone: c.birthdayPersonPhone,
    birthdayPersonBirthDate: c.birthdayPersonBirthDate,
    notes: c.notes,
    source: c.source,
    createdAt: c.createdAt,
    events: (eventsByContact.get(c.id) ?? []).map((ev) => ({
      id: ev.id,
      status: ev.status as ContactStatus,
      eventType: ev.eventType,
      eventTypeOther: ev.eventTypeOther,
      eventDate: ev.eventDate,
      eventTime: ev.eventTime,
      guestCount: ev.guestCount,
      eventLocation: ev.eventLocation,
      djPreference: ev.djPreference,
      organizerName: ev.organizerName,
      organizerPhone: ev.organizerPhone,
      organizerEmail: ev.organizerEmail,
      notes: ev.notes,
      createdAt: ev.createdAt,
    })),
  }))

  const groups = buildKanbanGroups(contactData)
  const totalCount = contactData.length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Clientes</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {totalCount === 0
              ? 'Sin contactos todavía'
              : `${totalCount} contacto${totalCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <NewContactDialog />
      </div>

      {totalCount === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] px-6 py-12 text-center">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No hay contactos aún
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
            Los clientes que confirmen una primera reunión aparecen automáticamente, o podés
            cargarlos manualmente.
          </p>
        </div>
      ) : (
        <KanbanBoard groups={groups} />
      )}
    </div>
  )
}
