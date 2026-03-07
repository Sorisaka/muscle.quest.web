-- Ensure like-users RPC returns account visibility for account list UI.

begin;

create or replace function public.get_workout_run_like_users(
  p_run_id bigint,
  p_limit int default 100
)
returns table (
  liked_user_id uuid,
  display_name text,
  account_id text,
  account_visibility text,
  icon_border text,
  icon_background text,
  icon_center_object text,
  liked_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with viewer as (
    select auth.uid() as uid
  )
  select
    l.user_id as liked_user_id,
    coalesce(nullif(trim(p.display_name), ''), l.user_id::text) as display_name,
    l.user_id::text as account_id,
    coalesce(p.account_visibility, 'private') as account_visibility,
    p.icon_border,
    p.icon_background,
    p.icon_center_object,
    l.created_at as liked_at
  from viewer v
  join public.workout_run_likes l
    on l.run_id = p_run_id
  left join public.profiles p
    on p.id = l.user_id
  where v.uid is not null
    and public.can_view_workout_run(p_run_id, v.uid)
  order by l.created_at asc nulls last, l.user_id asc
  limit greatest(coalesce(p_limit, 100), 1);
$$;

revoke all on function public.get_workout_run_like_users(bigint, int) from public;
grant execute on function public.get_workout_run_like_users(bigint, int) to authenticated;

comment on function public.get_workout_run_like_users(bigint, int)
  is 'Returns like users for a run only when viewer can read that run, including account visibility.';

commit;
