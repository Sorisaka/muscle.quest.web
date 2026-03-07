-- Verification queries for Phase2 follow/request schema

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name in ('account_visibility', 'icon_border', 'icon_background', 'icon_center_object')
order by column_name;

select table_name, is_insertable_into
from information_schema.tables
where table_schema = 'public'
  and table_name in ('follows', 'follow_requests');

select conname, conrelid::regclass
from pg_constraint
where conrelid in ('public.follows'::regclass, 'public.follow_requests'::regclass)
order by conrelid::regclass::text, conname;

select policyname, tablename, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'follows', 'follow_requests')
order by tablename, policyname;

select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'can_access_profile',
    'follow_action',
    'get_follow_state',
    'get_follow_requests',
    'cancel_follow_request',
    'respond_follow_request'
  )
order by proname;
