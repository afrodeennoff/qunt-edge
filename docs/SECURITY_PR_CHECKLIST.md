# Security PR Checklist

Run this checklist before merging any security-sensitive change.

- [ ] Auth guard logic is active (no stub/no-op behavior for auth attempt tracking).
- [ ] New or modified mutation endpoints enforce authentication/authorization.
- [ ] New or modified mutation endpoints include route-level rate limiting.
- [ ] New or modified request handlers use schema-backed validation (`parseJson` / `parseQuery`).
- [ ] API responses do not expose raw internal exception details.
- [ ] `npm run check:route-security` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes.
