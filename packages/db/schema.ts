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
} from 'drizzle-orm/pg-core'

// ─── Enums ────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['facundo', 'aura_admin', 'aura_member'])
export const siteEnum = pgEnum('site', ['facundo', 'aura'])
export const bookingContextEnum = pgEnum('booking_context', ['aura', 'facundo_solo'])
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'rejected', 'cancelled'])
export const participantStatusEnum = pgEnum('participant_status', ['pending', 'accepted', 'rejected'])

// ─── Profiles ─────────────────────────────────────────────────────────────────
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),                    // matches auth.users(id)
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
    section: text('section').notNull(),           // 'hero', 'about', 'services'
    key: text('key').notNull(),                   // 'title', 'description', 'image_url'
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

// ─── Inferred types ───────────────────────────────────────────────────────────
export type Profile = typeof profiles.$inferSelect
export type ContentBlock = typeof contentBlocks.$inferSelect
export type MediaFile = typeof mediaFiles.$inferSelect
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect
export type Booking = typeof bookings.$inferSelect
export type BookingParticipant = typeof bookingParticipants.$inferSelect

export type NewBooking = typeof bookings.$inferInsert
export type NewAvailabilitySlot = typeof availabilitySlots.$inferInsert
