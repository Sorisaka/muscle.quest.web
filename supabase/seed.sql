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

insert into public.body_metrics (user_id, date, weight_kg, body_fat_pct, visibility)
values
  (auth.uid(), current_date - 6, 70.8, 19.2, 'private'),
  (auth.uid(), current_date - 5, 70.6, 19.0, 'private'),
  (auth.uid(), current_date - 4, 70.5, 18.9, 'private'),
  (auth.uid(), current_date - 3, 70.4, 18.8, 'private'),
  (auth.uid(), current_date - 2, 70.3, 18.7, 'private'),
  (auth.uid(), current_date - 1, 70.2, 18.6, 'private'),
  (auth.uid(), current_date, 70.1, 18.5, 'private')
on conflict (user_id, date) do update
set weight_kg = excluded.weight_kg,
    body_fat_pct = excluded.body_fat_pct,
    visibility = excluded.visibility,
    updated_at = now();
