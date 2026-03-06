-- Phase6 fix: RPC add_workout_result を1本化し、calories を numeric に統一する
-- Safe to run repeatedly.

drop function if exists public.add_workout_result(integer, integer, text, jsonb, text, text[]);
drop function if exists public.add_workout_result(integer, jsonb, numeric, text);
drop function if exists public.add_workout_result(integer, jsonb);

create or replace function public.add_workout_result(
  p_points integer,
  p_calories numeric,
  p_visibility text,
  p_result jsonb,
  p_category text,
  p_muscles text[]
)
returns public.profiles
language plpgsql
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_points integer := coalesce(p_points, 0);
  v_calories numeric := coalesce(p_calories, 0);
  v_visibility text := coalesce(p_visibility, 'private');
  v_category text := coalesce(nullif(p_category, ''), 'unknown');
  v_muscles text[] := coalesce(p_muscles, '{}'::text[]);
  v_result jsonb := coalesce(p_result, '{}'::jsonb);
begin
  insert into public.workout_runs (user_id, points, calories, visibility, published_at, note, result, category, muscles)
  values (
    auth.uid(),
    v_points,
    v_calories,
    v_visibility,
    case when v_visibility = 'archived' then null else now() end,
    v_result->>'note',
    v_result,
    v_category,
    v_muscles
  );

  update public.profiles
  set points = coalesce(points, 0) + v_points,
      total_calories = coalesce(total_calories, 0) + v_calories,
      completed_runs = coalesce(completed_runs, 0) + 1,
      last_result = v_result,
      updated_at = now()
  where id = auth.uid()
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'Profile missing for current user. Ensure signup trigger has run.';
  end if;

  return v_profile;
end;
$$;
