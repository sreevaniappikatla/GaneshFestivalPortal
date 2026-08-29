begin;

-- The current schema stores city in communities.location. State and country,
-- festival registration/status, pooja amounts, and announcement priority are
-- not columns in the applied migration, so they are intentionally omitted.

do $$
<<seed_data>>
declare
  v_community_id uuid;
  v_festival_id uuid;
  v_ganapathi_homam_id uuid;
  v_ganesh_archana_id uuid;
  v_ganesh_abhishekam_id uuid;
  v_annadanam_sponsorship_id uuid;
begin
  insert into public.communities (
    id,
    name,
    short_name,
    location,
    contact_phone,
    contact_email,
    timezone,
    currency
  ) values (
    '00000000-0000-4000-8000-000000000001',
    'Sri Sai Residency',
    'SSR',
    'Hyderabad',
    '+91 9999999999',
    'ganeshcommittee@example.com',
    'Asia/Kolkata',
    'INR'
  )
  on conflict do nothing;

  select c.id into v_community_id
  from public.communities as c
  where name = 'Sri Sai Residency'
    and short_name = 'SSR'
  order by created_at
  limit 1;

  insert into public.festivals (
    id,
    community_id,
    name,
    deity_name,
    year,
    start_date,
    end_date,
    hero_title,
    hero_subtitle,
    registration_prefix
  ) values (
    '00000000-0000-4000-8000-000000000002',
    v_community_id,
    'Ganesh Chaturthi Celebrations',
    'Sri Maha Ganapathi',
    2026,
    '2026-08-25',
    '2026-09-03',
    'Ganesh Chaturthi Celebrations 2026',
    'Ganapati Bappa Morya',
    'SSR'
  )
  on conflict (community_id, year) do nothing;

  select f.id into v_festival_id
  from public.festivals as f
  where f.community_id = seed_data.v_community_id
    and f.year = 2026
  limit 1;

  insert into public.poojas (
    festival_id,
    name,
    description,
    is_active,
    maximum_registrations,
    amount
  ) values
    (
      v_festival_id,
      'Ganapathi Homam',
      'Sacred fire ritual for prosperity and the removal of obstacles. Contribution: INR 1500.',
      true,
      10,
      1500
    ),
    (
      v_festival_id,
      'Ganesh Archana',
      'Traditional flower offering and prayer ritual to Lord Ganesha. Contribution: INR 501.',
      true,
      20,
      501
    ),
    (
      v_festival_id,
      'Ganesh Abhishekam',
      'Ceremonial bathing ritual of the deity with milk, honey, and sacred water. Contribution: INR 1001.',
      true,
      10,
      1001
    ),
    (
      v_festival_id,
      'Annadanam Sponsorship',
      'Sponsor a community meal offered as a selfless act of service. Contribution: INR 5000.',
      true,
      100,
      5000
    )
  on conflict (festival_id, name) do nothing;

  select p.id into v_ganapathi_homam_id from public.poojas as p where p.festival_id = seed_data.v_festival_id and p.name = 'Ganapathi Homam';
  select p.id into v_ganesh_archana_id from public.poojas as p where p.festival_id = seed_data.v_festival_id and p.name = 'Ganesh Archana';
  select p.id into v_ganesh_abhishekam_id from public.poojas as p where p.festival_id = seed_data.v_festival_id and p.name = 'Ganesh Abhishekam';
  select p.id into v_annadanam_sponsorship_id from public.poojas as p where p.festival_id = seed_data.v_festival_id and p.name = 'Annadanam Sponsorship';

  insert into public.festival_events (id, festival_id, event_date, title, description, start_time, end_time, venue, category, highlighted) values
    ('10000000-0000-4000-8000-000000000001', v_festival_id, '2026-08-25', 'Ganesh Idol Sthapana', 'Installation of the Ganesh idol at the community pandal.', '08:00', '09:00', 'Community Hall', 'pooja', true),
    ('10000000-0000-4000-8000-000000000002', v_festival_id, '2026-08-25', 'Ganapathi Homam', 'Sacred fire ritual followed by blessings for the community.', '09:00', '10:30', 'Community Hall', 'pooja', true),
    ('10000000-0000-4000-8000-000000000003', v_festival_id, '2026-08-25', 'Maha Prasadam', 'Community lunch served after the morning rituals.', '12:30', '14:00', 'Dining Area', 'food', false),
    ('10000000-0000-4000-8000-000000000004', v_festival_id, '2026-08-25', 'Maha Harathi', 'Evening worship and lamp offering.', '19:00', '19:30', 'Community Hall', 'celebration', true),
    ('10000000-0000-4000-8000-000000000005', v_festival_id, '2026-08-25', 'Cultural Programs', 'Music and dance performances by residents.', '19:30', '21:00', 'Open Lawn', 'cultural', false),
    ('10000000-0000-4000-8000-000000000006', v_festival_id, '2026-08-26', 'Morning Ganesh Pooja', 'Daily morning pooja and aarti.', '08:00', '09:00', 'Community Hall', 'pooja', false),
    ('10000000-0000-4000-8000-000000000007', v_festival_id, '2026-08-26', 'Prasadam Distribution', 'Prasadam distribution for residents and visitors.', '12:30', '13:30', 'Prasadam Counter', 'food', false),
    ('10000000-0000-4000-8000-000000000008', v_festival_id, '2026-08-26', 'Maha Harathi', 'Evening worship and lamp offering.', '19:00', '19:30', 'Community Hall', 'celebration', false),
    ('10000000-0000-4000-8000-000000000009', v_festival_id, '2026-08-26', 'Children''s Cultural Program', 'Performances by the children of the community.', '19:30', '21:00', 'Open Lawn', 'kids', true),
    ('10000000-0000-4000-8000-000000000010', v_festival_id, '2026-08-27', 'Morning Ganesh Pooja', 'Daily morning pooja and aarti.', '08:00', '09:00', 'Community Hall', 'pooja', false),
    ('10000000-0000-4000-8000-000000000011', v_festival_id, '2026-08-27', 'Ganesh Quiz for Children', 'A fun quiz on Ganesh legends with prizes.', '17:00', '18:00', 'Community Hall', 'kids', false),
    ('10000000-0000-4000-8000-000000000012', v_festival_id, '2026-08-27', 'Maha Harathi', 'Evening worship and lamp offering.', '19:00', '19:30', 'Community Hall', 'celebration', false),
    ('10000000-0000-4000-8000-000000000013', v_festival_id, '2026-08-28', 'Ganesh Archana', 'Community archana with flower offerings.', '08:00', '09:30', 'Community Hall', 'pooja', true),
    ('10000000-0000-4000-8000-000000000014', v_festival_id, '2026-08-28', 'Bhajan Sandhya', 'An evening of devotional bhajans.', '19:00', '20:30', 'Community Hall', 'cultural', false),
    ('10000000-0000-4000-8000-000000000015', v_festival_id, '2026-08-29', 'Morning Ganesh Pooja', 'Daily morning pooja and aarti.', '08:00', '09:00', 'Community Hall', 'pooja', false),
    ('10000000-0000-4000-8000-000000000016', v_festival_id, '2026-08-29', 'Modak Making Workshop', 'A family workshop on preparing traditional modaks.', '16:00', '17:30', 'Activity Room', 'food', false),
    ('10000000-0000-4000-8000-000000000017', v_festival_id, '2026-08-29', 'Maha Harathi', 'Evening worship and lamp offering.', '19:00', '19:30', 'Community Hall', 'celebration', false),
    ('10000000-0000-4000-8000-000000000018', v_festival_id, '2026-08-30', 'Ganesh Abhishekam', 'Ceremonial bathing ritual of the deity.', '08:00', '09:30', 'Community Hall', 'pooja', true),
    ('10000000-0000-4000-8000-000000000019', v_festival_id, '2026-08-30', 'Community Feast', 'Festive meal shared by the community.', '12:30', '14:30', 'Open Lawn', 'food', true),
    ('10000000-0000-4000-8000-000000000020', v_festival_id, '2026-08-31', 'Devotional Music Evening', 'Devotional music by resident performers.', '19:00', '21:00', 'Open Lawn', 'cultural', false),
    ('10000000-0000-4000-8000-000000000021', v_festival_id, '2026-09-01', 'Morning Ganesh Pooja', 'Daily morning pooja and aarti.', '08:00', '09:00', 'Community Hall', 'pooja', false),
    ('10000000-0000-4000-8000-000000000022', v_festival_id, '2026-09-01', 'Maha Harathi', 'Evening worship and lamp offering.', '19:00', '19:30', 'Community Hall', 'celebration', false),
    ('10000000-0000-4000-8000-000000000023', v_festival_id, '2026-09-02', 'Family Games Evening', 'Festive games and activities for all ages.', '17:00', '18:30', 'Open Lawn', 'other', false),
    ('10000000-0000-4000-8000-000000000024', v_festival_id, '2026-09-02', 'Maha Harathi', 'Final evening worship before visarjan.', '19:00', '19:30', 'Community Hall', 'celebration', true),
    ('10000000-0000-4000-8000-000000000025', v_festival_id, '2026-09-03', 'Visarjan Pooja', 'Final pooja and farewell prayers for Bappa.', '08:00', '09:30', 'Community Hall', 'pooja', true),
    ('10000000-0000-4000-8000-000000000026', v_festival_id, '2026-09-03', 'Ganesh Visarjan Procession', 'Community procession and idol immersion ceremony.', '16:00', '19:00', 'Community Grounds', 'celebration', true)
  on conflict (id) do nothing;

  insert into public.pooja_slots (id, pooja_id, slot_date, start_time, end_time, capacity, is_active) values
    ('20000000-0000-4000-8000-000000000001', v_ganapathi_homam_id, '2026-08-25', '09:00', '10:30', 10, true),
    ('20000000-0000-4000-8000-000000000002', v_ganesh_archana_id, '2026-08-25', '07:00', '08:00', 20, true),
    ('20000000-0000-4000-8000-000000000003', v_ganesh_archana_id, '2026-08-27', '07:00', '08:00', 20, true),
    ('20000000-0000-4000-8000-000000000004', v_ganesh_archana_id, '2026-08-29', '07:00', '08:00', 20, true),
    ('20000000-0000-4000-8000-000000000005', v_ganesh_archana_id, '2026-08-31', '07:00', '08:00', 20, true),
    ('20000000-0000-4000-8000-000000000006', v_ganesh_archana_id, '2026-09-02', '07:00', '08:00', 20, true),
    ('20000000-0000-4000-8000-000000000007', v_ganesh_abhishekam_id, '2026-08-26', '08:00', '09:30', 10, true),
    ('20000000-0000-4000-8000-000000000008', v_ganesh_abhishekam_id, '2026-08-30', '08:00', '09:30', 10, true),
    ('20000000-0000-4000-8000-000000000009', v_ganesh_abhishekam_id, '2026-09-02', '08:00', '09:30', 10, true),
    ('20000000-0000-4000-8000-000000000010', v_annadanam_sponsorship_id, '2026-08-25', '12:30', '14:00', 100, true),
    ('20000000-0000-4000-8000-000000000011', v_annadanam_sponsorship_id, '2026-08-30', '12:30', '14:30', 100, true),
    ('20000000-0000-4000-8000-000000000012', v_annadanam_sponsorship_id, '2026-09-03', '12:30', '14:00', 100, true)
  on conflict (id) do nothing;

  insert into public.announcements (
    id,
    community_id,
    festival_id,
    title,
    message,
    posted_at,
    is_published
  ) values
    (
      '30000000-0000-4000-8000-000000000001',
      v_community_id,
      v_festival_id,
      'Welcome to Ganesh Chaturthi Celebrations 2026',
      'Sri Sai Residency warmly welcomes every family to join the celebrations from 25 August to 3 September 2026.',
      '2026-08-15 09:00:00+05:30',
      true
    ),
    (
      '30000000-0000-4000-8000-000000000002',
      v_community_id,
      v_festival_id,
      'Pooja registrations are now open',
      'Residents can reserve available pooja slots through the registration page. Please register early as capacities are limited.',
      '2026-08-18 10:00:00+05:30',
      true
    ),
    (
      '30000000-0000-4000-8000-000000000003',
      v_community_id,
      v_festival_id,
      'Cultural program registrations announcement',
      'Children and residents interested in participating in cultural programs should contact the festival committee by 22 August.',
      '2026-08-20 18:00:00+05:30',
      true
    )
  on conflict (id) do nothing;
end $$;

commit;
