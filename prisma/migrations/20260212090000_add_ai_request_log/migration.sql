-- CreateTable
CREATE TABLE "public"."AiRequestLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "route" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "promptTokens" INTEGER,
  "completionTokens" INTEGER,
  "totalTokens" INTEGER,
  "latencyMs" INTEGER NOT NULL,
  "toolCallsCount" INTEGER NOT NULL DEFAULT 0,
  "finishReason" TEXT,
  "success" BOOLEAN NOT NULL,
  "errorCategory" TEXT,
  "errorCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiRequestLog_createdAt_idx" ON "public"."AiRequestLog"("createdAt");

-- CreateIndex
CREATE INDEX "AiRequestLog_feature_createdAt_idx" ON "public"."AiRequestLog"("feature", "createdAt");

-- CreateIndex
CREATE INDEX "AiRequestLog_userId_createdAt_idx" ON "public"."AiRequestLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."AiRequestLog"
  ADD CONSTRAINT "AiRequestLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
