-- Purpose: Verify Phase4 bugfixes for author display name mapping and scope consistency.
-- Expected scope behavior:
--  following: self(all visibilities) + followees(public/private) + everyone(public)
--  global: public only

-- 1) Function/column shape sanity
select
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as args,
  pg_get_function_result(p.oid) as returns
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'get_timeline';

select
  c.column_name,
  c.data_type
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name = 'profiles'
  and c.column_name in ('id', 'display_name')
order by c.column_name;


-- Profile RLS policy required for timeline author names
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'profiles'
  and policyname = 'Users can view timeline-visible profiles';

-- 2) Author display name integrity (RPC row user_id must match profiles.display_name)
-- Requires authenticated context.
select
  t.run_id,
  t.user_id,
  t.author_display_name,
  p.display_name as profile_display_name,
  (t.author_display_name is not distinct from p.display_name) as author_name_matches_profile
from public.get_timeline('following', 100, null) t
left join public.profiles p on p.id = t.user_id
order by coalesce(t.published_at, t.created_at) desc
limit 50;

-- 3) Scope consistency checks for visibility
-- global must contain only public.
select
  count(*) as global_non_public_count
from public.get_timeline('global', 200, null) t
where t.visibility <> 'public';

-- following may include private/self and must include public rows according to access.
select
  t.visibility,
  count(*) as count_by_visibility
from public.get_timeline('following', 200, null) t
group by t.visibility
order by t.visibility;

-- 4) Relationship checks for A(viewer), B(followed), C(non-followed)
-- Replace placeholders with real UUIDs before running.
-- Expected:
--  - B private appears in following, NOT in global
--  - C public appears in both following/global
--  - author_display_name equals B/C profile name
with params as (
  select
    '00000000-0000-0000-0000-00000000000a'::uuid as viewer_a,
    '00000000-0000-0000-0000-00000000000b'::uuid as followed_b,
    '00000000-0000-0000-0000-00000000000c'::uuid as non_followed_c
)
select
  'replace UUID placeholders in params CTE, then run while authenticated as viewer_a' as note;
