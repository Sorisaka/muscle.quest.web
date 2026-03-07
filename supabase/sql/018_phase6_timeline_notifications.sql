-- 手動適用用SQL
-- Phase6: timeline likes split fetch + notifications feed

begin;

create or replace function public.get_timeline_like_summaries(
  p_run_ids bigint[]
)
returns table (
  run_id bigint,
  like_count bigint,
  liked boolean
)
language sql
security invoker
set search_path = public
as $$
  with input_ids as (
    select unnest(coalesce(p_run_ids, array[]::bigint[])) as run_id
  ),
  visible_runs as (
    select wr.id
    from public.workout_runs wr
    join input_ids i on i.run_id = wr.id
    where wr.visibility <> 'archived'
  )
  select
    vr.id as run_id,
    coalesce(lc.like_count, 0)::bigint as like_count,
    coalesce(ul.liked, false) as liked
  from visible_runs vr
  left join lateral (
    select count(*)::bigint as like_count
    from public.workout_run_likes l
    where l.run_id = vr.id
  ) lc on true
  left join lateral (
    select true as liked
    from public.workout_run_likes l2
    where l2.run_id = vr.id
      and l2.user_id = auth.uid()
    limit 1
  ) ul on true;
$$;

create or replace function public.get_notifications(
  p_limit int default 30,
  p_before timestamptz default null
)
returns table (
  notification_id text,
  notification_type text,
  created_at timestamptz,
  actor_id uuid,
  actor_display_name text,
  run_id bigint,
  message text
)
language sql
security definer
set search_path = public
as $$
  with incoming_follow_requests as (
    select
      ('follow_request:' || fr.requester_id::text || ':' || fr.target_id::text || ':' || coalesce(fr.updated_at, fr.created_at)::text) as notification_id,
      'follow_request'::text as notification_type,
      coalesce(fr.updated_at, fr.created_at) as created_at,
      fr.requester_id as actor_id,
      coalesce(rp.display_name, fr.requester_id::text) as actor_display_name,
      null::bigint as run_id,
      (coalesce(rp.display_name, fr.requester_id::text) || ' さんからフォローリクエストがあります。')::text as message
    from public.follow_requests fr
    left join public.profiles rp on rp.id = fr.requester_id
    where fr.target_id = auth.uid()
      and fr.status = 'pending'
  ),
  likes_on_my_posts as (
    select
      ('like:' || l.run_id::text || ':' || l.user_id::text || ':' || l.created_at::text) as notification_id,
      'like'::text as notification_type,
      l.created_at,
      l.user_id as actor_id,
      coalesce(lp.display_name, l.user_id::text) as actor_display_name,
      l.run_id,
      (coalesce(lp.display_name, l.user_id::text) || ' さんがあなたの投稿をいいねしました。')::text as message
    from public.workout_run_likes l
    join public.workout_runs wr on wr.id = l.run_id
    left join public.profiles lp on lp.id = l.user_id
    where wr.user_id = auth.uid()
      and l.user_id <> auth.uid()
      and wr.visibility <> 'archived'
  ),
  merged as (
    select * from incoming_follow_requests
    union all
    select * from likes_on_my_posts
  )
  select
    m.notification_id,
    m.notification_type,
    m.created_at,
    m.actor_id,
    m.actor_display_name,
    m.run_id,
    m.message
  from merged m
  where p_before is null or m.created_at < p_before
  order by m.created_at desc
  limit greatest(coalesce(p_limit, 30), 1);
$$;

grant execute on function public.get_timeline_like_summaries(bigint[]) to authenticated;
grant execute on function public.get_notifications(int, timestamptz) to authenticated;

commit;
