-- Like users list RPC for account own-post modal

begin;

create or replace function public.get_workout_run_like_users(
  p_run_id bigint,
  p_limit int default 100
)
returns table (
  user_id uuid,
  display_name text,
  account_id text,
  icon_border text,
  icon_background text,
  icon_center_object text,
  liked_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with me as (
    select auth.uid() as uid
  ),
  readable_run as (
    select wr.id
    from public.workout_runs wr
    cross join me
    where me.uid is not null
      and wr.id = p_run_id
      and wr.visibility <> 'archived'
      and (
        wr.user_id = me.uid
        or wr.visibility = 'public'
        or (
          wr.visibility = 'private'
          and exists (
            select 1
            from public.follows f
            where f.follower_id = me.uid
              and f.followee_id = wr.user_id
          )
        )
      )
  )
  select
    l.user_id,
    coalesce(p.display_name, l.user_id::text) as display_name,
    l.user_id::text as account_id,
    p.icon_border,
    p.icon_background,
    p.icon_center_object,
    l.created_at as liked_at
  from readable_run rr
  join public.workout_run_likes l
    on l.run_id = rr.id
  left join public.profiles p
    on p.id = l.user_id
  order by l.created_at desc
  limit greatest(coalesce(p_limit, 100), 1);
$$;

grant execute on function public.get_workout_run_like_users(bigint, int) to authenticated;

commit;
