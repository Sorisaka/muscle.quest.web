-- Phase6: add_workout_result をタグ対応へ拡張（既存互換のため default 引数を付与）
create or replace function public.add_workout_result(
  p_points integer,
  p_calories integer default 0,
  p_visibility text default null,
  p_result jsonb default '{}'::jsonb,
  p_category text default 'unknown',
  p_muscles text[] default '{}'::text[]
)
returns public.profiles
language plpgsql
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_points integer := coalesce(p_points, 0);
  v_calories integer := coalesce(p_calories, 0);
  v_visibility text := coalesce(p_visibility, 'private');
  v_category text := coalesce(nullif(p_category, ''), 'unknown');
  v_muscles text[] := coalesce(p_muscles, '{}'::text[]);
begin
  insert into public.workout_runs (user_id, points, calories, visibility, published_at, note, result, category, muscles)
  values (
    auth.uid(),
    v_points,
    v_calories,
    v_visibility,
    case when v_visibility = 'archived' then null else now() end,
    p_result->>'note',
    p_result,
    v_category,
    v_muscles
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
