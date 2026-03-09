-- Authentication security remediation:
-- - OAuth one-time state store
-- - Brute-force attempt tracking
-- - MFA recovery codes
-- - Encrypted token envelope fields for Synchronization

ALTER TABLE public."Synchronization"
  ADD COLUMN IF NOT EXISTS "tokenCiphertext" TEXT,
  ADD COLUMN IF NOT EXISTS "tokenIv" TEXT,
  ADD COLUMN IF NOT EXISTS "tokenTag" TEXT,
  ADD COLUMN IF NOT EXISTS "tokenKeyVersion" TEXT;

CREATE TABLE IF NOT EXISTS public."OAuthState" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "stateHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "usedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "OAuthState_userId_provider_idx"
  ON public."OAuthState" ("userId", "provider");
CREATE INDEX IF NOT EXISTS "OAuthState_expiresAt_idx"
  ON public."OAuthState" ("expiresAt");

ALTER TABLE public."OAuthState"
  ADD CONSTRAINT "OAuthState_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES public."User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS public."AuthAttempt" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "emailHash" TEXT NOT NULL,
  "ipPrefix" TEXT NOT NULL,
  "actionType" TEXT NOT NULL,
  "failCount" INTEGER NOT NULL DEFAULT 0,
  "firstFailureAt" TIMESTAMPTZ,
  "lastFailureAt" TIMESTAMPTZ,
  "lockedUntil" TIMESTAMPTZ,
  "lastSuccessAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("emailHash", "ipPrefix", "actionType")
);

CREATE INDEX IF NOT EXISTS "AuthAttempt_lockedUntil_idx"
  ON public."AuthAttempt" ("lockedUntil");
CREATE INDEX IF NOT EXISTS "AuthAttempt_emailHash_idx"
  ON public."AuthAttempt" ("emailHash");

ALTER TABLE public."AuthAttempt"
  ADD CONSTRAINT "AuthAttempt_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES public."User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS public."RecoveryCode" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "usedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "codeHash")
);

CREATE INDEX IF NOT EXISTS "RecoveryCode_userId_idx"
  ON public."RecoveryCode" ("userId");

ALTER TABLE public."RecoveryCode"
  ADD CONSTRAINT "RecoveryCode_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES public."User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
