-- Phase2: follow / follow_requests + account visibility hardening
-- Idempotent SQL for manual execution in Supabase SQL Editor.

begin;

alter table if exists public.profiles
  add column if not exists account_visibility text,
  add column if not exists icon_border text,
  add column if not exists icon_background text,
  add column if not exists icon_center_object text;

update public.profiles
set account_visibility = coalesce(account_visibility, 'private')
where account_visibility is null;

alter table if exists public.profiles
  alter column account_visibility set default 'private',
  alter column account_visibility set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_account_visibility_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_account_visibility_check
      check (account_visibility in ('public', 'private')) not valid;
  end if;
end $$;

create table if not exists public.follow_requests (
  requester_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (requester_id, target_id),
  constraint follow_requests_status_check check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  constraint follow_requests_not_self check (requester_id <> target_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'follows_no_self_follow'
      and conrelid = 'public.follows'::regclass
  ) then
    alter table public.follows
      add constraint follows_no_self_follow
      check (follower_id <> followee_id);
  end if;
end $$;

create or replace function public.can_access_profile(p_target_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_visibility text;
  v_self uuid := auth.uid();
begin
  if p_target_id is null then
    return false;
  end if;

  if v_self is null then
    return false;
  end if;

  if v_self = p_target_id then
    return true;
  end if;

  select p.account_visibility into v_visibility
  from public.profiles p
  where p.id = p_target_id;

  if coalesce(v_visibility, 'private') = 'public' then
    return true;
  end if;

  return exists (
    select 1
    from public.follows f
    where f.follower_id = v_self
      and f.followee_id = p_target_id
  );
end;
$$;

create or replace function public.get_follow_state(p_target_id uuid)
returns table (
  target_id uuid,
  account_visibility text,
  is_following boolean,
  has_pending_request boolean,
  has_incoming_request boolean,
  request_status text
)
language sql
security definer
set search_path = public
as $$
  select
    p_target_id as target_id,
    coalesce(p.account_visibility, 'private') as account_visibility,
    exists (
      select 1 from public.follows f
      where f.follower_id = auth.uid()
        and f.followee_id = p_target_id
    ) as is_following,
    exists (
      select 1 from public.follow_requests fr
      where fr.requester_id = auth.uid()
        and fr.target_id = p_target_id
        and fr.status = 'pending'
    ) as has_pending_request,
    exists (
      select 1 from public.follow_requests fr
      where fr.requester_id = p_target_id
        and fr.target_id = auth.uid()
        and fr.status = 'pending'
    ) as has_incoming_request,
    (
      select fr.status
      from public.follow_requests fr
      where fr.requester_id = auth.uid()
        and fr.target_id = p_target_id
      limit 1
    ) as request_status
  from public.profiles p
  where p.id = p_target_id;
$$;

create or replace function public.follow_action(p_target_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_visibility text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_target_id is null or p_target_id = auth.uid() then
    raise exception 'self follow is not allowed';
  end if;

  select coalesce(account_visibility, 'private')
    into v_visibility
  from public.profiles
  where id = p_target_id;

  if v_visibility is null then
    raise exception 'target profile not found';
  end if;

  if exists (
    select 1 from public.follows f
    where f.follower_id = auth.uid() and f.followee_id = p_target_id
  ) then
    return 'already_following';
  end if;

  if v_visibility = 'public' then
    insert into public.follows(follower_id, followee_id)
    values (auth.uid(), p_target_id)
    on conflict do nothing;
    return 'followed';
  end if;

  insert into public.follow_requests(requester_id, target_id, status, created_at, updated_at)
  values (auth.uid(), p_target_id, 'pending', now(), now())
  on conflict (requester_id, target_id)
  do update set status = 'pending', updated_at = now();

  return 'requested';
end;
$$;

create or replace function public.cancel_follow_request(p_target_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.follow_requests
  set status = 'cancelled',
      updated_at = now()
  where requester_id = auth.uid()
    and target_id = p_target_id
    and status = 'pending';

  return found;
end;
$$;

create or replace function public.respond_follow_request(p_requester_id uuid, p_action text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text := lower(coalesce(p_action, 'reject'));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if v_action not in ('approve', 'reject') then
    raise exception 'unsupported action %', p_action;
  end if;

  if v_action = 'approve' then
    update public.follow_requests
    set status = 'accepted',
        updated_at = now()
    where requester_id = p_requester_id
      and target_id = auth.uid()
      and status = 'pending';

    if found then
      insert into public.follows(follower_id, followee_id)
      values (p_requester_id, auth.uid())
      on conflict do nothing;
      return true;
    end if;

    return false;
  end if;

  update public.follow_requests
  set status = 'rejected',
      updated_at = now()
  where requester_id = p_requester_id
    and target_id = auth.uid()
    and status = 'pending';

  return found;
end;
$$;

create or replace function public.get_follow_requests(p_direction text default 'incoming')
returns table (
  requester_id uuid,
  target_id uuid,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  requester_display_name text,
  requester_visibility text,
  requester_icon_border text,
  requester_icon_background text,
  requester_icon_center_object text,
  target_display_name text,
  target_visibility text,
  target_icon_border text,
  target_icon_background text,
  target_icon_center_object text
)
language sql
security definer
set search_path = public
as $$
  select
    fr.requester_id,
    fr.target_id,
    fr.status,
    fr.created_at,
    fr.updated_at,
    rp.display_name as requester_display_name,
    rp.account_visibility as requester_visibility,
    rp.icon_border as requester_icon_border,
    rp.icon_background as requester_icon_background,
    rp.icon_center_object as requester_icon_center_object,
    tp.display_name as target_display_name,
    tp.account_visibility as target_visibility,
    tp.icon_border as target_icon_border,
    tp.icon_background as target_icon_background,
    tp.icon_center_object as target_icon_center_object
  from public.follow_requests fr
  join public.profiles rp on rp.id = fr.requester_id
  join public.profiles tp on tp.id = fr.target_id
  where fr.status = 'pending'
    and (
      (coalesce(p_direction, 'incoming') = 'incoming' and fr.target_id = auth.uid())
      or (coalesce(p_direction, 'incoming') = 'outgoing' and fr.requester_id = auth.uid())
    )
  order by fr.updated_at desc;
$$;

alter table if exists public.profiles enable row level security;
alter table if exists public.follows enable row level security;
alter table if exists public.follow_requests enable row level security;

drop policy if exists "Users can view their profile" on public.profiles;
drop policy if exists "Users can view timeline-visible profiles" on public.profiles;
create policy "profiles_select_by_visibility_or_follow"
on public.profiles
for select
using (public.can_access_profile(id));

drop policy if exists "Users can insert their profile" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete their profile" on public.profiles;
create policy "profiles_delete_self"
on public.profiles
for delete
using (auth.uid() = id);

drop policy if exists "Users can view own follows" on public.follows;
create policy "follows_select_visible_accounts"
on public.follows
for select
using (
  auth.uid() = follower_id
  or auth.uid() = followee_id
  or public.can_access_profile(followee_id)
);

drop policy if exists "Users can insert own follows" on public.follows;
create policy "follows_insert_self"
on public.follows
for insert
with check (auth.uid() = follower_id and auth.uid() <> followee_id);

drop policy if exists "Users can delete own follows" on public.follows;
create policy "follows_delete_self"
on public.follows
for delete
using (auth.uid() = follower_id);

drop policy if exists "follow_requests_select_participants" on public.follow_requests;
create policy "follow_requests_select_participants"
on public.follow_requests
for select
using (auth.uid() = requester_id or auth.uid() = target_id);

drop policy if exists "follow_requests_insert_requester" on public.follow_requests;
create policy "follow_requests_insert_requester"
on public.follow_requests
for insert
with check (
  auth.uid() = requester_id
  and requester_id <> target_id
  and status = 'pending'
);

drop policy if exists "follow_requests_update_participants" on public.follow_requests;
create policy "follow_requests_update_participants"
on public.follow_requests
for update
using (
  (auth.uid() = requester_id and status = 'pending')
  or auth.uid() = target_id
)
with check (
  (auth.uid() = requester_id and status in ('cancelled', 'pending'))
  or (auth.uid() = target_id and status in ('accepted', 'rejected', 'pending'))
);

commit;
