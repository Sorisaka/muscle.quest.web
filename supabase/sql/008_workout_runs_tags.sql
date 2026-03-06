-- Phase6: workout_runs に部位/種類タグを追加
alter table if exists public.workout_runs
  add column if not exists category text not null default 'unknown',
  add column if not exists muscles text[] not null default '{}'::text[];

create index if not exists workout_runs_category_idx on public.workout_runs(category);
create index if not exists workout_runs_muscles_gin on public.workout_runs using gin(muscles);

update public.workout_runs
set category = coalesce(nullif(result->>'category', ''), category, 'unknown'),
    muscles = coalesce(
      (
        select array_agg(value)
        from jsonb_array_elements_text(
          case
            when jsonb_typeof(result->'muscles') = 'array' then result->'muscles'
            else '[]'::jsonb
          end
        ) as e(value)
      ),
      muscles,
      '{}'::text[]
    )
where result is not null;
