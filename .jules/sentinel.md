# Sentinel Journal

## 2026-02-05 - Decentralized Admin Authorization
**Vulnerability:** Admin authentication logic was duplicated across multiple API routes (`reports` and `subscriptions`), relying solely on an environment variable check without a centralized function.
**Learning:** Decentralized auth logic increases the risk of inconsistencies and makes it harder to audit or update security policies.
**Prevention:** Centralize all authorization logic (especially for admin roles) in a dedicated service or utility and reuse it across all protected endpoints.
