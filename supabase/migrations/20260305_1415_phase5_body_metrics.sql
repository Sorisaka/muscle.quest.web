-- Phase5: body metrics table (weight / body fat) with strict per-day upsert key.

create table if not exists public.body_metrics (
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  weight_kg numeric,
  body_fat_pct numeric,
  visibility text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date),
  constraint body_metrics_visibility_check check (visibility in ('private', 'followers', 'public')),
  constraint body_metrics_weight_kg_check check (weight_kg is null or (weight_kg > 0 and weight_kg < 500)),
  constraint body_metrics_body_fat_pct_check check (body_fat_pct is null or (body_fat_pct >= 0 and body_fat_pct <= 100))
);

create index if not exists idx_body_metrics_user_date_desc
  on public.body_metrics (user_id, date desc);

alter table public.body_metrics enable row level security;

drop policy if exists "body_metrics_select_own" on public.body_metrics;
create policy "body_metrics_select_own"
  on public.body_metrics
  for select
  using (auth.uid() = user_id);

drop policy if exists "body_metrics_insert_own" on public.body_metrics;
create policy "body_metrics_insert_own"
  on public.body_metrics
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "body_metrics_update_own" on public.body_metrics;
create policy "body_metrics_update_own"
  on public.body_metrics
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "body_metrics_delete_own" on public.body_metrics;
create policy "body_metrics_delete_own"
  on public.body_metrics
  for delete
  using (auth.uid() = user_id);

drop trigger if exists body_metrics_set_updated_at on public.body_metrics;
create trigger body_metrics_set_updated_at
before update on public.body_metrics
for each row execute procedure public.set_updated_at_generic();
