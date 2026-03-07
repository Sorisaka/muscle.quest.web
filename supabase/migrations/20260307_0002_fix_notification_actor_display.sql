begin;

-- Rebuild notification fetch RPC so actor label never falls back to UUID.
drop function if exists public.get_notifications(int, timestamptz);

create function public.get_notifications(
  p_limit int default 30,
  p_before timestamptz default null
)
returns table (
  notification_id bigint,
  notification_type text,
  created_at timestamptz,
  read_at timestamptz,
  actor_id uuid,
  actor_display_name text,
  actor_username text,
  run_id bigint,
  workout_created_at timestamptz,
  workout_exercise_slug text,
  has_pending_request boolean,
  is_following_actor boolean,
  message text
)
language sql
security definer
set search_path = public
as $$
  with scoped as (
    select
      n.id,
      n.type,
      n.created_at,
      n.read_at,
      n.actor_user_id,
      n.workout_run_id,
      p.display_name,
      nullif(trim(to_jsonb(p)->>'username'), '') as actor_username,
      coalesce(wr.published_at, wr.created_at) as workout_created_at,
      coalesce(wr.result->>'exerciseSlug', wr.result->>'exercise_slug', wr.result->>'questId', wr.result->>'quest_id') as workout_exercise_slug
    from public.notifications n
    left join public.profiles p on p.id = n.actor_user_id
    left join public.workout_runs wr on wr.id = n.workout_run_id
    where n.user_id = auth.uid()
      and (p_before is null or n.created_at < p_before)
  )
  select
    s.id as notification_id,
    s.type as notification_type,
    s.created_at,
    s.read_at,
    s.actor_user_id as actor_id,
    coalesce(nullif(trim(s.display_name), ''), s.actor_username, 'ユーザー') as actor_display_name,
    s.actor_username,
    s.workout_run_id as run_id,
    s.workout_created_at,
    s.workout_exercise_slug,
    exists (
      select 1
      from public.follow_requests fr
      where fr.requester_id = s.actor_user_id
        and fr.target_id = auth.uid()
        and fr.status = 'pending'
    ) as has_pending_request,
    exists (
      select 1
      from public.follows f
      where f.follower_id = auth.uid()
        and f.followee_id = s.actor_user_id
    ) as is_following_actor,
    case s.type
      when 'like' then coalesce(nullif(trim(s.display_name), ''), s.actor_username, 'ユーザー') || ' さんがあなたの投稿にいいねしました。'
      when 'follow' then coalesce(nullif(trim(s.display_name), ''), s.actor_username, 'ユーザー') || ' さんがあなたをフォローしました。'
      when 'follow_request' then coalesce(nullif(trim(s.display_name), ''), s.actor_username, 'ユーザー') || ' さんからフォローリクエストがあります。'
      else '通知'
    end as message
  from scoped s
  order by s.created_at desc
  limit greatest(coalesce(p_limit, 30), 1);
$$;

grant execute on function public.get_notifications(int, timestamptz) to authenticated;

commit;
