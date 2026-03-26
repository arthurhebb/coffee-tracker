-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)

create table coffee_logs (
  id bigint generated always as identity primary key,
  drink_type text not null default 'Coffee',
  size text not null default 'Medium',
  caffeine_mg int not null default 95,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Allow public access (no auth required for simplicity)
alter table coffee_logs enable row level security;

create policy "Allow all access" on coffee_logs
  for all
  using (true)
  with check (true);
