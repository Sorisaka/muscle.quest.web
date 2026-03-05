-- Development sample seed for Phase0-3
-- Run manually in SQL editor for non-production testing.

insert into public.weekly_plans (user_id, weekday, items)
values
  (auth.uid(), 1, '[{"exerciseSlug":"squats","category":"bodyweight","target":{"sets":3}}]'::jsonb),
  (auth.uid(), 3, '[{"exerciseSlug":"push-ups","category":"bodyweight","target":{"sets":4}}]'::jsonb)
on conflict (user_id, weekday) do update set items = excluded.items, updated_at = now();

insert into public.special_plans (user_id, date, items)
values
  (auth.uid(), current_date, '[{"exerciseSlug":"plank","category":"bodyweight","target":{"seconds":180}}]'::jsonb)
on conflict (user_id, date) do update set items = excluded.items, updated_at = now();
