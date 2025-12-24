-- Profiles table synchronized with Supabase Auth users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Ensure created_at / updated_at defaults and non-null constraints for existing installs
alter table if exists public.profiles alter column created_at set default now();
update public.profiles set created_at = now() where created_at is null;
alter table if exists public.profiles alter column created_at set not null;

alter table if exists public.profiles add column if not exists updated_at timestamptz default now();
update public.profiles set updated_at = now() where updated_at is null;
alter table if exists public.profiles alter column updated_at set default now();
alter table if exists public.profiles alter column updated_at set not null;

-- Automatically keep updated_at current on updates
create or replace function public.set_profiles_updated_at()
returns trigger
security definer
set search_path = public
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_profiles_updated_at();

-- Automatically create a profile row on signup
create or replace function public.handle_new_user_profile()
returns trigger
security definer
set search_path = public
language plpgsql as $$
declare
  fallback_name text;
begin
  fallback_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'user_name',
    new.email
  );

  insert into public.profiles (id, display_name)
  values (new.id, fallback_name)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();
