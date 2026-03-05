-- Timeline scope alignment
-- global   : non-followed users' public posts only (exclude self)
-- following: self posts + followed users' public/private posts (archived excluded)

begin;

create or replace function public.get_timeline(
  p_scope text default 'following',
  p_limit int default 30,
  p_before timestamptz default null
)
returns table (
  run_id bigint,
  user_id uuid,
  author_display_name text,
  created_at timestamptz,
  published_at timestamptz,
  visibility text,
  calories numeric,
  note text,
  result jsonb,
  like_count bigint,
  liked boolean
)
language sql
security invoker
set search_path = public
as $$
  with visible_runs as (
    select
      wr.id,
      wr.user_id,
      wr.created_at,
      wr.published_at,
      wr.visibility,
      wr.calories,
      wr.note,
      wr.result,
      coalesce(wr.published_at, wr.created_at) as sort_at
    from public.workout_runs wr
    where (
      (
        p_scope = 'global'
        and wr.visibility = 'public'
        and wr.user_id <> auth.uid()
        and not exists (
          select 1
          from public.follows f
          where f.follower_id = auth.uid()
            and f.followee_id = wr.user_id
        )
      )
      or (
        coalesce(p_scope, 'following') <> 'global'
        and wr.visibility <> 'archived'
        and (
          wr.user_id = auth.uid()
          or (
            exists (
              select 1
              from public.follows f
              where f.follower_id = auth.uid()
                and f.followee_id = wr.user_id
            )
            and wr.visibility in ('public', 'private')
          )
        )
      )
    )
    and (p_before is null or coalesce(wr.published_at, wr.created_at) < p_before)
  )
  select
    vr.id as run_id,
    vr.user_id,
    p.display_name as author_display_name,
    vr.created_at,
    vr.published_at,
    vr.visibility,
    vr.calories,
    vr.note,
    vr.result,
    coalesce(lc.like_count, 0)::bigint as like_count,
    coalesce(ul.liked, false) as liked
  from visible_runs vr
  left join public.profiles p
    on p.id = vr.user_id
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
  ) ul on true
  order by vr.sort_at desc
  limit greatest(coalesce(p_limit, 30), 1);
$$;

create index if not exists idx_follows_follower_followee
  on public.follows (follower_id, followee_id);

create index if not exists idx_workout_runs_user_visibility_sort
  on public.workout_runs (user_id, visibility, published_at desc, created_at desc);

create index if not exists idx_workout_run_likes_run_id
  on public.workout_run_likes (run_id);

create index if not exists idx_workout_run_likes_run_user
  on public.workout_run_likes (run_id, user_id);

commit;

-- Verification queries (SQL Editor):
-- select set_config('request.jwt.claim.sub', '<viewer-uuid>', true);
--
-- select visibility, count(*)
-- from public.get_timeline('global', 200, null)
-- group by 1
-- order by 1;
--
-- select visibility, count(*)
-- from public.get_timeline('following', 200, null)
-- group by 1
-- order by 1;
--
-- Optional: ensure global contains no followed users.
-- with t as (
--   select user_id
--   from public.get_timeline('global', 200, null)
-- ), followed as (
--   select f.followee_id as user_id
--   from public.follows f
--   where f.follower_id = auth.uid()
-- )
-- select t.user_id
-- from t
-- join followed using (user_id)
-- limit 1;
