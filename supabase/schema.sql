-- ============================================================
-- AURA ECOSYSTEM — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Custom types ────────────────────────────────────────────
create type user_role as enum ('facundo', 'aura_admin', 'aura_member');
create type site as enum ('facundo', 'aura');
create type booking_context as enum ('aura', 'facundo_solo');
create type booking_status as enum ('pending', 'confirmed', 'rejected', 'cancelled');
create type participant_status as enum ('pending', 'accepted', 'rejected');

-- ─── Profiles (extends auth.users) ───────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text not null,
  role        user_role not null default 'aura_member',
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read all profiles (needed for booking selector)
create policy "profiles: public read"
  on public.profiles for select using (true);

-- Users can update their own profile
create policy "profiles: self update"
  on public.profiles for update using (auth.uid() = id);

-- Only facundo can insert/delete profiles
create policy "profiles: facundo manage"
  on public.profiles for all
  using (
    (select role from public.profiles where id = auth.uid()) = 'facundo'
  );

-- ─── Content blocks (CMS) ────────────────────────────────────
create table public.content_blocks (
  id          uuid primary key default uuid_generate_v4(),
  site        site not null,
  section     text not null,   -- 'hero', 'about', 'services', etc.
  key         text not null,   -- 'title', 'description', 'image_url', etc.
  value       text not null default '',
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.profiles(id),
  unique (site, section, key)
);

alter table public.content_blocks enable row level security;

-- Anyone can read content (public sites fetch it)
create policy "content: public read"
  on public.content_blocks for select using (true);

-- Facundo can edit both sites
create policy "content: facundo edit all"
  on public.content_blocks for all
  using (
    (select role from public.profiles where id = auth.uid()) = 'facundo'
  );

-- aura_admin can only edit the aura site
create policy "content: aura_admin edit aura"
  on public.content_blocks for all
  using (
    (select role from public.profiles where id = auth.uid()) = 'aura_admin'
    and site = 'aura'
  );

-- ─── Media files ─────────────────────────────────────────────
create table public.media_files (
  id           uuid primary key default uuid_generate_v4(),
  site         site not null,
  bucket_path  text not null,
  url          text not null,
  filename     text not null,
  uploaded_by  uuid references public.profiles(id),
  uploaded_at  timestamptz not null default now()
);

alter table public.media_files enable row level security;

create policy "media: public read"
  on public.media_files for select using (true);

create policy "media: facundo manage all"
  on public.media_files for all
  using (
    (select role from public.profiles where id = auth.uid()) = 'facundo'
  );

create policy "media: aura_admin manage aura"
  on public.media_files for all
  using (
    (select role from public.profiles where id = auth.uid()) = 'aura_admin'
    and site = 'aura'
  );

-- ─── Availability slots ──────────────────────────────────────
create table public.availability_slots (
  id          uuid primary key default uuid_generate_v4(),
  member_id   uuid not null references public.profiles(id) on delete cascade,
  context     booking_context not null,
  date        date not null,
  start_time  time not null,
  end_time    time not null,
  is_booked   boolean not null default false,
  constraint no_overlap unique (member_id, context, date, start_time)
);

alter table public.availability_slots enable row level security;

-- Anyone can read availability (needed for public booking page)
create policy "availability: public read"
  on public.availability_slots for select using (true);

-- Members manage their own slots
create policy "availability: self manage"
  on public.availability_slots for all
  using (auth.uid() = member_id);

-- ─── Bookings ────────────────────────────────────────────────
create table public.bookings (
  id            uuid primary key default uuid_generate_v4(),
  context       booking_context not null,
  client_name   text not null,
  client_email  text not null,
  subject       text not null,
  message       text,
  date          date not null,
  start_time    time not null,
  end_time      time not null,
  status        booking_status not null default 'pending',
  created_at    timestamptz not null default now()
);

alter table public.bookings enable row level security;

-- Clients can insert bookings (anon)
create policy "bookings: public insert"
  on public.bookings for insert with check (true);

-- Only authenticated members can read bookings
create policy "bookings: members read"
  on public.bookings for select
  using (auth.uid() is not null);

-- Facundo can update/delete any booking
create policy "bookings: facundo manage"
  on public.bookings for all
  using (
    (select role from public.profiles where id = auth.uid()) = 'facundo'
  );

-- ─── Booking participants ────────────────────────────────────
create table public.booking_participants (
  booking_id    uuid not null references public.bookings(id) on delete cascade,
  member_id     uuid not null references public.profiles(id) on delete cascade,
  status        participant_status not null default 'pending',
  responded_at  timestamptz,
  primary key (booking_id, member_id)
);

alter table public.booking_participants enable row level security;

-- Members see participations where they are involved
create policy "participants: member read own"
  on public.booking_participants for select
  using (auth.uid() = member_id);

-- Facundo sees all
create policy "participants: facundo read all"
  on public.booking_participants for select
  using (
    (select role from public.profiles where id = auth.uid()) = 'facundo'
  );

-- Members can update their own response
create policy "participants: member respond"
  on public.booking_participants for update
  using (auth.uid() = member_id);

-- System inserts on booking creation (via service role)
create policy "participants: service insert"
  on public.booking_participants for insert with check (true);

-- ─── Trigger: auto-create profile on signup ──────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'aura_member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Supabase Storage buckets ────────────────────────────────
-- Run these separately in the Storage section or via API:
-- insert into storage.buckets (id, name, public) values ('facundo-media', 'facundo-media', true);
-- insert into storage.buckets (id, name, public) values ('aura-media', 'aura-media', true);
