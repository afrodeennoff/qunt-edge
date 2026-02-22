CREATE INDEX "Account_userId_number_idx" ON "public"."Account"("userId", "number");
CREATE INDEX "Synchronization_userId_accountId_idx" ON "public"."Synchronization"("userId", "accountId");
