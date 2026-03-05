-- Purpose: Verify Phase4 timeline/likes schema, policies, and RPCs.
-- Run order: Execute after 008_phase4_timeline_likes.sql (or migration 20260305_0004).

-- Verify likes table/index existence
select
  to_regclass('public.workout_run_likes') as likes_table,
  to_regclass('public.workout_run_likes_run_id_idx') as likes_run_idx,
  to_regclass('public.workout_run_likes_user_id_idx') as likes_user_idx;

-- Verify target functions exist
select
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as args,
  pg_get_function_result(p.oid) as returns
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('get_timeline', 'toggle_like')
order by p.proname;

-- Verify RLS enabled on timeline-related tables
select n.nspname as schema, c.relname as table, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('workout_runs', 'workout_run_likes');

-- Verify policies for workout_runs + likes
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('workout_runs', 'workout_run_likes')
order by tablename, policyname;

-- Quick sample for timeline payload shape (requires auth context)
select *
from public.get_timeline('following', 5, null)
limit 5;
