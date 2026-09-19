create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  location_slug text not null,
  category text not null,
  description text not null check (char_length(description) between 10 and 2000),
  reporter_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

drop policy if exists "Public insert reports" on public.reports;
create policy "Public insert reports" on public.reports for insert with check (true);

drop policy if exists "Public read reports" on public.reports;
create policy "Public read reports" on public.reports for select using (true);
