create extension if not exists pgcrypto;

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  location text,
  logo_url text,
  contact_phone text,
  contact_email text,
  whatsapp_number text,
  timezone text not null default 'Asia/Kolkata',
  currency char(3) not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.festivals (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  name text not null,
  deity_name text,
  year integer not null,
  start_date date not null,
  end_date date not null,
  hero_title text,
  hero_subtitle text,
  registration_prefix text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint festivals_date_range check (end_date >= start_date),
  constraint festivals_year_valid check (year between 1 and 9999),
  constraint festivals_community_year_unique unique (community_id, year)
);

create table public.festival_events (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals(id) on delete cascade,
  event_date date not null,
  title text not null,
  description text,
  start_time time not null,
  end_time time not null,
  venue text,
  category text not null default 'other',
  highlighted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint festival_events_time_range check (end_time > start_time),
  constraint festival_events_category_valid check (
    category in ('pooja', 'cultural', 'food', 'kids', 'celebration', 'other')
  )
);

create table public.poojas (
  id uuid primary key default gen_random_uuid(),
  festival_id uuid not null references public.festivals(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  maximum_registrations integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint poojas_maximum_registrations_valid check (
    maximum_registrations is null or maximum_registrations >= 0
  ),
  constraint poojas_festival_name_unique unique (festival_id, name)
);

create table public.pooja_slots (
  id uuid primary key default gen_random_uuid(),
  pooja_id uuid not null references public.poojas(id) on delete cascade,
  slot_date date not null,
  start_time time not null,
  end_time time not null,
  capacity integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pooja_slots_time_range check (end_time > start_time),
  constraint pooja_slots_capacity_valid check (capacity is null or capacity >= 0),
  constraint pooja_slots_time_unique unique (pooja_id, slot_date, start_time)
);

create table public.pooja_registrations (
  id uuid primary key default gen_random_uuid(),
  pooja_id uuid not null references public.poojas(id) on delete restrict,
  pooja_slot_id uuid not null references public.pooja_slots(id) on delete restrict,
  registration_number text unique,
  resident_name text not null,
  unit_number text not null,
  phone text not null,
  email text not null,
  pooja_date date not null,
  family_members_count integer not null default 1,
  gotram text,
  family_names text,
  notes text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pooja_registrations_family_count_valid check (family_members_count > 0),
  constraint pooja_registrations_status_valid check (
    status in ('pending', 'confirmed', 'cancelled')
  )
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  festival_id uuid references public.festivals(id) on delete set null,
  title text not null,
  message text not null,
  posted_at timestamptz not null default now(),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index festivals_community_id_idx on public.festivals (community_id);
create index festival_events_festival_date_idx on public.festival_events (festival_id, event_date);
create index festival_events_category_idx on public.festival_events (category);
create index poojas_festival_active_idx on public.poojas (festival_id, is_active);
create index pooja_slots_pooja_date_idx on public.pooja_slots (pooja_id, slot_date);
create index pooja_registrations_pooja_id_idx on public.pooja_registrations (pooja_id);
create index pooja_registrations_slot_id_idx on public.pooja_registrations (pooja_slot_id);
create index pooja_registrations_date_idx on public.pooja_registrations (pooja_date);
create index pooja_registrations_status_idx on public.pooja_registrations (status);
create index announcements_community_posted_at_idx on public.announcements (community_id, posted_at desc);
create index announcements_festival_posted_at_idx on public.announcements (festival_id, posted_at desc);
create index announcements_published_posted_at_idx on public.announcements (is_published, posted_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger communities_set_updated_at
before update on public.communities
for each row execute function public.set_updated_at();

create trigger festivals_set_updated_at
before update on public.festivals
for each row execute function public.set_updated_at();

create trigger festival_events_set_updated_at
before update on public.festival_events
for each row execute function public.set_updated_at();

create trigger poojas_set_updated_at
before update on public.poojas
for each row execute function public.set_updated_at();

create trigger pooja_slots_set_updated_at
before update on public.pooja_slots
for each row execute function public.set_updated_at();

create trigger pooja_registrations_set_updated_at
before update on public.pooja_registrations
for each row execute function public.set_updated_at();

create trigger announcements_set_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();
