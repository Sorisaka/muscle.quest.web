-- Purpose: Enforce row level security for workout_runs and ensure minimal privilege access.
-- Run order: Execute after workout_runs table creation.
-- Notes: Allows authenticated users to read/insert only their own rows; updates/deletes remain disallowed.

alter table if exists public.workout_runs enable row level security;

-- Select own workout history
DROP POLICY IF EXISTS "Users can view their workout runs" ON public.workout_runs;
CREATE POLICY "Users can view their workout runs"
ON public.workout_runs
FOR SELECT
USING (auth.uid() = user_id);

-- Insert workout results for self only
DROP POLICY IF EXISTS "Users can insert their workout runs" ON public.workout_runs;
CREATE POLICY "Users can insert their workout runs"
ON public.workout_runs
FOR INSERT
WITH CHECK (auth.uid() = user_id);
