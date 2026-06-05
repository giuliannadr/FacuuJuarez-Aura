import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  date,
  time,
  timestamp,
  unique,
  primaryKey,
  numeric,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core'
import type { TemplateGroup } from './database-types'

// ─── Enums ────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['facundo', 'aura_admin', 'aura_member'])
export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
])
export const siteEnum = pgEnum('site', ['facundo', 'aura'])
export const bookingContextEnum = pgEnum('booking_context', ['aura', 'facundo_solo'])
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'rejected',
  'cancelled',
])
export const participantStatusEnum = pgEnum('participant_status', [
  'pending',
  'accepted',
  'rejected',
])
export const meetingTypeEnum = pgEnum('meeting_type', ['meeting', 'quote'])

// ─── Profiles ─────────────────────────────────────────────────────────────────
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // matches auth.users(id)
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('aura_member'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  /** Si true, este miembro maneja la primera reunión (coordinador de AURA) */
  isCoordinator: boolean('is_coordinator').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─── Content blocks (CMS) ─────────────────────────────────────────────────────
export const contentBlocks = pgTable(
  'content_blocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site: siteEnum('site').notNull(),
    section: text('section').notNull(), // 'hero', 'about', 'services'
    key: text('key').notNull(), // 'title', 'description', 'image_url'
    value: text('value').notNull().default(''),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    updatedBy: uuid('updated_by').references(() => profiles.id),
  },
  (t) => [unique().on(t.site, t.section, t.key)]
)

// ─── Media files ──────────────────────────────────────────────────────────────
export const mediaFiles = pgTable('media_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  site: siteEnum('site').notNull(),
  bucketPath: text('bucket_path').notNull(),
  url: text('url').notNull(),
  filename: text('filename').notNull(),
  uploadedBy: uuid('uploaded_by').references(() => profiles.id),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
})

// ─── Availability slots ───────────────────────────────────────────────────────
export const availabilitySlots = pgTable(
  'availability_slots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    context: bookingContextEnum('context').notNull(),
    date: date('date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    isBooked: boolean('is_booked').notNull().default(false),
  },
  (t) => [unique().on(t.memberId, t.context, t.date, t.startTime)]
)

// ─── Clients ──────────────────────────────────────────────────────────────────
/** Registro del cliente que solicita reunión. Se crea al enviar el formulario de /book */
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  /** Tipo de evento: fiesta_15, fiesta_18, cumpleanos, corporativo, casamiento, otro */
  eventType: text('event_type').notNull(),
  /** Descripción libre si eventType = 'otro' */
  eventTypeOther: text('event_type_other'),
  /** Fecha aproximada del evento (YYYY-MM-DD) */
  eventDate: date('event_date'),
  /** Hora aproximada del evento (HH:MM) */
  eventTime: text('event_time'),
  guestCount: integer('guest_count'),
  eventLocation: text('event_location'),
  /** Con qué DJs preferirían trabajar */
  djPreference: text('dj_preference'),
  message: text('message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  context: bookingContextEnum('context').notNull(),
  meetingType: meetingTypeEnum('meeting_type').notNull().default('meeting'),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  subject: text('subject').notNull(),
  message: text('message'),
  date: date('date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  status: bookingStatusEnum('status').notNull().default('pending'),
  /** Referencia al cliente registrado (nullable para compatibilidad con reservas antiguas) */
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  /** 1 = primera reunión (coordinador), 2 = segunda reunión (DJs) */
  meetingRound: integer('meeting_round').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─── Booking participants ─────────────────────────────────────────────────────
export const bookingParticipants = pgTable(
  'booking_participants',
  {
    bookingId: uuid('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    memberId: uuid('member_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    status: participantStatusEnum('status').notNull().default('pending'),
    respondedAt: timestamp('responded_at'),
  },
  (t) => [primaryKey({ columns: [t.bookingId, t.memberId] })]
)

// ─── Second booking tokens ────────────────────────────────────────────────────
/**
 * Token único que el coordinador genera para que el cliente pueda reservar
 * la segunda reunión directamente con los DJs.
 * URL: /book/segunda/[token]
 */
export const secondBookingTokens = pgTable('second_booking_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** UUID que va en la URL del cliente */
  token: text('token').notNull().unique(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'cascade' }),
  firstBookingId: uuid('first_booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  /** IDs de los DJs que participarán en la segunda reunión */
  selectedDjIds: jsonb('selected_dj_ids').notNull().default('[]').$type<string[]>(),
  /** Se llena cuando el cliente usa el link y agenda */
  secondBookingId: uuid('second_booking_id').references(() => bookings.id, {
    onDelete: 'set null',
  }),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─── Contact CRM ─────────────────────────────────────────────────────────────
export const contactStatusEnum = pgEnum('contact_status', [
  'sin_contacto',
  'reunion_1_reservada',
  'reunion_1_hecha',
  'reunion_2_reservada',
  'reunion_2_hecha',
  'contratado',
  'en_proceso',
  'completado',
])

/** Persona (cliente real o posible). Un contacto puede tener múltiples eventos a lo largo del tiempo. */
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  context: bookingContextEnum('context').notNull(),
  // Datos principales del contacto
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  // Quinceañera — padre/tutor 1 (requerido para ese tipo de evento)
  parent1Name: text('parent1_name'),
  parent1Phone: text('parent1_phone'),
  parent1Email: text('parent1_email'),
  // Quinceañera — padre/tutor 2 (opcional)
  parent2Name: text('parent2_name'),
  parent2Phone: text('parent2_phone'),
  parent2Email: text('parent2_email'),
  // Quinceañera — la festejada
  birthdayPersonName: text('birthday_person_name'),
  birthdayPersonPhone: text('birthday_person_phone'),
  birthdayPersonBirthDate: date('birthday_person_birth_date'),
  notes: text('notes'),
  /** true = posible cliente (lead), false = cliente confirmado */
  isPotentialClient: boolean('is_potential_client').notNull().default(false),
  /** 'manual' = cargado a mano por admin | 'booking' = creado automáticamente al confirmar reserva */
  source: text('source').notNull().default('manual'),
  /** Referencia al clients row original si fue creado desde una reserva */
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/** Un evento por contacto. El contacto puede tener historial de múltiples eventos. */
export const contactEvents = pgTable('contact_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  contactId: uuid('contact_id')
    .notNull()
    .references(() => contacts.id, { onDelete: 'cascade' }),
  status: contactStatusEnum('status').notNull().default('sin_contacto'),
  eventType: text('event_type'),
  eventTypeOther: text('event_type_other'),
  eventDate: date('event_date'),
  eventTime: text('event_time'),
  guestCount: integer('guest_count'),
  eventLocation: text('event_location'),
  djPreference: text('dj_preference'),
  /** Organizador/a del evento (si aplica) */
  organizerName: text('organizer_name'),
  organizerPhone: text('organizer_phone'),
  organizerEmail: text('organizer_email'),
  notes: text('notes'),
  /** Reserva vinculada (primera o segunda reunión) */
  linkedBookingId: uuid('linked_booking_id').references(() => bookings.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── Event Databases (CRM de eventos) ────────────────────────────────────────

/** Carpeta/base de datos de un evento. El schema JSONB define los campos del formulario. */
export const eventDatabases = pgTable('event_databases', {
  id: uuid('id').primaryKey().defaultRandom(),
  context: bookingContextEnum('context').notNull(),
  name: text('name').notNull(),
  eventDate: date('event_date'),
  /** Array de TemplateGroup: [{ id, name, fields: [{ id, type, label, required }] }] */
  schema: jsonb('schema').notNull().default('[]').$type<TemplateGroup[]>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
})

export const eventDatabaseEntries = pgTable('event_database_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  databaseId: uuid('database_id')
    .notNull()
    .references(() => eventDatabases.id, { onDelete: 'cascade' }),
  /** ID de la plantilla usada para este registro */
  templateId: text('template_id'),
  /** Datos del registro: { [fieldId]: value } */
  data: jsonb('data').notNull().default('{}').$type<Record<string, string>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const exportTokens = pgTable('export_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  databaseId: uuid('database_id')
    .notNull()
    .references(() => eventDatabases.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─── Events ───────────────────────────────────────────────────────────────────
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  context: bookingContextEnum('context').notNull(),
  title: text('title').notNull(),
  serviceDescription: text('service_description'),
  price: numeric('price', { precision: 10, scale: 2 }),
  currency: text('currency').notNull().default('ARS'),
  showPrice: boolean('show_price').notNull().default(false),
  eventDate: date('event_date'),
  eventTime: time('event_time'),
  venue: text('venue'),
  status: eventStatusEnum('status').notNull().default('draft'),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  shareToken: text('share_token').notNull().unique(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => profiles.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Miembros que trabajan en el evento
export const eventMembers = pgTable(
  'event_members',
  {
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    memberId: uuid('member_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    memberRole: text('member_role'), // rol específico en este evento (ej: "DJ Principal", "Asistente")
  },
  (t) => [primaryKey({ columns: [t.eventId, t.memberId] })]
)

// ─── Event comments (portal de cliente) ──────────────────────────────────────
export const eventComments = pgTable('event_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  authorEmail: text('author_email').notNull(),
  authorName: text('author_name').notNull(),
  body: text('body').notNull(),
  isFromTeam: boolean('is_from_team').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─── Schedule template (horario base recurrente) ─────────────────────────────
/** Una fila por día de la semana por miembro+contexto. timeRanges = [{startTime, endTime}] */
export const scheduleTemplateDays = pgTable(
  'schedule_template_days',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    memberId: uuid('member_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    context: bookingContextEnum('context').notNull().default('aura'),
    /** 0 = Dom, 1 = Lun … 6 = Sáb  (JS getDay() values) */
    dayOfWeek: integer('day_of_week').notNull(),
    timeRanges: jsonb('time_ranges')
      .notNull()
      .default('[]')
      .$type<{ startTime: string; endTime: string }[]>(),
  },
  (t) => [unique().on(t.memberId, t.context, t.dayOfWeek)]
)

// ─── Slot locks (reserva temporal de 60 s durante el proceso de booking) ─────
/**
 * Cuando un cliente selecciona un horario, se inserta aquí un lock de 60 s.
 * Si no completa el formulario en ese tiempo, el lock expira y el turno
 * vuelve a estar disponible para otro cliente.
 * UNIQUE (coordinator_id, context, date, start_time) — solo un lock por slot.
 */
export const slotLocks = pgTable(
  'slot_locks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    coordinatorId: uuid('coordinator_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    context: bookingContextEnum('context').notNull(),
    date: date('date').notNull(),
    startTime: time('start_time').notNull(),
    /** Token único entregado al cliente que adquirió el lock */
    lockToken: text('lock_token').notNull(),
    lockedAt: timestamp('locked_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (t) => [unique().on(t.coordinatorId, t.context, t.date, t.startTime)]
)

// ─── Inferred types ───────────────────────────────────────────────────────────
export type Profile = typeof profiles.$inferSelect
export type ContentBlock = typeof contentBlocks.$inferSelect
export type MediaFile = typeof mediaFiles.$inferSelect
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect
export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert
export type Booking = typeof bookings.$inferSelect
export type BookingParticipant = typeof bookingParticipants.$inferSelect
export type SecondBookingToken = typeof secondBookingTokens.$inferSelect

export type NewBooking = typeof bookings.$inferInsert
export type NewAvailabilitySlot = typeof availabilitySlots.$inferInsert
export type Event = typeof events.$inferSelect
export type EventMember = typeof eventMembers.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type EventComment = typeof eventComments.$inferSelect
export type NewEventComment = typeof eventComments.$inferInsert
export type ScheduleTemplateDay = typeof scheduleTemplateDays.$inferSelect
export type SlotLock = typeof slotLocks.$inferSelect
export type EventDatabase = typeof eventDatabases.$inferSelect
export type NewEventDatabase = typeof eventDatabases.$inferInsert
export type EventDatabaseEntry = typeof eventDatabaseEntries.$inferSelect
export type NewEventDatabaseEntry = typeof eventDatabaseEntries.$inferInsert
export type ExportToken = typeof exportTokens.$inferSelect
export type Contact = typeof contacts.$inferSelect
export type NewContact = typeof contacts.$inferInsert
export type ContactEvent = typeof contactEvents.$inferSelect
export type NewContactEvent = typeof contactEvents.$inferInsert
export type ContactStatus = (typeof contactStatusEnum.enumValues)[number]
