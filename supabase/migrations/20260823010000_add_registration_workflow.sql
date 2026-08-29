do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pooja_registrations'
      and column_name = 'festival_id'
  ) then
    alter table public.pooja_registrations
      add column festival_id uuid references public.festivals(id) on delete restrict;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pooja_registrations'
      and column_name = 'amount'
  ) then
    alter table public.pooja_registrations
      add column amount numeric(10, 2) not null default 0;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'pooja_registrations'
      and column_name = 'payment_status'
  ) then
    alter table public.pooja_registrations
      add column payment_status text not null default 'not_required';
  end if;
end $$;

alter table public.poojas
  add column if not exists amount numeric(10, 2) not null default 0;

alter table public.poojas
  drop constraint if exists poojas_amount_valid;

alter table public.poojas
  add constraint poojas_amount_valid check (amount >= 0);

update public.pooja_registrations as registrations
set festival_id = poojas.festival_id
from public.poojas
where poojas.id = registrations.pooja_id
  and registrations.festival_id is null;

alter table public.pooja_registrations
  alter column festival_id set not null;

alter table public.pooja_registrations
  drop constraint if exists pooja_registrations_amount_valid;
alter table public.pooja_registrations
  add constraint pooja_registrations_amount_valid check (amount >= 0);

alter table public.pooja_registrations
  drop constraint if exists pooja_registrations_payment_status_valid;
alter table public.pooja_registrations
  add constraint pooja_registrations_payment_status_valid check (
    payment_status in ('not_required', 'pending', 'paid', 'failed')
  );

alter table public.pooja_registrations
  alter column email drop not null;

create index if not exists pooja_registrations_festival_id_idx
  on public.pooja_registrations (festival_id);

drop function if exists public.create_pooja_registration(
  uuid, uuid, uuid, text, text, text, text, date, integer, text, text, text
) cascade;

create function public.create_pooja_registration(
  p_festival_id uuid,
  p_pooja_id uuid,
  p_pooja_slot_id uuid,
  p_resident_name text,
  p_unit_number text,
  p_phone text,
  p_email text,
  p_pooja_date date,
  p_family_members_count integer,
  p_gotram text default null,
  p_family_names text default null,
  p_notes text default null
)
returns table (
  id uuid,
  registration_number text,
  festival_id uuid,
  pooja_id uuid,
  pooja_slot_id uuid,
  resident_name text,
  unit_number text,
  phone text,
  email text,
  pooja_date date,
  slot_start_time time,
  slot_end_time time,
  pooja_name text,
  amount numeric,
  payment_status text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_festival public.festivals%rowtype;
  v_pooja public.poojas%rowtype;
  v_slot public.pooja_slots%rowtype;
  v_registration_count integer;
  v_registration_number text;
  v_sequence integer;
  v_registration_id uuid;
begin
  if p_resident_name is null or length(trim(p_resident_name)) < 2 then
    raise exception using errcode = '22023', message = 'INVALID_RESIDENT_NAME';
  end if;
  if p_unit_number is null or length(trim(p_unit_number)) < 1 then
    raise exception using errcode = '22023', message = 'INVALID_UNIT_NUMBER';
  end if;
  if p_phone is null or p_phone !~ '^[6-9][0-9]{9}$' then
    raise exception using errcode = '22023', message = 'INVALID_PHONE';
  end if;
  if p_email is not null and p_email <> '' and p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception using errcode = '22023', message = 'INVALID_EMAIL';
  end if;
  if p_family_members_count is null or p_family_members_count < 1 or p_family_members_count > 20 then
    raise exception using errcode = '22023', message = 'INVALID_FAMILY_COUNT';
  end if;

  select * into v_festival
  from public.festivals
  where festivals.id = p_festival_id
  for share;
  if not found then
    raise exception using errcode = 'P0001', message = 'INVALID_FESTIVAL';
  end if;

  select * into v_pooja
  from public.poojas
  where poojas.id = p_pooja_id
    and poojas.festival_id = p_festival_id
  for share;
  if not found or not v_pooja.is_active then
    raise exception using errcode = 'P0001', message = 'INACTIVE_OR_INVALID_POOJA';
  end if;

  select * into v_slot
  from public.pooja_slots
  where pooja_slots.id = p_pooja_slot_id
  for update;
  if not found
    or not v_slot.is_active
    or v_slot.pooja_id <> p_pooja_id
    or v_slot.slot_date <> p_pooja_date then
    raise exception using errcode = 'P0001', message = 'INVALID_OR_INACTIVE_SLOT';
  end if;

  select count(*) into v_registration_count
  from public.pooja_registrations as pr
  where pr.pooja_slot_id = p_pooja_slot_id
    and pr.status <> 'cancelled';

  if v_slot.capacity is not null and v_registration_count >= v_slot.capacity then
    raise exception using errcode = 'P0001', message = 'SLOT_FULL';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    coalesce(nullif(v_festival.registration_prefix, ''), 'GCF') || '-' || v_festival.year::text,
    0
  ));

  select coalesce(max(cast(regexp_replace(pr.registration_number, '^.*-([0-9]+)$', '\1') as integer)), 0) + 1
    into v_sequence
  from public.pooja_registrations as pr
  where pr.festival_id = p_festival_id
    and pr.registration_number is not null;

  v_registration_number := format(
    '%s-%s-%s',
    coalesce(nullif(v_festival.registration_prefix, ''), 'GCF'),
    v_festival.year,
    lpad(v_sequence::text, 4, '0')
  );

  insert into public.pooja_registrations (
    festival_id,
    pooja_id,
    pooja_slot_id,
    registration_number,
    resident_name,
    unit_number,
    phone,
    email,
    pooja_date,
    family_members_count,
    gotram,
    family_names,
    notes,
    amount,
    payment_status,
    status
  ) values (
    p_festival_id,
    p_pooja_id,
    p_pooja_slot_id,
    v_registration_number,
    trim(p_resident_name),
    trim(p_unit_number),
    p_phone,
    nullif(trim(coalesce(p_email, '')), ''),
    p_pooja_date,
    p_family_members_count,
    nullif(trim(coalesce(p_gotram, '')), ''),
    nullif(trim(coalesce(p_family_names, '')), ''),
    nullif(trim(coalesce(p_notes, '')), ''),
    coalesce(v_pooja.amount, 0),
    case when coalesce(v_pooja.amount, 0) > 0 then 'pending' else 'not_required' end,
    'confirmed'
  ) returning pooja_registrations.id into v_registration_id;

  return query
  select r.id, r.registration_number, r.festival_id, r.pooja_id, r.pooja_slot_id,
    r.resident_name, r.unit_number, r.phone, r.email, r.pooja_date,
    s.start_time, s.end_time, p.name, r.amount, r.payment_status, r.status, r.created_at
  from public.pooja_registrations as r
  join public.poojas as p on p.id = r.pooja_id
  join public.pooja_slots as s on s.id = r.pooja_slot_id
  where r.id = v_registration_id;
end;
$$;

revoke all on function public.create_pooja_registration(uuid, uuid, uuid, text, text, text, text, date, integer, text, text, text) from public;
grant execute on function public.create_pooja_registration(uuid, uuid, uuid, text, text, text, text, date, integer, text, text, text) to anon, authenticated;
