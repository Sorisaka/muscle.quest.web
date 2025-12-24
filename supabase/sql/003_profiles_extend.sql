-- Purpose: Extend public.profiles to store workout points metadata.
-- Run order: Execute after 001_profiles.sql and before creating dependent tables/functions.
-- Notes: Adds points tracking columns and refreshes signup trigger to seed defaults.

-- Add points and related columns to profiles
alter table if exists public.profiles
  add column if not exists points integer not null default 0,
  add column if not exists completed_runs integer not null default 0,
  add column if not exists last_result jsonb;

-- Backfill defaults for existing rows
update public.profiles set points = 0 where points is null;
update public.profiles set completed_runs = 0 where completed_runs is null;

alter table if exists public.profiles alter column points set default 0;
alter table if exists public.profiles alter column points set not null;

alter table if exists public.profiles alter column completed_runs set default 0;
alter table if exists public.profiles alter column completed_runs set not null;

-- Keep last_result nullable by design (stores most recent workout result)

-- Refresh signup trigger function to seed new defaults on user creation
create or replace function public.handle_new_user_profile()
returns trigger
security definer
set search_path = public
language plpgsql as $$
declare
  fallback_name text;
begin
  fallback_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'user_name',
    new.email
  );

  insert into public.profiles (id, display_name, points, completed_runs, last_result)
  values (new.id, fallback_name, 0, 0, null)
  on conflict (id) do nothing;
  return new;
end;
$$;
