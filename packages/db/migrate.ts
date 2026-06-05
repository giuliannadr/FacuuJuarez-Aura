import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'

const db = drizzle(process.env.DATABASE_URL!)

const stmts = [
  'ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_potential_client BOOLEAN NOT NULL DEFAULT FALSE',
  'ALTER TABLE contacts ADD COLUMN IF NOT EXISTS birthday_person_birth_date DATE',
  'ALTER TABLE contact_events ADD COLUMN IF NOT EXISTS organizer_name TEXT',
  'ALTER TABLE contact_events ADD COLUMN IF NOT EXISTS organizer_phone TEXT',
  'ALTER TABLE contact_events ADD COLUMN IF NOT EXISTS organizer_email TEXT',
]

async function run() {
  for (const s of stmts) {
    await db.execute(sql.raw(s))
    process.stdout.write(s.slice(0, 60) + ' -> OK\n')
  }
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e.message)
    process.exit(1)
  })
