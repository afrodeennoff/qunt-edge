import os

file_path = 'prisma/migrations/20260215193000_fix_dashboardlayout_rls_auth_uid_fk_mapping/migration.sql'

with open(file_path, 'r') as f:
    content = f.read()

prefix = """
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
"""

with open(file_path, 'w') as f:
    f.write(prefix + "\n" + content)
