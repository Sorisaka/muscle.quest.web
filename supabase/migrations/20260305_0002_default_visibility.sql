-- Phase3 visibility v2: account default visibility + optional override input

begin;

alter table if exists public.profiles
  add column if not exists default_visibility text;

update public.profiles
set default_visibility = 'private'
where default_visibility is null;

alter table if exists public.profiles
  alter column default_visibility set default 'private',
  alter column default_visibility set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_default_visibility_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_default_visibility_check
      check (default_visibility in ('private', 'followers', 'public')) not valid;
  end if;
end
$$;

-- RPC update: when p_visibility is null, fall back to profiles.default_visibility
-- Keep workout_runs.visibility as non-null and save resolved value.
drop function if exists public.add_workout_result(integer, jsonb, numeric);

create or replace function public.add_workout_result(
  p_points integer,
  p_result jsonb,
  p_calories numeric default 0,
  p_visibility text default null
)
returns public.profiles
language plpgsql
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_points integer := coalesce(p_points, 0);
  v_calories numeric := coalesce(p_calories, 0);
  v_default_visibility text;
  v_resolved_visibility text;
begin
  select default_visibility
    into v_default_visibility
  from public.profiles
  where id = auth.uid();

  v_default_visibility := coalesce(v_default_visibility, 'private');
  v_resolved_visibility := coalesce(p_visibility, v_default_visibility);

  if v_resolved_visibility not in ('private', 'followers', 'public') then
    v_resolved_visibility := 'private';
  end if;

  insert into public.workout_runs (user_id, points, calories, result, visibility, published_at, note)
  values (
    auth.uid(),
    v_points,
    v_calories,
    p_result,
    v_resolved_visibility,
    case
      when v_resolved_visibility in ('public', 'followers') then coalesce((p_result->>'published_at')::timestamptz, now())
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

commit;
