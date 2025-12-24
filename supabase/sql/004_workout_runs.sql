-- Purpose: Create workout_runs table to store per-run workout history.
-- Run order: Execute after profile extensions so foreign keys and metadata are ready.
-- Notes: Stores per-session JSON result payload and awarded points.

create table if not exists public.workout_runs (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  result jsonb not null,
  points integer not null
);
