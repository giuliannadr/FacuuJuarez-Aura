# Facuu Juarez & Aura — Platform

End-to-end platform for Facuu Juarez — landing page, agency site (Aura), and admin dashboard for bookings & content management.

## Apps

| App                    | Description                                                     | Port |
| ---------------------- | --------------------------------------------------------------- | ---- |
| `apps/facundo-landing` | Public landing page for DJ Facuu Juarez                         | 3001 |
| `apps/aura-admin`      | Unified admin — reservations, availability & content management | 3000 |

## Stack

- **Framework:** Next.js 15 (App Router)
- **Monorepo:** Turborepo
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Deploy:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Environment variables

Each app has its own `.env.local`. Copy the example and fill in the values:

```bash
cp apps/aura-admin/.env.example apps/aura-admin/.env.local
cp apps/facundo-landing/.env.example apps/facundo-landing/.env.local
```

### Dev

Run all apps in parallel:

```bash
npm run dev
```

Or run a single app:

```bash
npx turbo dev --filter=facundo-landing
npx turbo dev --filter=aura-admin
```

## Project Structure

```
FacuuJuarez-Aura/
├── apps/
│   ├── facundo-landing/     # Public DJ landing page
│   └── aura-admin/          # Admin dashboard & booking engine
├── packages/
│   └── db/                  # Shared DB schema (Supabase)
├── turbo.json
└── package.json
```
