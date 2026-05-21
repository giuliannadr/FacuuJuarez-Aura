// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole = 'facundo' | 'aura_admin' | 'aura_member'

export type Site = 'facundo' | 'aura'

// ─── Content CMS ──────────────────────────────────────────────────────────────
export interface ContentBlock {
  id: string
  site: Site
  section: string      // e.g. 'hero', 'about', 'services'
  key: string          // e.g. 'title', 'description', 'image_url'
  value: string
  updated_at: string
  updated_by: string
}

// ─── Media ────────────────────────────────────────────────────────────────────
export interface MediaFile {
  id: string
  site: Site
  bucket_path: string
  url: string
  filename: string
  uploaded_by: string
  uploaded_at: string
}

// ─── Users / Members ──────────────────────────────────────────────────────────
export interface AuraMember {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url: string | null
  bio: string | null
  created_at: string
}

// ─── Availability ─────────────────────────────────────────────────────────────
export type BookingContext = 'aura' | 'facundo_solo'

export interface AvailabilitySlot {
  id: string
  member_id: string
  context: BookingContext
  date: string          // ISO date 'YYYY-MM-DD'
  start_time: string    // 'HH:MM'
  end_time: string      // 'HH:MM'
  is_booked: boolean
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled'

export interface Booking {
  id: string
  context: BookingContext
  client_name: string
  client_email: string
  subject: string
  message: string | null
  date: string
  start_time: string
  end_time: string
  status: BookingStatus
  created_at: string
}

export interface BookingParticipant {
  booking_id: string
  member_id: string
  status: 'pending' | 'accepted' | 'rejected'
  responded_at: string | null
}
