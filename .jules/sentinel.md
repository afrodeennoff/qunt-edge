# Sentinel Journal

## 2025-02-18 - Centralized Admin Authorization
**Vulnerability:** Duplicated and decentralized admin authorization logic across API routes (`admin/reports`, `admin/subscriptions`). This increases the risk of inconsistent checks and makes it harder to update security policies (e.g., adding user ID checks).
**Learning:** Security logic should never be copy-pasted. Small variations in implementation can lead to bypasses in some routes while others remain secure.
**Prevention:** Always encapsulate authorization logic in a centralized helper function (`validateAdmin` in `lib/admin-auth.ts`) and reuse it across all protected endpoints.
