-- Profiles table synchronized with Supabase Auth users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  created_at timestamptz default now()
);

-- Automatically create a profile row on signup
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security should be enabled for profiles; add policies such as:
--   enable row level security on public.profiles;
--   create policy "Users can view their profile" on public.profiles for select using (auth.uid() = id);
--   create policy "Users can update their profile" on public.profiles for update using (auth.uid() = id);
