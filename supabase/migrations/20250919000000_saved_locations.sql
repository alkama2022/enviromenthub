-- Saved locations for authenticated users.
-- Anonymous users use localStorage fallback (src/lib/favorites.ts), so table is optional at runtime.
-- This migration is idempotent and safe to apply multiple times.

create table if not exists public.saved_locations (
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, slug)
);

alter table public.saved_locations enable row level security;

-- Users can only manage their own saved locations
drop policy if exists "Users manage own saved_locations" on public.saved_locations;
create policy "Users manage own saved_locations"
  on public.saved_locations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Helpful index for listing
create index if not exists idx_saved_locations_user_created on public.saved_locations(user_id, created_at desc);
