-- body_metrics table / constraint / policy verification
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'body_metrics'
order by ordinal_position;

select conname, pg_get_constraintdef(c.oid) as definition
from pg_constraint c
join pg_class t on t.oid = c.conrelid
join pg_namespace n on n.oid = t.relnamespace
where n.nspname = 'public' and t.relname = 'body_metrics'
order by conname;

select policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public' and tablename = 'body_metrics'
order by policyname;
