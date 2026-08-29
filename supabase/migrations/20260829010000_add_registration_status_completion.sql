alter table public.pooja_registrations
  drop constraint if exists pooja_registrations_status_valid;

alter table public.pooja_registrations
  add constraint pooja_registrations_status_valid check (
    status in ('pending', 'confirmed', 'completed', 'cancelled')
  );
