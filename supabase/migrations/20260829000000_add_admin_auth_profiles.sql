create type public.admin_role as enum (
  'SUPER_ADMIN',
  'FESTIVAL_ADMIN',
  'POOJA_ADMIN',
  'EVENT_ADMIN',
  'VIEWER'
);

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role public.admin_role not null,
  is_active boolean not null default true,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_profiles_role_idx
  on public.admin_profiles (role, is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger admin_profiles_set_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;

create policy "Admins can view their own profile"
  on public.admin_profiles
  for select
  using (auth.uid() = user_id);

create policy "Service role can manage admin profiles"
  on public.admin_profiles
  for all
  using (true)
  with check (true);

create policy "Users can insert their own profile if active"
  on public.admin_profiles
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.admin_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
