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


-- Phase6: workout_runs tags columns / index / function signature
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'workout_runs' and column_name in ('category', 'muscles')
order by column_name;

select indexname, indexdef
from pg_indexes
where schemaname = 'public' and tablename = 'workout_runs' and indexname in ('workout_runs_category_idx', 'workout_runs_muscles_gin')
order by indexname;

select proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public' and proname='add_workout_result'
order by args;
