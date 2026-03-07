-- Visibility v3
-- 1) profiles.account_visibility: private/public
-- 2) workout_runs.visibility: public/private/archived (followers -> private migration)

alter table public.profiles
  add column if not exists account_visibility text;

update public.profiles
set account_visibility = case
  when coalesce(account_visibility, default_visibility, 'private') = 'public' then 'public'
  else 'private'
end
where account_visibility is null;

alter table public.profiles
  alter column account_visibility set default 'private',
  alter column account_visibility set not null;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'profiles_default_visibility_check') then
    alter table public.profiles drop constraint profiles_default_visibility_check;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_account_visibility_check') then
    alter table public.profiles
      add constraint profiles_account_visibility_check
      check (account_visibility in ('private', 'public')) not valid;
  end if;
end $$;

alter table public.profiles validate constraint profiles_account_visibility_check;

update public.workout_runs
set visibility = 'private'
where visibility = 'followers';

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'workout_runs_visibility_check') then
    alter table public.workout_runs drop constraint workout_runs_visibility_check;
  end if;

  alter table public.workout_runs
    add constraint workout_runs_visibility_check
    check (visibility in ('public', 'private', 'archived')) not valid;
end $$;

alter table public.workout_runs validate constraint workout_runs_visibility_check;

create or replace function public.add_workout_result(
  p_points integer,
  p_result jsonb,
  p_calories numeric default 0,
  p_visibility text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_profile public.profiles%rowtype;
  v_account_visibility text;
  v_resolved_visibility text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_profile from public.profiles where id = v_uid for update;
  v_account_visibility := coalesce(v_profile.account_visibility, v_profile.default_visibility, 'private');

  if p_visibility is null then
    v_resolved_visibility := case when v_account_visibility = 'public' then 'public' else 'private' end;
  else
    v_resolved_visibility := p_visibility;
  end if;

  if v_resolved_visibility = 'followers' then
    v_resolved_visibility := 'private';
  end if;

  if v_resolved_visibility not in ('public', 'private', 'archived') then
    v_resolved_visibility := case when v_account_visibility = 'public' then 'public' else 'private' end;
  end if;

  insert into public.workout_runs (user_id, points, calories, result, visibility, published_at, note)
  values (
    v_uid,
    p_points,
    coalesce(p_calories, 0),
    p_result,
    v_resolved_visibility,
    case when v_resolved_visibility in ('public', 'private') then coalesce((p_result->>'published_at')::timestamptz, now()) else null end,
    nullif(p_result->>'note', '')
  );

  update public.profiles
  set
    points = coalesce(points, 0) + coalesce(p_points, 0),
    total_calories = coalesce(total_calories, 0) + coalesce(p_calories, 0),
    completed_runs = coalesce(completed_runs, 0) + 1,
    last_result = p_result,
    updated_at = timezone('utc', now())
  where id = v_uid
  returning * into v_profile;

  return v_profile;
end;
$$;
