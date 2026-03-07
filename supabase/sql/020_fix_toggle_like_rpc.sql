begin;

-- Ensure likes uniqueness for stable toggle behavior.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_run_likes_run_id_user_id_key'
      and conrelid = 'public.workout_run_likes'::regclass
  ) and not exists (
    select 1
    from pg_constraint
    where contype = 'p'
      and conrelid = 'public.workout_run_likes'::regclass
      and conkey = array[
        (select attnum from pg_attribute where attrelid = 'public.workout_run_likes'::regclass and attname = 'run_id'),
        (select attnum from pg_attribute where attrelid = 'public.workout_run_likes'::regclass and attname = 'user_id')
      ]
  ) then
    alter table public.workout_run_likes
      add constraint workout_run_likes_run_id_user_id_key unique (run_id, user_id);
  end if;
end
$$;

alter table if exists public.workout_run_likes enable row level security;

drop policy if exists "Users can read likes on readable runs" on public.workout_run_likes;
drop policy if exists "Users can insert likes on readable runs" on public.workout_run_likes;
drop policy if exists "Users can delete own likes" on public.workout_run_likes;

create policy "Users can read likes on readable runs"
on public.workout_run_likes
for select
using (
  exists (
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

-- Remove old overload/signatures, then recreate one canonical RPC.
drop function if exists public.toggle_like(bigint);

create function public.toggle_like(
  p_run_id bigint
)
returns table (
  liked boolean,
  like_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_owner_id uuid;
  v_has_like boolean;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_run_id is null then
    raise exception 'run_id is required';
  end if;

  select wr.user_id
    into v_owner_id
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
  limit 1;

  if v_owner_id is null then
    raise exception 'Run is not readable or archived';
  end if;

  select exists (
    select 1
    from public.workout_run_likes l
    where l.run_id = p_run_id
      and l.user_id = v_uid
  )
  into v_has_like;

  if v_has_like then
    delete from public.workout_run_likes l
    where l.run_id = p_run_id
      and l.user_id = v_uid;
  else
    insert into public.workout_run_likes (run_id, user_id)
    values (p_run_id, v_uid)
    on conflict (run_id, user_id) do nothing;

    if v_owner_id <> v_uid then
      insert into public.notifications(user_id, actor_user_id, type, workout_run_id, meta)
      values (v_owner_id, v_uid, 'like', p_run_id, '{}'::jsonb);
    end if;
  end if;

  return query
  select
    not v_has_like as liked,
    count(*)::bigint as like_count
  from public.workout_run_likes l
  where l.run_id = p_run_id;
end;
$$;

grant execute on function public.toggle_like(bigint) to authenticated;

-- Disable trigger-based like notifications to avoid duplicate inserts.
drop trigger if exists trg_notify_like_insert on public.workout_run_likes;
drop function if exists public.notify_like_insert();

commit;
