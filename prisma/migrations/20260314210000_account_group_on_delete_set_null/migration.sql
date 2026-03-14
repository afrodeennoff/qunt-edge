-- Ensure deleting a group detaches linked accounts instead of failing FK checks.
ALTER TABLE "public"."Account"
  DROP CONSTRAINT IF EXISTS "Account_groupId_fkey";

ALTER TABLE "public"."Account"
  ADD CONSTRAINT "Account_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
