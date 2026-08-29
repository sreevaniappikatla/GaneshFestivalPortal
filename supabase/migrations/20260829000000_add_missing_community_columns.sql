alter table public.communities
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists primary_color text,
  add column if not exists secondary_color text,
  add column if not exists accent_color text;

update public.communities
set city = location
where city is null and location is not null;

update public.communities
set address = ''
where address is null;

update public.communities
set primary_color = '#7c1d28'
where primary_color is null;

update public.communities
set secondary_color = '#f7d27d'
where secondary_color is null;

update public.communities
set accent_color = '#d97706'
where accent_color is null;
