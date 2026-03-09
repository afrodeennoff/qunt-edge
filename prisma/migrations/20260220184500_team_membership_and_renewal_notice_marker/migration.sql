-- Add marker to prevent duplicate renewal notice sends per billing cycle.
ALTER TABLE "public"."Account"
ADD COLUMN IF NOT EXISTS "renewalNoticeLastSentAt" TIMESTAMP(3);

-- Backfill team memberships from legacy traderIds and team owner.
-- Wrapped in DO block with EXECUTE to ensure the relation exists before attempting to parse or insert.
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'TeamMember') THEN
        EXECUTE '
        INSERT INTO "public"."TeamMember" ("id", "teamId", "userId", "role", "joinedAt", "isActive", "accountIds", "settings")
        SELECT
          (''tm_'' || md5(random()::text || clock_timestamp()::text || t."id" || member_ids."userId"))::text AS "id",
          t."id" AS "teamId",
          member_ids."userId" AS "userId",
          CASE WHEN member_ids."userId" = t."userId" THEN ''ADMIN''::"public"."MemberRole" ELSE ''TRADER''::"public"."MemberRole" END AS "role",
          NOW() AS "joinedAt",
          TRUE AS "isActive",
          ARRAY[]::text[] AS "accountIds",
          ''{}''::jsonb AS "settings"
        FROM "public"."Team" t
        JOIN LATERAL (
          SELECT unnest(
            ARRAY(
              SELECT DISTINCT x
              FROM unnest(array_append(t."traderIds", t."userId")) AS x
              WHERE x IS NOT NULL
            )
          ) AS "userId"
        ) AS member_ids ON TRUE
        LEFT JOIN "public"."TeamMember" tm
          ON tm."teamId" = t."id" AND tm."userId" = member_ids."userId"
        WHERE tm."id" IS NULL;
        ';
    END IF;
END $$;
