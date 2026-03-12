-- Restrict storage.list_objects RPC to service_role only.
-- This blocks anonymous/authenticated enumeration of storage object metadata.
REVOKE EXECUTE ON FUNCTION storage.list_objects(text, text, integer, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION storage.list_objects(text, text, integer, integer) TO service_role;
