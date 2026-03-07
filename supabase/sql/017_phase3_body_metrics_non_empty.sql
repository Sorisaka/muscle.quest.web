begin;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'body_metrics_not_both_null'
      and conrelid = 'public.body_metrics'::regclass
  ) then
    alter table public.body_metrics
      add constraint body_metrics_not_both_null
      check (weight_kg is not null or body_fat_pct is not null) not valid;
  end if;
end $$;

commit;
