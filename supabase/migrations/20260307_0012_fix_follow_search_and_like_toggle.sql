-- Phase7: follow search / like toggle / notifications hardening
-- 018_phase6_timeline_notifications.sql と 019_notifications_table.sql の上に積む差分

begin;

-- =========================================================
-- A) search_accounts: exact UUID優先 + 表示名一致/前方/部分一致
-- =========================================================
create or replace function public.search_accounts(
  p_query text default '',
  p_limit int default 20
)
returns table (
  id uuid,
  display_name text,
  account_visibility text,
  icon_border text,
  icon_background text,
  icon_center_object text
)
language sql
security definer
set search_path = public
as $$
  with q as (
    select trim(coalesce(p_query, '')) as raw_query,
           lower(trim(coalesce(p_query, ''))) as query_lower
  ),
  parsed as (
    select
      q.raw_query,
      q.query_lower,
      case
        when q.raw_query ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
          then q.raw_query::uuid
        else null::uuid
      end as query_uuid
    from q
  ),
  scoped as (
    select
      p.id,
      nullif(trim(p.display_name), '') as display_name,
      coalesce(p.account_visibility, 'private') as account_visibility,
      p.icon_border,
      p.icon_background,
      p.icon_center_object,
      p.id::text as id_text,
      lower(coalesce(nullif(trim(p.display_name), ''), '')) as display_name_lower
    from public.profiles p
    where auth.uid() is not null
      and p.id <> auth.uid()
  ),
  ranked as (
    select
      s.*,
      case
        when p.raw_query = '' then 9
        when p.query_uuid is not null and s.id = p.query_uuid then 0
        when s.display_name_lower = p.query_lower then 1
        when s.id_text like p.query_lower || '%' then 2
        when s.display_name_lower like p.query_lower || '%' then 3
        when s.id_text like '%' || p.query_lower || '%' then 4
        when s.display_name_lower like '%' || p.query_lower || '%' then 5
        else 9
      end as rank
    from scoped s
    cross join parsed p
    where p.raw_query <> ''
      and (
        (p.query_uuid is not null and s.id = p.query_uuid)
        or s.id_text like '%' || p.query_lower || '%'
        or s.display_name_lower like '%' || p.query_lower || '%'
      )
  )
  select
    r.id,
    r.display_name,
    r.account_visibility,
    r.icon_border,
    r.icon_background,
    r.icon_center_object
  from ranked r
  where r.rank < 9
  order by r.rank asc, r.display_name nulls last, r.id
  limit greatest(coalesce(p_limit, 20), 1);
$$;

grant execute on function public.search_accounts(text, int) to authenticated;

-- =========================================================
-- B) workout_run_likes RLS: readable run + archived不可 + 自分のlikeのみ操作可
-- =========================================================
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

-- =========================================================
-- C) toggle_like: 引数名/返却shape固定 + readable条件明示
-- =========================================================
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

  if p_run_id is null then
    raise exception 'run_id is required';
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
    raise exception 'Run is not readable or archived';
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

grant execute on function public.toggle_like(bigint) to authenticated;

-- =========================================================
-- D) like通知トリガー再定義（idempotent）
-- =========================================================
create or replace function public.notify_like_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
begin
  select wr.user_id
    into v_owner_id
  from public.workout_runs wr
  where wr.id = new.run_id;

  if v_owner_id is null or v_owner_id = new.user_id then
    return new;
  end if;

  insert into public.notifications(user_id, actor_user_id, type, workout_run_id, meta)
  values (v_owner_id, new.user_id, 'like', new.run_id, '{}'::jsonb);

  return new;
end;
$$;

drop trigger if exists trg_notify_like_insert on public.workout_run_likes;
create trigger trg_notify_like_insert
after insert on public.workout_run_likes
for each row execute function public.notify_like_insert();

commit;

-- =========================================================
-- 確認クエリ
-- =========================================================
-- [search_accounts]
-- select proname, oidvectortypes(proargtypes) from pg_proc where proname = 'search_accounts';
-- select * from public.search_accounts('<UUID>', 20);
-- select * from public.search_accounts('display_name_keyword', 20);
-- authenticated ロールで実行し、未ログインでは結果が返らないことを確認する。
--
-- [toggle_like]
-- select proname, oidvectortypes(proargtypes) from pg_proc where proname = 'toggle_like';
-- select * from public.toggle_like(<run_id_bigint>);
--
-- [workout_run_likes policies]
-- select policyname, permissive, roles, cmd
-- from pg_policies
-- where schemaname='public' and tablename='workout_run_likes'
-- order by policyname;
--
-- [notifications trigger]
-- select tgname
-- from pg_trigger
-- where tgrelid = 'public.workout_run_likes'::regclass
--   and not tgisinternal;
--
-- [like通知確認例]
-- select count(*)
-- from public.notifications
-- where type = 'like'
--   and user_id = auth.uid();
