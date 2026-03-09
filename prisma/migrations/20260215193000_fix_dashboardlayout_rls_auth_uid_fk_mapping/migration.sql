
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'uid' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')
    ) THEN
        EXECUTE 'CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS ''SELECT ''''00000000-0000-0000-0000-000000000000''''::uuid;''';
    END IF;
END $$;

begin;

drop policy if exists authenticated_owner on public."DashboardLayout";

create policy authenticated_owner
on public."DashboardLayout"
for all
to authenticated
using (
  exists (
    select 1
    from public."User" u
    where u.auth_user_id = public."DashboardLayout"."userId"
      and u.auth_user_id = (select auth.uid())::text
  )
)
with check (
  exists (
    select 1
    from public."User" u
    where u.auth_user_id = public."DashboardLayout"."userId"
      and u.auth_user_id = (select auth.uid())::text
  )
);

commit;
