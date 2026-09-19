-- Locations and places persistence for TerraLens
-- Falls back to mock dataset in src/lib/locations.ts / places.ts if table empty

create table if not exists public.locations (
  slug text primary key,
  name text not null,
  state text not null,
  country text not null default 'Nigeria',
  lat double precision not null,
  lng double precision not null,
  overall_score integer not null check (overall_score between 0 and 100),
  tagline text not null,
  summary text not null,
  data jsonb not null, -- full LocationProfile JSON for categories/incidents/trends/twin/recommendations/quickFacts/environmentData
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id text primary key,
  location_slug text not null references public.locations(slug) on delete cascade,
  category text not null,
  subtype text not null,
  ownership text not null,
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  description text not null,
  data jsonb not null, -- services/tags/hours/rating/price/accessibility/emergency/source
  created_at timestamptz not null default now()
);

create index if not exists idx_places_location on public.places(location_slug);
create index if not exists idx_places_category on public.places(category);
create index if not exists idx_locations_state on public.locations(state);

alter table public.locations enable row level security;
alter table public.places enable row level security;

drop policy if exists "Public read locations" on public.locations;
create policy "Public read locations" on public.locations for select using (true);

drop policy if exists "Public read places" on public.places;
create policy "Public read places" on public.places for select using (true);

-- Service role can insert/update; anon can only read
drop policy if exists "Service insert locations" on public.locations;
create policy "Service insert locations" on public.locations for insert with check (auth.role() = 'service_role' or auth.role() = 'authenticated');
drop policy if exists "Service update locations" on public.locations;
create policy "Service update locations" on public.locations for update using (auth.role() = 'service_role' or auth.role() = 'authenticated');

-- Seed from mock dataset if empty (idempotent)
-- Note: actual seed data inserted via application seed script or dashboard; this ensures table is usable even before seed
