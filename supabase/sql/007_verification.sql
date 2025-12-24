-- Purpose: Helpers to inspect tables, policies, and triggers after migration.
-- Run order: Execute after all schema/policy/function scripts.
-- Notes: Safe read-only queries for validation in Supabase SQL editor.

-- Inspect profiles columns and sample data
select id, display_name, points, completed_runs, last_result, created_at, updated_at
from public.profiles
order by created_at desc
limit 25;

-- Inspect workout history
select id, user_id, points, created_at, result
from public.workout_runs
order by created_at desc
limit 25;

-- List RLS status
select n.nspname as schema, c.relname as table, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('profiles', 'workout_runs');

-- List policies for the two tables
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('profiles', 'workout_runs')
order by tablename, policyname;

-- Confirm signup trigger wiring
select tgname as trigger_name, tgrelid::regclass as table_name
from pg_trigger
where tgrelid = 'auth.users'::regclass and not tgisinternal;
