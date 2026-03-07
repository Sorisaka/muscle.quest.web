-- Phase 5: follow search fix (apply-only delta)

create or replace function public.search_accounts(
  p_query text default '',
  p_limit int default 20
)
returns table (
  id uuid,
  display_name text,
  account_visibility text,
  icon_border text,
  icon_background text,
  icon_center_object text
)
language sql
security definer
set search_path = public
as $$
  with q as (
    select lower(trim(coalesce(p_query, ''))) as value
  ),
  scoped as (
    select
      p.id,
      p.display_name,
      coalesce(p.account_visibility, 'private') as account_visibility,
      p.icon_border,
      p.icon_background,
      p.icon_center_object,
      p.id::text as id_text,
      lower(coalesce(p.display_name, '')) as display_name_lower
    from public.profiles p
    where auth.uid() is not null
      and p.id <> auth.uid()
  ),
  matched as (
    select
      s.*,
      case
        when q.value = '' then 0
        when lower(s.id_text) = q.value then 0
        when s.display_name_lower = q.value then 1
        when lower(s.id_text) like q.value || '%' then 2
        when s.display_name_lower like q.value || '%' then 3
        when lower(s.id_text) like '%' || q.value || '%' then 4
        when s.display_name_lower like '%' || q.value || '%' then 5
        else 9
      end as rank
    from scoped s
    cross join q
    where q.value = ''
      or lower(s.id_text) like '%' || q.value || '%'
      or s.display_name_lower like '%' || q.value || '%'
  )
  select
    m.id,
    m.display_name,
    m.account_visibility,
    m.icon_border,
    m.icon_background,
    m.icon_center_object
  from matched m
  where m.rank < 9
  order by m.rank asc, m.display_name nulls last, m.id
  limit greatest(coalesce(p_limit, 20), 1);
$$;

grant execute on function public.search_accounts(text, int) to authenticated;
