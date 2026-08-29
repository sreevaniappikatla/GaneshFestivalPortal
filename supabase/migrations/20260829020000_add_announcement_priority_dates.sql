alter table public.announcements
  add column if not exists priority text not null default 'normal',
  add column if not exists publish_date timestamptz,
  add column if not exists expiry_date timestamptz;

alter table public.announcements
  drop constraint if exists announcements_priority_valid;

alter table public.announcements
  add constraint announcements_priority_valid check (
    priority in ('normal', 'important', 'urgent')
  );

alter table public.announcements
  add constraint announcements_date_window_valid check (
    expiry_date is null or publish_date is null or expiry_date >= publish_date
  );

update public.announcements
set publish_date = posted_at
where publish_date is null;
