-- Purpose: Provide RPC to atomically record workout results and update profile points.
-- Run order: Execute after workout_runs table and policies are in place.
-- Notes: Uses auth.uid() to bind operations to the caller and returns the updated profile row.

create or replace function public.add_workout_result(p_points integer, p_result jsonb)
returns public.profiles
language plpgsql
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_points integer := coalesce(p_points, 0);
begin
  -- Record workout result for the caller
  insert into public.workout_runs (user_id, points, result)
  values (auth.uid(), v_points, p_result);

  -- Update profile aggregates
  update public.profiles
  set points = points + v_points,
      completed_runs = completed_runs + 1,
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
