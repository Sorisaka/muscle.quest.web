begin;

create index if not exists idx_workout_runs_visibility_published_user
  on public.workout_runs (visibility, published_at desc, user_id);

create index if not exists idx_workout_runs_user_created
  on public.workout_runs (user_id, created_at desc);

create index if not exists idx_follows_follower_followee
  on public.follows (follower_id, followee_id);

create index if not exists idx_follows_followee_follower
  on public.follows (followee_id, follower_id);

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
  with scoped as (
    select p.id, p.display_name, p.account_visibility, p.icon_border, p.icon_background, p.icon_center_object
    from public.profiles p
    where auth.uid() is not null
      and (
        p.id = auth.uid()
        or coalesce(p.account_visibility, 'private') = 'public'
        or exists (
          select 1
          from public.follows f
          where f.follower_id = auth.uid()
            and f.followee_id = p.id
        )
      )
  )
  select
    s.id,
    s.display_name,
    coalesce(s.account_visibility, 'private') as account_visibility,
    s.icon_border,
    s.icon_background,
    s.icon_center_object
  from scoped s
  where coalesce(trim(p_query), '') = ''
    or s.id::text ilike '%' || replace(trim(p_query), '%', '') || '%'
    or coalesce(s.display_name, '') ilike '%' || replace(trim(p_query), '%', '') || '%'
  order by case when s.id = auth.uid() then 0 else 1 end, s.display_name nulls last, s.id
  limit greatest(coalesce(p_limit, 20), 1);
$$;

create or replace function public.get_following_accounts(p_user_id uuid default null)
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
  select
    p.id,
    p.display_name,
    coalesce(p.account_visibility, 'private') as account_visibility,
    p.icon_border,
    p.icon_background,
    p.icon_center_object
  from public.follows f
  join public.profiles p on p.id = f.followee_id
  where auth.uid() is not null
    and coalesce(p_user_id, auth.uid()) = auth.uid()
    and f.follower_id = coalesce(p_user_id, auth.uid())
  order by p.display_name nulls last, p.id;
$$;

create or replace function public.get_follower_accounts(p_user_id uuid default null)
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
  select
    p.id,
    p.display_name,
    coalesce(p.account_visibility, 'private') as account_visibility,
    p.icon_border,
    p.icon_background,
    p.icon_center_object
  from public.follows f
  join public.profiles p on p.id = f.follower_id
  where auth.uid() is not null
    and coalesce(p_user_id, auth.uid()) = auth.uid()
    and f.followee_id = coalesce(p_user_id, auth.uid())
  order by p.display_name nulls last, p.id;
$$;

create or replace function public.get_leaderboard(
  p_period text default 'overall',
  p_limit int default 50
)
returns table (
  user_id uuid,
  display_name text,
  account_visibility text,
  icon_border text,
  icon_background text,
  icon_center_object text,
  total_calories numeric,
  daily_calories numeric,
  weekly_calories numeric,
  monthly_calories numeric,
  is_self boolean
)
language sql
security definer
set search_path = public
as $$
  with visible_profiles as (
    select p.id, p.display_name, p.account_visibility, p.icon_border, p.icon_background, p.icon_center_object
    from public.profiles p
    where auth.uid() is not null
      and (
        p.id = auth.uid()
        or coalesce(p.account_visibility, 'private') = 'public'
        or exists (
          select 1
          from public.follows f
          where f.follower_id = auth.uid()
            and f.followee_id = p.id
        )
      )
  ),
  calories as (
    select
      wr.user_id,
      coalesce(sum(wr.calories), 0) as total_calories,
      coalesce(sum(wr.calories) filter (where coalesce(wr.published_at, wr.created_at) >= now() - interval '1 day'), 0) as daily_calories,
      coalesce(sum(wr.calories) filter (where coalesce(wr.published_at, wr.created_at) >= now() - interval '7 day'), 0) as weekly_calories,
      coalesce(sum(wr.calories) filter (where coalesce(wr.published_at, wr.created_at) >= now() - interval '30 day'), 0) as monthly_calories
    from public.workout_runs wr
    where wr.visibility <> 'archived'
    group by wr.user_id
  )
  select
    vp.id as user_id,
    vp.display_name,
    coalesce(vp.account_visibility, 'private') as account_visibility,
    vp.icon_border,
    vp.icon_background,
    vp.icon_center_object,
    coalesce(c.total_calories, 0) as total_calories,
    coalesce(c.daily_calories, 0) as daily_calories,
    coalesce(c.weekly_calories, 0) as weekly_calories,
    coalesce(c.monthly_calories, 0) as monthly_calories,
    (vp.id = auth.uid()) as is_self
  from visible_profiles vp
  left join calories c on c.user_id = vp.id
  order by
    case
      when coalesce(p_period, 'overall') = 'daily' then coalesce(c.daily_calories, 0)
      when coalesce(p_period, 'overall') = 'weekly' then coalesce(c.weekly_calories, 0)
      when coalesce(p_period, 'overall') = 'monthly' then coalesce(c.monthly_calories, 0)
      else coalesce(c.total_calories, 0)
    end desc,
    vp.id
  limit greatest(coalesce(p_limit, 50), 1);
$$;

commit;
