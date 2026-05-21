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
} from 'drizzle-orm/pg-core'

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

// ─── Profiles ─────────────────────────────────────────────────────────────────
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // matches auth.users(id)
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('aura_member'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
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

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  context: bookingContextEnum('context').notNull(),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  subject: text('subject').notNull(),
  message: text('message'),
  date: date('date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  status: bookingStatusEnum('status').notNull().default('pending'),
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

// ─── Inferred types ───────────────────────────────────────────────────────────
export type Profile = typeof profiles.$inferSelect
export type ContentBlock = typeof contentBlocks.$inferSelect
export type MediaFile = typeof mediaFiles.$inferSelect
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect
export type Booking = typeof bookings.$inferSelect
export type BookingParticipant = typeof bookingParticipants.$inferSelect

export type NewBooking = typeof bookings.$inferInsert
export type NewAvailabilitySlot = typeof availabilitySlots.$inferInsert
export type Event = typeof events.$inferSelect
export type EventMember = typeof eventMembers.$inferSelect
export type NewEvent = typeof events.$inferInsert
