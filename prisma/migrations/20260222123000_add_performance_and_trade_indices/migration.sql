CREATE INDEX "Account_userId_isPerformance_createdAt_idx" ON "public"."Account"("userId", "isPerformance", "createdAt");
CREATE INDEX "Trade_userId_accountNumber_entryDate_pnl_idx" ON "public"."Trade"("userId", "accountNumber", "entryDate", "pnl");
