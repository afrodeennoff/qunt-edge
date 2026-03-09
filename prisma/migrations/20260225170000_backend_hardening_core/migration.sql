-- Create referral redemption table to make referral application atomic/idempotent.
CREATE TABLE IF NOT EXISTS "public"."ReferralRedemption" (
  "id" TEXT NOT NULL,
  "referralId" TEXT NOT NULL,
  "referredUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReferralRedemption_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReferralRedemption_referredUserId_key"
  ON "public"."ReferralRedemption"("referredUserId");

CREATE UNIQUE INDEX IF NOT EXISTS "ReferralRedemption_referralId_referredUserId_key"
  ON "public"."ReferralRedemption"("referralId", "referredUserId");

CREATE INDEX IF NOT EXISTS "ReferralRedemption_referralId_idx"
  ON "public"."ReferralRedemption"("referralId");

CREATE INDEX IF NOT EXISTS "ReferralRedemption_referredUserId_idx"
  ON "public"."ReferralRedemption"("referredUserId");

ALTER TABLE "public"."ReferralRedemption"
  ADD CONSTRAINT "ReferralRedemption_referralId_fkey"
  FOREIGN KEY ("referralId") REFERENCES "public"."Referral"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."ReferralRedemption"
  ADD CONSTRAINT "ReferralRedemption_referredUserId_fkey"
  FOREIGN KEY ("referredUserId") REFERENCES "public"."User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill from legacy array storage.
INSERT INTO "public"."ReferralRedemption" ("id", "referralId", "referredUserId", "createdAt")
SELECT
  concat('rr_', md5(random()::text || clock_timestamp()::text || referred_user_id)),
  r."id",
  referred_user_id,
  CURRENT_TIMESTAMP
FROM "public"."Referral" r,
LATERAL unnest(COALESCE(r."referredUserIds", ARRAY[]::text[])) AS referred_user_id
ON CONFLICT ("referredUserId") DO NOTHING;

ALTER TABLE "public"."Referral"
  DROP COLUMN IF EXISTS "referredUserIds";

-- Scope order uniqueness by user.
DROP INDEX IF EXISTS "public"."Order_orderId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Order_userId_orderId_key"
  ON "public"."Order"("userId", "orderId");
CREATE INDEX IF NOT EXISTS "Order_orderId_idx"
  ON "public"."Order"("orderId");

-- Snapshot table for benchmark endpoint.
CREATE TABLE IF NOT EXISTS "public"."TraderBenchmarkSnapshot" (
  "id" TEXT NOT NULL DEFAULT 'global',
  "riskReward" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "drawdown" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "winRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "avgReturn" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "sampleSize" INTEGER NOT NULL DEFAULT 0,
  "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TraderBenchmarkSnapshot_pkey" PRIMARY KEY ("id")
);
