-- Phase4: icon setting defaults/checks for profile UI editor

begin;

alter table if exists public.profiles
  add column if not exists icon_border text,
  add column if not exists icon_background text,
  add column if not exists icon_center_object text;

update public.profiles
set icon_border = coalesce(icon_border, 'ring-slate'),
    icon_background = coalesce(icon_background, 'bg-night'),
    icon_center_object = coalesce(icon_center_object, 'dot');

alter table if exists public.profiles
  alter column icon_border set default 'ring-slate',
  alter column icon_background set default 'bg-night',
  alter column icon_center_object set default 'dot';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_icon_border_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_icon_border_check
      check (icon_border in ('ring-slate', 'ring-emerald', 'ring-amber', 'ring-rose')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_icon_background_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_icon_background_check
      check (icon_background in ('bg-night', 'bg-ocean', 'bg-sunset', 'bg-forest')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_icon_center_object_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_icon_center_object_check
      check (icon_center_object in ('dot', 'diamond', 'barbell', 'bolt')) not valid;
  end if;
end $$;

commit;
