-- GestaltView schema dashboard snapshot
-- Exposes a live schema inventory RPC for the dashboard shell.

create or replace function public.get_schema_dashboard_snapshot()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  schema_rows jsonb := '[]'::jsonb;
  table_row record;
  row_count bigint := 0;
  column_count integer := 0;
  foreign_key_count integer := 0;
  index_count integer := 0;
  has_vector_index boolean := false;
  total_tables integer := 0;
  lit_tables integer := 0;
  vector_tables integer := 0;
  enum_types integer := 0;
begin
  select count(*)::int
    into enum_types
  from pg_type t
  join pg_namespace n on n.oid = t.typnamespace
  where t.typtype = 'e'
    and n.nspname not in ('pg_catalog', 'information_schema');

  for table_row in
    select t.table_name
    from information_schema.tables t
    where t.table_schema = 'public'
      and t.table_type = 'BASE TABLE'
    order by t.table_name
  loop
    execute format('select count(*) from public.%I', table_row.table_name) into row_count;

    select count(*)::int
      into column_count
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = table_row.table_name;

    select count(*)::int
      into foreign_key_count
    from information_schema.table_constraints tc
    where tc.table_schema = 'public'
      and tc.table_name = table_row.table_name
      and tc.constraint_type = 'FOREIGN KEY';

    select count(*)::int
      into index_count
    from pg_indexes i
    where i.schemaname = 'public'
      and i.tablename = table_row.table_name;

    select coalesce(bool_or(i.indexdef ilike '%vector%'), false)
      into has_vector_index
    from pg_indexes i
    where i.schemaname = 'public'
      and i.tablename = table_row.table_name;

    schema_rows := schema_rows || jsonb_build_array(
      jsonb_build_object(
        'table_name', table_row.table_name,
        'row_count', row_count,
        'column_count', column_count,
        'foreign_key_count', foreign_key_count,
        'index_count', index_count,
        'has_rows', row_count > 0,
        'has_vector_index', has_vector_index
      )
    );

    total_tables := total_tables + 1;
    if row_count > 0 then
      lit_tables := lit_tables + 1;
    end if;
    if has_vector_index then
      vector_tables := vector_tables + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'generated_at', now(),
    'summary', jsonb_build_object(
      'public_tables', total_tables,
      'lit_tables', lit_tables,
      'dark_tables', total_tables - lit_tables,
      'vector_tables', vector_tables,
      'enum_types', enum_types
    ),
    'tables', schema_rows
  );
end;
$$;
