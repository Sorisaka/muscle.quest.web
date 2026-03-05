-- Phase0/1/2/3 foundation migration
-- Safe/idempotent changes for:
-- - profiles calorie/body settings
-- - workout_runs post metadata + calories
-- - follows table
-- - weekly_plans / special_plans tables
-- - add_workout_result RPC (calories-aware)
-- - RLS baseline templates

begin;

-- 1) profiles extension (calories + body settings)
alter table if exists public.profiles
  add column if not exists height_cm numeric,
  add column if not exists weight_kg numeric,
  add column if not exists sex text,
  add column if not exists step_length_m numeric,
  add column if not exists arm_length_m numeric,
  add column if not exists leg_length_m numeric,
  add column if not exists torso_length_m numeric,
  add column if not exists step_length_m_mode text,
  add column if not exists arm_length_m_mode text,
  add column if not exists leg_length_m_mode text,
  add column if not exists torso_length_m_mode text,
  add column if not exists total_calories numeric not null default 0;

update public.profiles
set sex = 'unknown'
where sex is null;

update public.profiles
set step_length_m_mode = 'auto'
where step_length_m_mode is null;

update public.profiles
set arm_length_m_mode = 'auto'
where arm_length_m_mode is null;

update public.profiles
set leg_length_m_mode = 'auto'
where leg_length_m_mode is null;

update public.profiles
set torso_length_m_mode = 'auto'
where torso_length_m_mode is null;

update public.profiles
set total_calories = 0
where total_calories is null;

alter table if exists public.profiles
  alter column sex set default 'unknown',
  alter column step_length_m_mode set default 'auto',
  alter column arm_length_m_mode set default 'auto',
  alter column leg_length_m_mode set default 'auto',
  alter column torso_length_m_mode set default 'auto',
  alter column total_calories set default 0,
  alter column total_calories set not null;

-- Add constraints in an idempotent way and keep them NOT VALID first
-- to avoid breaking on legacy data before cleanup.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_sex_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_sex_check
      check (sex in ('unknown', 'male', 'female')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_step_length_mode_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_step_length_mode_check
      check (step_length_m_mode in ('auto', 'manual')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_arm_length_mode_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_arm_length_mode_check
      check (arm_length_m_mode in ('auto', 'manual')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_leg_length_mode_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_leg_length_mode_check
      check (leg_length_m_mode in ('auto', 'manual')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_torso_length_mode_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_torso_length_mode_check
      check (torso_length_m_mode in ('auto', 'manual')) not valid;
  end if;
end
$$;

-- 2) workout_runs extension (history = post + calories)
alter table if exists public.workout_runs
  add column if not exists calories numeric not null default 0,
  add column if not exists visibility text,
  add column if not exists published_at timestamptz,
  add column if not exists note text;

update public.workout_runs
set calories = 0
where calories is null;

update public.workout_runs
set visibility = 'private'
where visibility is null;

alter table if exists public.workout_runs
  alter column calories set default 0,
  alter column calories set not null,
  alter column visibility set default 'private',
  alter column visibility set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'workout_runs_visibility_check'
      and conrelid = 'public.workout_runs'::regclass
  ) then
    alter table public.workout_runs
      add constraint workout_runs_visibility_check
      check (visibility in ('private', 'followers', 'public')) not valid;
  end if;
end
$$;

-- 3) follows table
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  constraint follows_no_self_follow check (follower_id <> followee_id)
);

-- 4) weekly_plan / special_plan
create table if not exists public.weekly_plans (
  user_id uuid not null references public.profiles(id) on delete cascade,
  weekday integer not null,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, weekday),
  constraint weekly_plans_weekday_check check (weekday between 0 and 6)
);

create table if not exists public.special_plans (
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create or replace function public.set_updated_at_generic()
returns trigger
security definer
set search_path = public
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists weekly_plans_set_updated_at on public.weekly_plans;
create trigger weekly_plans_set_updated_at
before update on public.weekly_plans
for each row
execute procedure public.set_updated_at_generic();

drop trigger if exists special_plans_set_updated_at on public.special_plans;
create trigger special_plans_set_updated_at
before update on public.special_plans
for each row
execute procedure public.set_updated_at_generic();

-- 5) add_workout_result RPC (calories-aware, points-compatible)
drop function if exists public.add_workout_result(integer, jsonb);

create or replace function public.add_workout_result(
  p_points integer,
  p_result jsonb,
  p_calories numeric default 0
)
returns public.profiles
language plpgsql
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_points integer := coalesce(p_points, 0);
  v_calories numeric := coalesce(p_calories, 0);
begin
  insert into public.workout_runs (user_id, points, calories, result, visibility, published_at, note)
  values (
    auth.uid(),
    v_points,
    v_calories,
    p_result,
    coalesce(p_result->>'visibility', 'private'),
    case
      when (p_result->>'visibility') in ('public', 'followers') then coalesce((p_result->>'published_at')::timestamptz, now())
      else null
    end,
    nullif(p_result->>'note', '')
  );

  update public.profiles
  set points = coalesce(points, 0) + v_points,
      total_calories = coalesce(total_calories, 0) + v_calories,
      completed_runs = coalesce(completed_runs, 0) + 1,
      last_result = p_result,
      updated_at = now()
  where id = auth.uid()
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'Profile missing for current user. Ensure signup trigger has run.';
  end if;

  return v_profile;
end;
$$;

-- 6) RLS baseline templates
alter table if exists public.follows enable row level security;
alter table if exists public.weekly_plans enable row level security;
alter table if exists public.special_plans enable row level security;
alter table if exists public.workout_runs enable row level security;

-- follows
DROP POLICY IF EXISTS "Users can view own follows" ON public.follows;
CREATE POLICY "Users can view own follows"
ON public.follows
FOR SELECT
USING (auth.uid() = follower_id OR auth.uid() = followee_id);

DROP POLICY IF EXISTS "Users can insert own follows" ON public.follows;
CREATE POLICY "Users can insert own follows"
ON public.follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id AND auth.uid() <> followee_id);

DROP POLICY IF EXISTS "Users can delete own follows" ON public.follows;
CREATE POLICY "Users can delete own follows"
ON public.follows
FOR DELETE
USING (auth.uid() = follower_id);

-- weekly_plans
DROP POLICY IF EXISTS "Users can manage own weekly plans" ON public.weekly_plans;
CREATE POLICY "Users can manage own weekly plans"
ON public.weekly_plans
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- special_plans
DROP POLICY IF EXISTS "Users can manage own special plans" ON public.special_plans;
CREATE POLICY "Users can manage own special plans"
ON public.special_plans
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- workout_runs owner can perform all operations (read/write own only)
DROP POLICY IF EXISTS "Users can view their workout runs" ON public.workout_runs;
CREATE POLICY "Users can view their workout runs"
ON public.workout_runs
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their workout runs" ON public.workout_runs;
CREATE POLICY "Users can insert their workout runs"
ON public.workout_runs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their workout runs" ON public.workout_runs;
CREATE POLICY "Users can update their workout runs"
ON public.workout_runs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their workout runs" ON public.workout_runs;
CREATE POLICY "Users can delete their workout runs"
ON public.workout_runs
FOR DELETE
USING (auth.uid() = user_id);

commit;
