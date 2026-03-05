-- Phase4: timeline + likes + RLS refinement
-- Idempotent migration for likes table, workout_runs visibility read rules, and timeline/like RPCs.

begin;

-- A) likes table
create table if not exists public.workout_run_likes (
  run_id bigint not null references public.workout_runs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (run_id, user_id)
);

create index if not exists workout_run_likes_run_id_idx
  on public.workout_run_likes (run_id);

create index if not exists workout_run_likes_user_id_idx
  on public.workout_run_likes (user_id);

-- B) workout_runs RLS update (owner + public + followers for private)
alter table if exists public.workout_runs enable row level security;

DROP POLICY IF EXISTS "Users can view their workout runs" ON public.workout_runs;
DROP POLICY IF EXISTS "Users can insert their workout runs" ON public.workout_runs;
DROP POLICY IF EXISTS "Users can update their workout runs" ON public.workout_runs;
DROP POLICY IF EXISTS "Users can delete their workout runs" ON public.workout_runs;

create policy "Users can view workout runs for timeline"
on public.workout_runs
for select
using (
  auth.uid() = user_id
  or (
    auth.uid() is not null
    and visibility = 'public'
  )
  or (
    visibility = 'private'
    and exists (
      select 1
      from public.follows f
      where f.follower_id = auth.uid()
        and f.followee_id = public.workout_runs.user_id
    )
  )
);

create policy "Users can insert their workout runs"
on public.workout_runs
for insert
with check (auth.uid() = user_id);

create policy "Users can update their workout runs"
on public.workout_runs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their workout runs"
on public.workout_runs
for delete
using (auth.uid() = user_id);

-- B-2) profiles read policy for timeline author display names
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

-- C) likes RLS
alter table if exists public.workout_run_likes enable row level security;

DROP POLICY IF EXISTS "Users can read likes on readable runs" ON public.workout_run_likes;
DROP POLICY IF EXISTS "Users can insert likes on readable runs" ON public.workout_run_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.workout_run_likes;

create policy "Users can read likes on readable runs"
on public.workout_run_likes
for select
using (
  exists (
    select 1
    from public.workout_runs wr
    where wr.id = public.workout_run_likes.run_id
      and (
        auth.uid() = wr.user_id
        or (auth.uid() is not null and wr.visibility = 'public')
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
);

create policy "Users can insert likes on readable runs"
on public.workout_run_likes
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workout_runs wr
    where wr.id = public.workout_run_likes.run_id
      and wr.visibility <> 'archived'
      and (
        auth.uid() = wr.user_id
        or (auth.uid() is not null and wr.visibility = 'public')
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
);

create policy "Users can delete own likes"
on public.workout_run_likes
for delete
using (auth.uid() = user_id);

-- D) Timeline RPC
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

-- E) Like toggle RPC
create or replace function public.toggle_like(
  p_run_id bigint
)
returns table (
  run_id bigint,
  liked boolean,
  like_count bigint
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid;
  v_liked boolean;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.workout_runs wr
    where wr.id = p_run_id
      and wr.visibility <> 'archived'
      and (
        wr.user_id = v_uid
        or wr.visibility = 'public'
        or (
          wr.visibility = 'private'
          and exists (
            select 1
            from public.follows f
            where f.follower_id = v_uid
              and f.followee_id = wr.user_id
          )
        )
      )
  ) then
    raise exception 'Run is not readable or not likeable';
  end if;

  if exists (
    select 1
    from public.workout_run_likes l
    where l.run_id = p_run_id
      and l.user_id = v_uid
  ) then
    delete from public.workout_run_likes l
    where l.run_id = p_run_id
      and l.user_id = v_uid;
    v_liked := false;
  else
    insert into public.workout_run_likes (run_id, user_id)
    values (p_run_id, v_uid)
    on conflict (run_id, user_id) do nothing;
    v_liked := true;
  end if;

  return query
  select
    p_run_id as run_id,
    v_liked as liked,
    count(*)::bigint as like_count
  from public.workout_run_likes l
  where l.run_id = p_run_id;
end;
$$;

commit;
