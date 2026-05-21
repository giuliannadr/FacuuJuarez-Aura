import { drizzle } from 'drizzle-orm/node-postgres'
import { createClient } from '@supabase/supabase-js'
import * as schema from './schema'

// Drizzle — para queries tipadas desde Server Components y API routes
export const db = drizzle(process.env.DATABASE_URL!, { schema })

// Supabase client — para auth y storage (no para queries de DB)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
