-- Supabase Storage production scaling improvements:
-- 1) Add a listing RPC that can leverage indexes for prefix scans.
-- 2) Add indexes that improve common RLS and listing patterns.

create or replace function storage.list_objects(
  bucket_id text,
  prefix text default '',
  limits integer default 100,
  offsets integer default 0
)
returns table (
  id uuid,
  name text,
  bucket_id text,
  owner uuid,
  created_at timestamptz,
  updated_at timestamptz,
  last_accessed_at timestamptz,
  metadata jsonb
)
language sql
stable
security invoker
set search_path = storage, pg_temp
as $$
  select
    o.id,
    o.name,
    o.bucket_id,
    o.owner,
    o.created_at,
    o.updated_at,
    o.last_accessed_at,
    o.metadata
  from storage.objects as o
  where o.bucket_id = list_objects.bucket_id
    and o.name like list_objects.prefix || '%'
  order by o.name
  limit greatest(list_objects.limits, 1)
  offset greatest(list_objects.offsets, 0);
$$;

grant execute on function storage.list_objects(text, text, integer, integer) to anon, authenticated, service_role;

create index if not exists idx_storage_objects_name_prefix
  on storage.objects (name text_pattern_ops);

create index if not exists idx_storage_objects_bucketid_name_prefix
  on storage.objects (bucket_id, name text_pattern_ops);

create index if not exists idx_storage_objects_bucket_folder_name
  on storage.objects (bucket_id, ((storage.foldername(name))[1]), name);
