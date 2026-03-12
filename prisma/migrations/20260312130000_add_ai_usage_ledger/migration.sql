-- CreateTable
CREATE TABLE "public"."AiUsageLedger" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "totalTokens" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiUsageLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiUsageLedger_createdAt_idx" ON "public"."AiUsageLedger"("createdAt");

-- CreateIndex
CREATE INDEX "AiUsageLedger_feature_createdAt_idx" ON "public"."AiUsageLedger"("feature", "createdAt");

-- CreateIndex
CREATE INDEX "AiUsageLedger_userId_createdAt_idx" ON "public"."AiUsageLedger"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."AiUsageLedger"
  ADD CONSTRAINT "AiUsageLedger_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
