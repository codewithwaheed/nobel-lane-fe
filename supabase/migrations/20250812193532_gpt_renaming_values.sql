-- 1.1 Ensure core tables have needed columns

-- vehicle_types: add is_active if missing (note: it's vehicle_types, not vehicles)
alter table if exists public.vehicle_types
  add column if not exists is_active boolean default true;

-- pricing_grid: unify with service_type and support is_active
-- Since the table already exists, we just need to ensure it has the is_active column
alter table if exists public.pricing_grid
  add column if not exists is_active boolean default true;

-- Update indexes to match existing schema (using 'zone' not 'zone_number')
create index if not exists idx_pricing_grid_active on public.pricing_grid(is_active);
create index if not exists idx_pricing_grid_vehicle on public.pricing_grid(vehicle_id);
create index if not exists idx_pricing_grid_combo on public.pricing_grid(service_type, zone);

-- zones table as you defined (ensure it exists with dfw_zone/dal_zone)
create table if not exists public.zones (
  zip_code text primary key,
  city text,
  dfw_zone int,
  dal_zone int
);
create index if not exists idx_zones_dfw on public.zones(dfw_zone);
create index if not exists idx_zones_dal on public.zones(dal_zone);

-- additional_fees
create table if not exists public.additional_fees (
  id bigserial primary key,
  fee_type text not null,               -- e.g., 'early_late', 'extra_stop', 'international_arrival', 'holiday', 'flight_tracking'
  name text not null,
  amount numeric(12,2) not null,
  is_percentage boolean not null default false,
  applies_to text[] null,               -- e.g., '{"one-way","hourly"}' or null for both
  is_active boolean not null default true,
  created_at timestamp with time zone default now()
);
create index if not exists idx_additional_fees_active on public.additional_fees(is_active);

-- 1.2 A small helper table for airport zips (optional but useful)
create table if not exists public.airports (
  code text primary key,                -- 'DFW' or 'DAL'
  display_name text not null,
  primary_zip text not null             -- a representative airport ZIP
);
insert into public.airports (code, display_name, primary_zip)
  values ('DFW','Dallas/Fort Worth International Airport','75261')
  on conflict (code) do nothing;
insert into public.airports (code, display_name, primary_zip)
  values ('DAL','Dallas Love Field','75235')
  on conflict (code) do nothing;

-- 1.3 Consolidated view used by the edge function
drop view if exists public.pricing_with_vehicle_details;

create view public.pricing_with_vehicle_details as
select
  vt.vehicle_id,
  vt.name as vehicle_name,
  coalesce(vt.description,'') as vehicle_description,
  vt.capacity,
  coalesce(vt.luggage_description,'') as luggage_description,
  coalesce(vt.special_notes,'') as special_notes,
  pg.service_type,
  pg.zone,
  pg.rate,
  pg.min_hours,
  least(pg.is_active::int, vt.is_active::int)::boolean as is_active
from public.pricing_grid pg
join public.vehicle_types vt on vt.vehicle_id = pg.vehicle_id;

-- 1.4 (Optional) RLS policies (simplified; tighten as needed)
-- Make readable to anon key (edge functions use service role or auth)
alter table public.pricing_grid enable row level security;
alter table public.vehicle_types enable row level security;
alter table public.zones enable row level security;
alter table public.additional_fees enable row level security;

create policy if not exists pricing_grid_read on public.pricing_grid
  for select using (true);
create policy if not exists vehicle_types_read on public.vehicle_types
  for select using (true);
create policy if not exists zones_read on public.zones
  for select using (true);
create policy if not exists fees_read on public.additional_fees
  for select using (true);