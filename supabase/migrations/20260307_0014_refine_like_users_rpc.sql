-- Phase B follow-up: harden like-user RPC with shared visibility predicate
-- 既存RLS/可視性仕様と整合した可視判定関数を切り出し、いいねユーザー一覧RPCを再定義する。

begin;

-- =========================================================
-- A) 共通可視判定: can_view_workout_run
-- owner は archived を含めて閲覧可。
-- owner以外は archived を除外し、public / private(フォロー関係)に従う。
-- =========================================================
create or replace function public.can_view_workout_run(
  p_run_id bigint,
  p_viewer_id uuid default auth.uid()
)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.workout_runs wr
    where wr.id = p_run_id
      and (
        wr.user_id = p_viewer_id
        or (
          p_viewer_id is not null
          and wr.visibility <> 'archived'
          and (
            wr.visibility = 'public'
            or (
              wr.visibility = 'private'
              and exists (
                select 1
                from public.follows f
                where f.follower_id = p_viewer_id
                  and f.followee_id = wr.user_id
              )
            )
          )
        )
      )
  );
$$;

comment on function public.can_view_workout_run(bigint, uuid)
  is 'Returns true when the viewer can read the workout run under current visibility rules.';

-- =========================================================
-- B) いいねユーザー一覧RPC
-- 既存シグネチャ差異に備えて drop 後に再作成する。
-- =========================================================
drop function if exists public.get_workout_run_like_users(bigint);
drop function if exists public.get_workout_run_like_users(bigint, integer);

create or replace function public.get_workout_run_like_users(
  p_run_id bigint,
  p_limit int default 100
)
returns table (
  liked_user_id uuid,
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
  with viewer as (
    select auth.uid() as uid
  )
  select
    l.user_id as liked_user_id,
    coalesce(nullif(trim(p.display_name), ''), l.user_id::text) as display_name,
    l.user_id::text as account_id,
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
  is 'Returns like users for a run only when viewer can read that run. Empty set for unreadable runs.';

commit;

-- =========================================================
-- 確認クエリ (コメント)
-- =========================================================
-- select public.can_view_workout_run(<run_id>, auth.uid());
-- select * from public.get_workout_run_like_users(<run_id>, 100);
