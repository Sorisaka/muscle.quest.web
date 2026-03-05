-- Run order: after 008/009. Same content as migration 20260305_0005.

begin;

alter table if exists public.profiles enable row level security;

DROP POLICY IF EXISTS "Users can view timeline-visible profiles" ON public.profiles;
create policy "Users can view timeline-visible profiles"
on public.profiles
for select
using (
  auth.uid() = id
  or (
    auth.uid() is not null
    and exists (
      select 1
      from public.workout_runs wr
      where wr.user_id = public.profiles.id
        and wr.visibility = 'public'
    )
  )
  or exists (
    select 1
    from public.follows f
    where f.follower_id = auth.uid()
      and f.followee_id = public.profiles.id
  )
);

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
    where wr.visibility <> 'archived'
      and (
        (
          p_scope = 'global'
          and wr.visibility = 'public'
        )
        or (
          coalesce(p_scope, 'following') <> 'global'
          and (
            wr.user_id = auth.uid()
            or wr.visibility = 'public'
            or (
              wr.visibility = 'private'
              and exists (
                select 1
                from public.follows f
                where f.follower_id = auth.uid()
                  and f.followee_id = wr.user_id
              )
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

commit;
