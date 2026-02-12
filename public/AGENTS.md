# AGENTS.md

> Last updated: 2026-02-12 (dashboard navbar visibility + render-safety + widget modernization + widget deprecation cleanup)

## Purpose
This document provides operating instructions for engineering agents working on Qunt Edge.
Apply these rules when implementing, reviewing, or shipping changes in this repository.

## Long-Horizon Reentry Protocol (100-Day Return)
Use this protocol when a returning user asks:
- "read AGENTS.md and explain this project"
- "what does this repo do"
- "give me the full architecture/context"

Goal:
- Any strong model can explain the codebase accurately from docs in one chat session.

### Required Explanation Order
1. Project summary in plain language
2. Product surfaces (home, auth, dashboard, teams, admin, APIs)
3. Route-to-code map (`page.tsx` and `layout.tsx` ownership)
4. Dashboard deep dive (sidebar + header actions + tabs + widget runtime)
5. Import flow (trigger -> mapping -> processor -> validation -> persistence)
6. Payments/subscription/webhook flow
7. Safety-critical constraints and regression risks
8. Recent changes and why they matter
9. "If you want to change X, edit these files"

### Mandatory Files To Read Before Explaining
- `docs/PROJECT_MANUAL_INDEX.md` (read first)
- `docs/COMPONENT_CODE_MAP.md`
- `docs/CHANGE_CATALOG_MANUAL.md`
- `COMBINED_DOCUMENTATION.md` (reference only)
- `public/AGENTS.md`

### Explanation Quality Rules
- Use exact file IDs when describing behavior.
- For each major component explain:
  - what it does
  - why it exists
  - where it lives
  - when to edit it
- Avoid generic-only architecture answers.
- Prefer concrete examples such as:
  - `app/[locale]/dashboard/components/import/import-button.tsx`
  - `app/[locale]/dashboard/components/dashboard-header.tsx`
  - `app/[locale]/dashboard/components/widget-canvas.tsx`

### Required Output Template (When User Asks For Full Project Explanation)
1. `What This Product Does`
2. `How The App Is Structured`
3. `End-to-End User Flow -> Code Map`
4. `Dashboard Component Responsibilities`
5. `Import/Billing/Auth Critical Flows`
6. `Recent Changes and Why They Matter`
7. `If You Want To Change X, Edit These Files`

### If Docs And Reality Diverge
- Re-check `docs/CHANGE_CATALOG_MANUAL.md` and current `git log`.
- Explicitly label what is confirmed vs inferred.
- Do not claim runtime verification unless runtime checks were actually run.

## Latest Directive
- Keep Trading Score and Risk Metrics calculations strictly separated.
- Trading Score (`/100`) must be derived via `deriveScoreMetricsFromTrades(...)` in `lib/score-calculator.ts`.
- Any score derivation from trades must use net outcome per trade: `pnl - commission`.
- Do not implement local score math in UI components when shared helper exists.

## Agent Intro
Welcome to Qunt Edge. This repository is correctness-first and operations-sensitive.
When trade, billing, auth, and import behaviors conflict with presentation concerns, prioritize correctness and safety.

## Maintenance Notes
- Canonical instructions for this repository live in `public/AGENTS.md`.
- If a request references a control document (for example `AI_MASTER_PROMPT.md`) and it is missing, search the repo and report the exact missing path before claiming issue completion.
- For "fix all critical issues" requests, map each critical item/phase to concrete files and validation evidence.

For fast onboarding, read in this order:
1. Product Context
2. Safety-Critical Areas
3. Change Workflow
4. Validation Commands
5. Documentation Roadmap

## Product Context
- Qunt Edge is a trading analytics platform for futures and prop-firm workflows.
- Core domains: trade ingestion, analytics dashboards, journaling, AI analysis, teams, and billing.
- Primary risk areas: financial data correctness, import integrity, auth/security boundaries, and payment webhook handling.

## App Explanation (Engineering View)
- Runtime model: Next.js App Router with mixed server/client components and API routes in `app/api`.
- Data flow: broker/file ingestion -> normalization/storage -> dashboard/query surfaces -> journaling/review -> AI-assisted analysis.
- Core UX surfaces:
  - Dashboard (`app/[locale]/dashboard`): widgets, charts, summaries, and performance exploration.
  - Data/import flows: broker sync and file import pipelines with mapping/validation.
  - Teams/admin/billing areas: access control, account/org settings, and payment lifecycle handling.
- Integration points: Supabase (auth/storage), Prisma/Postgres (data), OpenAI (analysis helpers), Whop (payments/webhooks).
- Localization: i18n via locale files and localized routes.

## Tech Stack
- Framework: Next.js App Router (`app/`)
- Language: TypeScript (strict)
- UI: React 19, Tailwind, Radix
- Data: Prisma + PostgreSQL (Supabase)
- Auth/Storage: Supabase
- AI: OpenAI integrations
- Payments: Whop webhooks and plan configs
- Testing: Vitest

## Repo Map
- `app/`: routes, layouts, API handlers
- `components/`: UI and feature components
- `server/`: server-side business logic and services
- `lib/`: utilities and shared helpers
- `store/`: Zustand stores
- `prisma/`: schema and db utilities
- `scripts/`: build/sync/ops scripts

## Operating Principles
- Prefer minimal, targeted changes over broad refactors.
- Preserve existing architecture and naming conventions.
- Keep business logic out of client components when possible.
- Do not silently change behavior in trading math, imports, or billing flows.
- If assumptions are required, document them in PR/commit notes.
- Always revalidate `user-data-${userId}` tag in server actions that modify accounts, trades, or sync tokens to ensure instant dashboard updates.
- Keep shared/public routes locale-safe: generate links as `/${locale}/shared/${slug}` rather than unprefixed `/shared/${slug}`.

## Enterprise Hardening Directive (2026-02-12)
When asked for production readiness or full hardening, treat it as a cross-stack reliability program, not a cosmetic cleanup.

Required outcomes:
- Remove duplicate and unused code in touched domains.
- Keep financial math decimal-safe and deterministic.
- Enforce UTC storage and timezone conversion only at presentation boundaries.
- Preserve tenant isolation and strict auth/authz checks on every data path.
- Keep imports idempotent with clear validation and reconciliation behavior.
- Version analytics formula definitions and reuse one shared implementation.
- Add structured logs, health/readiness checks, and actionable failure signals.
- Keep CI gates strict for build, typecheck, tests, migration checks, and security scans.
- Update runbooks and deployment/rollback docs in the same change set.

Execution constraints:
- Preserve business behavior unless clearly incorrect.
- Prefer backward-compatible bridges over silent breaking changes.
- Ship incremental, reviewable commits with rollback guidance for risky changes.
- Validate critical claims with tests or measurable runtime evidence.

Definition of done for hardening requests:
- `npm run typecheck`, `npm run test`, and `npm run build` pass.
- `npm run lint` has no new errors (warnings may remain unless scope includes lint cleanup).
- Critical flows remain reliable: import -> analytics -> dashboard/report, auth boundaries, and billing/webhooks.
- Touched documentation is updated (env, migrations, rollback, runbook, post-deploy checks).
- For trader profile identity UI, use `supabaseUser?.user_metadata?.avatar_url` with a deterministic fallback (initials) instead of assuming a guaranteed image URL.

## Verification and Reporting Rules
- Do not state or imply "fixed", "confirmed", or "works" unless the relevant path was actually validated.
- Always label confidence explicitly:
  - `Code-fixed (not runtime-tested)` when only static analysis/lint/type checks were run.
  - `Runtime-verified` only after executing and observing the affected flow.
- For repeated "recheck" requests in the same thread, rerun `git status`/targeted checks before replying; do not rely on prior output.
- If the user asks "are you sure?" and runtime validation was not performed, answer transparently and offer to run verification.
- For redirects/auth/session issues, require end-to-end verification of the exact user path before claiming final resolution.
- Never answer a binary confirmation (for example, "yes") for behavior questions unless that behavior was verified in runtime for the same scenario the user described.
- If evidence is partial, respond with the exact status and missing check (for example: `Code-fixed (not runtime-tested): login redirect still needs browser verification`).
- For thread recap requests (for example: "reread this thread"), verify against both:
  1. Current code state in the workspace.
  2. The exact user-requested outcomes from the conversation.
- For binary user prompts (`yes/no`), return `no` unless all required items are verifiably present.

### Required Status Template
Use one of these exact prefixes in final status updates:
- `Status: Code-fixed (not runtime-tested)`
- `Status: Runtime-verified`

When using `Status: Code-fixed (not runtime-tested)`, include all of:
- what was changed,
- what was validated (lint/type/tests),
- what remains unverified (exact runtime path).

## Safety-Critical Areas

### Trading and Analytics
- Treat PnL, fees, size, and time normalization as correctness-critical.
- Avoid rounding changes unless explicitly requested and validated.
- Keep timezone handling explicit and consistent.
- Use a single source of truth for Trading Score inputs:
  - `lib/score-calculator.ts` -> `deriveScoreMetricsFromTrades(...)`
  - This helper must be used when deriving `winRate`, `profitFactor`, and `totalTrades` from trade rows.
- Trading Score derivation must use net trade outcome (`pnl - commission`) for consistency with analytics risk metrics.
- Do not duplicate ad-hoc Trading Score math inside widgets or modals; import shared helpers instead.

### Trader Profile Benchmark Rules
- The `Compare with: average user` panel must use live benchmark data, not fixed constants.
- Benchmark values for trader profile comparisons must be computed as averages across users with trades:
  - `riskReward`
  - `drawdown`
  - `winRate`
  - `avgReturn`
- Keep benchmark computation server-side and authenticated; do not expose privileged access patterns in client code.
- Keep user-vs-benchmark formulas aligned between API and UI normalization so comparisons remain apples-to-apples.

#### Dashboard Metric Ownership
- Trading Score widget display logic: `app/[locale]/dashboard/components/widgets/trading-score-widget.tsx`
- Trading Score formula and derivation helpers: `lib/score-calculator.ts`
- Risk Metrics widget display logic: `app/[locale]/dashboard/components/widgets/risk-metrics-widget.tsx`
- Advanced risk metric calculations (Expectancy/Kelly/Sharpe/Sortino/Calmar/Drawdown): `lib/analytics/metrics-v1.ts` via `lib/advanced-metrics.ts`
- Policy engine files under `lib/widget-policy-engine/*` are action-governance controls and must not be treated as the dashboard Trading Score formula source.

### Imports and Parsing
- Maintain backward compatibility for CSV/PDF and broker mappings.
- Fail clearly on malformed data; do not hide parse errors.
- Preserve idempotency where imports can be retried.

### Auth and Permissions
- Enforce user/team scoping on all data access paths.
- Never expose service-role secrets to the client.
- Validate API authorization, not only UI-level checks.
- In server actions, avoid module-scope Supabase admin client initialization.
- Initialize admin clients inside each action/function with explicit env validation and clear error messages.

### Payments and Webhooks
- Keep webhook handlers deterministic and idempotent.
- Verify signature/secret checks are preserved.
- Ensure plan ID changes remain synchronized with config and env docs.

## Change Workflow
1. Read relevant files and existing patterns before editing.
2. Implement the smallest coherent fix.
3. Run validation commands for impacted scope.
4. Confirm no obvious regressions in critical paths.
5. Summarize behavior changes and residual risks.

## Git Push Safety
- When user asks to push, do not include unrelated local modifications by default.
- Commit only the files that belong to the requested task (use explicit path-based staging/commit).
- If unexpected modified files are present, call them out and exclude them unless the user explicitly asks to include them.
- Avoid broad staging (`git add .`) when the worktree is dirty.

## Commit Transfer Verification
- For requests like "pull commit `<hash>` into main", update `main`, cherry-pick the target commit, then push.
- If conflict resolution creates a new commit hash, report both the source hash and the resulting commit hash on `main`.
- Verify and report state with explicit checks (`git merge-base --is-ancestor <hash> main`, `git rev-parse main`, `git rev-parse origin/main`).
- After finishing, restore the previous working branch/state (including stashed local files) unless the user asks otherwise.

## Validation Commands
Use npm scripts already defined in this repo:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Additional targeted commands:

```bash
npm run test:payment
npm run test:coverage
```

## Coding Rules
- Prefer server-side validation for any user-provided data.
- Add or update types before adding runtime workarounds.
- Avoid `any` unless unavoidable and justified.
- Keep functions focused; extract helpers for repeated logic.
- Use clear error messages with enough diagnostic context.
- Add comments only for non-obvious decisions.

## API and Data Contracts
- Do not break existing response shapes without migration strategy.
- Treat persisted data schema changes as explicit migrations.
- For new fields, define defaults and nullability intentionally.
- Validate external payloads at boundaries.

## Performance Expectations
- Avoid unnecessary client re-renders and heavy synchronous work.
- Keep bundle impact in mind for shared UI modules.
- Prefer pagination/chunking for potentially large datasets.

## Shared Page UX Guardrails
- Shared route files: `app/[locale]/shared/[slug]/*`.
- Use `container-fluid` for shared-page content alignment to avoid large unused side space on wide screens.
- Keep shared metadata card and widget grid on the same width rhythm (same container, matching horizontal padding).
- Shared widget layout should prefer persisted shared layout (`sharedParams.desktop/mobile`) and only fallback to defaults when missing.
- For read-only shared views, use auto-arranged/compacted widget placement to reduce visual gaps.
- Keep shared top navigation visually consistent with home navigation (rounded/floating shell, same spacing language).

## Dashboard Layout Guardrails
- Avoid stacked/double frames around dashboard content. Do not wrap card-based components (for example `TradeTableReview`, `AccountsOverview`, `DataManagementCard`, `TeamManagement`) inside another bordered panel unless explicitly requested.
- Keep dashboard top spacing tight and intentional. Do not add extra top margin/padding above the first widget/content row without a product requirement.
- For dashboard header separators, prefer a subtle inset hairline over a hard border rule when using sticky translucent headers.
- When changing chart/widget shells, verify edge rendering does not introduce visible seam/gap artifacts at rounded corners.
- If layout polish issues are fixed (gap, double border, seam artifacts), preserve those utility/class patterns across related dashboard pages to prevent regressions.
- Keep dashboard navbar controls explicit: `Edit Layout` and `Add Widget` must remain visible and discoverable on desktop and mobile (avoid icon-only states that hide intent).
- `Add Widget` trigger behavior should stay mode-safe: when customize mode is off, disable trigger affordance instead of silently opening with inconsistent state.

## UI System Guardrails
- Use the global token system for public marketing surfaces (`--brand-*`, `--mk-*`) and avoid one-off hardcoded colors that drift from the unified palette.
- Keep motion language consistent across public components (entry, hover, stagger): prefer shared easing family (`[0.22, 1, 0.36, 1]`) and avoid abrupt mismatched timings.
- Preserve typography pairing used by the current marketing system and keep heading scale rhythm consistent section-to-section.

## Render Safety Rules
- Avoid `setState` calls inside effects when the state change can be handled directly by an interaction callback (for example `onOpenChange` handlers).
- For sheet/modal open-close lifecycle resets, prefer event-driven reset handlers over effect-driven state resets to prevent cascading re-renders.

## Session Notes (2026-02-12)
- Keep dashboard navbar action labels (`Edit Layout`, `Add Widget`) visible across breakpoints.
- Prevent accidental Add Widget interactions outside customize mode via disabled trigger state.
- Preserve unified color/motion system for public pages and avoid component-level palette drift.
- `tradingViewChart` is deprecated and removed from active dashboard runtime paths (`WidgetType`, widget registry, lazy loaders, and chart component file).
- Keep widget visual changes design-only unless explicitly requested otherwise.
- Use the shared widget shell contract for modern minimal dashboard styling:
  - `data-widget-shell="true"` on widget wrapper containers.
  - `[data-widget-shell="true"]` and `[data-chart-surface="modern"]` styling in global CSS as the single source of visual treatment.

## Observability and Debuggability
- Preserve useful logs around imports, sync, and webhook processing.
- Avoid logging sensitive data (tokens, secrets, PII-heavy payloads).
- Include contextual identifiers (user/team/import/job IDs) when safe.

## Definition of Done
A change is done when:
- Behavior is implemented and matches requested scope.
- Lint/type/tests for impacted areas pass.
- Critical paths (imports, analytics correctness, auth, payments) remain intact.
- Notes include what changed, why, and any follow-up work.

## Non-Goals for Routine Tasks
- Large design overhauls unrelated to request.
- Cross-cutting refactors without measurable benefit.
- Dependency upgrades unless required to complete the task.

## Escalation Guidance
Escalate to a human reviewer when:
- Financial calculations produce ambiguous results.
- Broker payload changes require domain interpretation.
- Security/auth edge cases are uncertain.
- Payment lifecycle events conflict or duplicate unexpectedly.

## Documentation Roadmap
This roadmap keeps markdown updates coherent across the repository.

### Current State (2026-02-12)
- `COMBINED_DOCUMENTATION.md` is generated from source markdown files.
- Source-of-truth remains each original file in root, `docs/`, `app/`, `prisma/`, `scripts/`, and `public/`.
- Do not manually edit `COMBINED_DOCUMENTATION.md`; update source files and regenerate.

### Documentation Workstreams
- Core Product and Setup: `README.md`, `SECURITY.md`, `CHANGELOG_SECURITY.md`
- Architecture and UX: `docs/DASHBOARD_REDESIGN_SPEC.md`, `docs/WIREFRAMES.md`, `docs/IMPLEMENTATION_PLAN.md`
- Design System: `docs/COLOR_TOKEN_SYSTEM.md`, `docs/MIGRATION_GUIDE.md`, `docs/CARD_COMPONENT_SYSTEM.md`, `docs/CARD_REDESIGN_SUMMARY.md`
- Payments and Billing: all `docs/PAYMENT_SYSTEM*.md`, `docs/SUBSCRIPTION_SETUP.md`
- Import and Data Contracts: `docs/IMPORT_CONTRACTS.md`, `IMPORT_FIX_SUMMARY.md`, `ROUTE_MAPPING_VERIFICATION.md`
- Reliability and Operations: `docs/INCIDENT_RUNBOOK.md`, `docs/PRODUCTION_READINESS_CHECKLIST.md`, `docs/HETZNER_SUPABASE_DEPLOYMENT.md`, `scripts/loadtest/README.md`
- Feature Docs: `app/[locale]/embed/README.md`, `app/api/ai/support/README.md`, `prisma/migrations/README.md`

### Update Rules
1. Edit source docs first.
2. Regenerate `COMBINED_DOCUMENTATION.md` after source changes.
3. Keep version/date headers current where present.
4. For safety-critical behavior changes, update related docs in the same change set.
5. Prefer one canonical document per domain and keep supplementary docs short and linked.

### Near-Term Plan
1. Reduce duplication in payment docs by designating one primary guide and keeping others as focused references.
2. Add "last reviewed" timestamps to high-risk docs (payments, imports, incident, production readiness).
3. Add a deterministic generation script in `scripts/` for rebuilding `COMBINED_DOCUMENTATION.md`.
4. Add visual regression checks for `/[locale]/shared/[slug]` to catch layout drift (navbar style, width alignment, and widget spacing).

### Documentation Maintenance Commands
Use this command to regenerate `COMBINED_DOCUMENTATION.md` from all source markdown files:

```bash
{
  echo "# Combined Documentation"
  echo
  echo "This file is auto-generated from repository Markdown sources."
  echo "Do not edit this file manually; update the source Markdown files instead."
  echo
  echo "Generated on: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
  echo
  echo "## Included Files"
  rg --files -g '*.md' -g '!.next/**' -g '!**/node_modules/**' | grep -v '^COMBINED_DOCUMENTATION.md$' | sort | while IFS= read -r f; do
    echo "- \`$f\`"
  done
  echo
  rg --files -g '*.md' -g '!.next/**' -g '!**/node_modules/**' | grep -v '^COMBINED_DOCUMENTATION.md$' | sort | while IFS= read -r f; do
    echo "---"
    echo
    echo "# === ./$f ==="
    echo
    cat "$f"
    echo
  done
} > COMBINED_DOCUMENTATION.md
```

After regeneration:
1. Confirm the generated timestamp and included-file list are correct.
2. Confirm no `.next` or `node_modules` markdown files were included.
3. Commit updated source docs and `COMBINED_DOCUMENTATION.md` together.

## Structured Project Study (Read This First)
Use this section to understand the product in execution order before touching code.

### 1) What This Project Is
Qunt Edge is a multi-surface trading analytics platform with:
- Public marketing and informational pages
- Auth and onboarding
- Logged-in trader dashboard (widgets, charts, imports, analysis)
- Team collaboration surfaces
- Admin operations
- Payment/subscription lifecycle with webhook processing

### 2) Runtime Layering (File Roles)
- `page.tsx`: route entry point (what user sees first for that route).
- `layout.tsx`: persistent wrapper for route group (nav, shell, auth guard, shared providers).
- `components/*.tsx`: visual and interaction units rendered by pages/layouts.
- `actions.ts` / server actions: server-side mutations/fetch workflows called by UI.
- `app/api/**/route.ts`: HTTP API boundaries (webhooks, cron, import/AI endpoints).

### 3) User-Visible Flow Map (Top to Bottom)

#### A) Home Experience (`/[locale]`)
- Entry page: `app/[locale]/(home)/page.tsx`
  - Role: locale-aware route entry that returns `HomeContent`.
- Composition: `app/[locale]/(home)/components/HomeContent.tsx`
  - Role: top-level home composition; renders hero first, then deferred sections.
- Top hero section: `app/[locale]/(home)/components/Hero.tsx`
  - Role: core value proposition/slogan, primary CTA, trust signals.
  - Slogan in current implementation: "Stop auditing the money. Audit the execution."
- Mid sections (feature narrative): `app/[locale]/(home)/components/DeferredHomeSections.tsx`
  - Role: progressively renders supporting sections (problem, differentiators, analysis, CTA).
- Top navigation (route group shell): `app/[locale]/(landing)/components/navbar.tsx`
  - Role: global marketing nav links + auth/dashboard CTA.
- Bottom footer (route group shell): `app/[locale]/(landing)/components/footer.tsx`
  - Role: product/support/legal links + social links + copyright/disclaimer.

#### B) Marketing/Landing Pages (`/[locale]/*` public pages)
- Group layout: `app/[locale]/(landing)/layout.tsx`
  - Role: wraps public pages in a consistent shell.
- Shell component: `app/[locale]/(landing)/components/marketing-layout-shell.tsx`
  - Role: renders top navbar, page content container, bottom footer.
- Example pages:
  - `app/[locale]/(landing)/pricing/page.tsx`
  - `app/[locale]/(landing)/support/page.tsx`
  - `app/[locale]/(landing)/faq/page.tsx`
  - `app/[locale]/(landing)/updates/page.tsx`

#### C) Authentication
- Entry page: `app/[locale]/(authentication)/authentication/page.tsx`
  - Role: sign-in/sign-up UI.
- Auth form: `app/[locale]/(authentication)/components/user-auth-form.tsx`
  - Role: credential/OAuth interactions.
- Callback endpoint: `app/api/auth/callback/route.ts`
  - Role: provider callback and redirect finalization.

#### D) Dashboard (Logged-In Core Product)
- Layout gate + shell: `app/[locale]/dashboard/layout.tsx`
  - Role: auth check; if no user, redirect; then render sidebar + header + page content.
- Sidebar navigation: `components/sidebar/dashboard-sidebar.tsx`
  - Role: global nav between dashboard surfaces (widgets, trades, reports, billing, settings, admin).
- Top dashboard header: `app/[locale]/dashboard/components/dashboard-header.tsx`
  - Role: context title + filters/import/sync + widget edit controls.
- Main dashboard page: `app/[locale]/dashboard/page.tsx`
  - Role: tab container routing user views:
    - Widgets: `app/[locale]/dashboard/components/widget-canvas.tsx`
    - Trades table: `app/[locale]/dashboard/components/tables/trade-table-review.tsx`
    - Accounts: `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`
    - Chart mode: `app/[locale]/dashboard/components/chart-the-future-panel.tsx`

#### E) Data Import Surface
- Route page: `app/[locale]/dashboard/import/page.tsx`
  - Role: dedicated import workspace.
- Primary trigger: `app/[locale]/dashboard/components/import/import-button.tsx`
  - Role: starts import workflows from dashboard header/modal.
- Platform processors: `app/[locale]/dashboard/components/import/**`
  - Role: broker/file-specific parsing and normalization.

#### F) Teams Surface
- Teams landing: `app/[locale]/teams/(landing)/page.tsx`
- Teams dashboard: `app/[locale]/teams/dashboard/page.tsx`
- Team workspace shell: `app/[locale]/teams/dashboard/layout.tsx`
- Role: collaboration and team analytics/member management flows.

#### G) Admin Surface
- Admin home: `app/[locale]/admin/page.tsx`
- Admin layout: `app/[locale]/admin/layout.tsx`
- Role: operations dashboard, messaging/newsletter, payment/subscription oversight.

#### H) Shared and Embed Surface
- Public shared dashboard view: `app/[locale]/shared/[slug]/page.tsx`
  - Role: read-only shared dashboard link rendering.
- Embed route: `app/[locale]/embed/page.tsx`
  - Role: embeddable chart/dashboard frame for external sites.

### 4) Component Responsibility Examples (Exact Pattern)
- `page.tsx`: first route renderer for user.
- `layout.tsx`: route-group frame and guard.
- `navbar.tsx`: top navigation controls and routing actions.
- `hero.tsx` / `Hero.tsx`: core message, slogan, and main CTA block.
- `footer.tsx` / `Footer.tsx`: legal/support/product links and site closure area.

### 5) Commit Ledger (Latest 30, With File IDs)
Each row: `commit_id | date | summary | key_file_ids`.

1. `c3e6411` | `2026-02-12` | Clarify auth redirect handling | `app/[locale]/(authentication)/components/user-auth-form.tsx`, `app/api/auth/callback/route.ts`, `components/ui/action-card.tsx`
2. `40c920c` | `2026-02-12` | Update authentication page styling | `app/[locale]/(authentication)/authentication/page.tsx`, `app/[locale]/(authentication)/components/user-auth-form.tsx`, `lib/score-calculator.ts`
3. `ec22828` | `2026-02-12` | Clean dashboard UI alignment | `app/[locale]/dashboard/components/chat/chat.tsx`, `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx`
4. `a72038b` | `2026-02-12` | Redesign trader profile and add avatar in hero | `app/[locale]/dashboard/trader-profile/page.tsx`
5. `89905c6` | `2026-02-12` | Fix login issue on main | `server/auth.ts`
6. `015b855` | `2026-02-12` | Finalize unified dashboard theme and trader profile components | `app/[locale]/(landing)/components/footer.tsx`, `app/[locale]/dashboard/trader-profile/page.tsx`, `app/globals.css`
7. `86d02d3` | `2026-02-12` | Replace timeframe buttons with segmented control | `app/[locale]/dashboard/components/chart-the-future-panel.tsx`, `app/[locale]/dashboard/components/top-nav.tsx`, `components/ui/segmented-control.tsx`
8. `2be2147` | `2026-02-12` | Check thread changes applied | `LAST_2_DAYS_CHANGES.txt`, `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/[locale]/dashboard/components/charts/tradingview-chart.tsx`
9. `b44459e` | `2026-02-12` | Avoid import-time Supabase admin client crashes | `app/[locale]/admin/actions/stats.ts`, `app/[locale]/admin/actions/weekly-recap.ts`, `app/[locale]/teams/actions/stats.ts`
10. `9b83e0a` | `2026-02-12` | Update combined documentation | `COMBINED_DOCUMENTATION.md`
11. `ff5eb2b` | `2026-02-12` | Summarize trader profile updates | `app/[locale]/teams/actions/stats.ts`
12. `825b4ad` | `2026-02-12` | Summarize trader profile updates | `app/[locale]/dashboard/components/add-widget-sheet.tsx`, `app/[locale]/dashboard/components/widgets/trading-score-widget.tsx`, `app/[locale]/teams/actions/analytics.ts`
13. `a27b406` | `2026-02-10` | Create combined documentation and update multiple components | `COMBINED_DOCUMENTATION.md`, `ROUTE_MAPPING_VERIFICATION.md`, `app/[locale]/(home)/components/Hero.tsx`
14. `a5454a7` | `2026-02-10` | Centralize data normalization and fix dashboard type mismatches | `app/[locale]/admin/actions/stats.ts`, `app/[locale]/dashboard/components/accounts/account-card.tsx`, `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`
15. `146a0a6` | `2026-02-10` | Normalize trade/account types across app | `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/[locale]/dashboard/components/tables/trade-table-review.tsx`, `app/[locale]/dashboard/components/widget-canvas.tsx`
16. `78d30f2` | `2026-02-10` | Fix TypeScript decimal errors | `app/[locale]/(home)/components/HomeContent.tsx`, `app/[locale]/(landing)/components/navbar.tsx`, `app/[locale]/dashboard/components/add-widget-sheet.tsx`
17. `1d6979a` | `2026-02-10` | Enterprise hardening sweep | `.github/workflows/ci.yml`, `README.md`, `app/[locale]/(home)/components/Hero.tsx`
18. `2b5cda3` | `2026-02-10` | Resolve build errors in free-users-table date handling | `app/[locale]/admin/components/dashboard/free-users-table.tsx`
19. `0f0ecf7` | `2026-02-10` | Redesign dashboard customization and fix trade serialization | `app/[locale]/dashboard/components/dashboard-header.tsx`, `app/api/ai/chat/tools/get-overall-performance-metrics.ts`, `app/api/email/weekly-summary/[userid]/actions/user-data.ts`
20. `620c6b0` | `2026-02-10` | Merge branch `main` | merge commit
21. `630181f` | `2026-02-10` | Initial commit from local codebase | `.env.example`, `.github/workflows/ci.yml`, `.github/workflows/widget-policy-compliance.yml`
22. `f3c385c` | `2026-02-10` | Remove widget hover effects and set black widget surfaces | `app/[locale]/dashboard/components/lazy-widget.tsx`, `app/[locale]/dashboard/components/widget-canvas.tsx`, `components/ui/card.tsx`
23. `dde6403` | `2026-02-10` | Fix dashboard edit button | `app/[locale]/dashboard/components/widget-canvas.tsx`
24. `4b1561e` | `2026-02-10` | Make navbar edit toggle reliable on dashboard root | `app/[locale]/dashboard/components/dashboard-header.tsx`
25. `6caa114` | `2026-02-10` | Add explicit no-data states to chart cards | `app/[locale]/dashboard/components/charts/equity-chart.tsx`, `app/[locale]/dashboard/components/charts/pnl-bar-chart.tsx`, `app/[locale]/dashboard/components/charts/time-in-position.tsx`
26. `ad2bf84` | `2026-02-10` | Show explicit empty states for chart widgets | `app/[locale]/dashboard/components/charts/commissions-pnl.tsx`, `app/[locale]/dashboard/components/charts/pnl-per-contract.tsx`, `app/[locale]/dashboard/components/charts/trade-distribution.tsx`
27. `c32011a` | `2026-02-10` | Strengthen chart surfaces and readability | `app/globals.css`, `components/ui/chart.tsx`
28. `9ec1fcd` | `2026-02-10` | Redesign charts with unified visual surface | `app/[locale]/(home)/components/AnalysisDemo.tsx`, `app/[locale]/admin/components/dashboard/user-growth-chart.tsx`, `app/[locale]/dashboard/components/calendar/charts.tsx`
29. `efdc377` | `2026-02-10` | Adjust widget grid sizing | `app/[locale]/dashboard/components/widget-canvas.tsx`
30. `998bb7e` | `2026-02-09` | Fix widget canvas sizing (clipping/dead space) | `app/[locale]/dashboard/components/widget-canvas.tsx`

## Complete Markdown Map
Use this section as the canonical map of all markdown documentation in this repository.
Goal: help agents quickly find source-of-truth documents by topic.

### Root-Level Docs
- `README.md`: Primary project overview, setup, architecture, and contributor guidance.
- `SECURITY.md`: Vulnerability reporting policy, disclosure rules, and testing boundaries.
- `CHANGELOG_SECURITY.md`: Security/performance hardening changelog and migration notes.
- `IMPORT_FIX_SUMMARY.md`: Trade import validation fix details and data-flow impact.
- `ROUTE_MAPPING_VERIFICATION.md`: Locale route verification and mapping coverage report.
- `COMBINED_DOCUMENTATION.md`: Generated aggregate of all source markdown docs.

### Agent and Process Docs
- `public/AGENTS.md`: Agent operating instructions, safety rules, and documentation governance.

### Product and Architecture Docs (`docs/`)
- `docs/DASHBOARD_REDESIGN_SPEC.md`: End-to-end redesign specification for dashboard UX/system.
- `docs/WIREFRAMES.md`: Responsive wireframes, component layouts, and user flows.
- `docs/IMPLEMENTATION_PLAN.md`: Stepwise implementation roadmap with code-level guidance.
- `docs/WIDGET_STANDARDIZATION_FRAMEWORK.md`: Widget policy engine architecture and rollout model.
- `docs/WIDGET_POLICY_IMPLEMENTATION_GUIDE.md`: Hands-on implementation steps for widget policy.
- `docs/ENHANCED_WIDGET_PERSISTENCE.md`: Widget persistence architecture (optimistic/offline/versioning).

### Design System Docs (`docs/`)
- `docs/COLOR_TOKEN_SYSTEM.md`: Centralized semantic color token definitions and usage.
- `docs/MIGRATION_GUIDE.md`: Migration steps from arbitrary colors to tokenized styling.
- `docs/CARD_COMPONENT_SYSTEM.md`: Card component variants, APIs, and design rules.
- `docs/CARD_REDESIGN_SUMMARY.md`: Summary of card redesign implementation outcomes.

### Payments and Billing Docs (`docs/`)
- `docs/PAYMENT_SYSTEM_COMPLETE_GUIDE.md`: Full production-grade payment system guide.
- `docs/PAYMENT_SYSTEM_GUIDE.md`: Practical implementation and setup guide for payments.
- `docs/PAYMENT_SYSTEM_ARCHITECTURE.md`: Payment architecture and service/data flow design.
- `docs/PAYMENT_SYSTEM_SUMMARY.md`: Implemented scope summary for payment capabilities.
- `docs/SUBSCRIPTION_SETUP.md`: Whop subscription backend setup and webhook basics.

### Data, Metrics, and Reliability Docs (`docs/`)
- `docs/IMPORT_CONTRACTS.md`: Canonical import DTO and validation compatibility rules.
- `docs/ANALYTICS_METRIC_DEFINITIONS.md`: Versioned analytics formulas and reproducibility rules.
- `docs/INCIDENT_RUNBOOK.md`: Incident triage, rollback, and post-incident procedures.
- `docs/PRODUCTION_READINESS_CHECKLIST.md`: Production launch quality/security/reliability checklist.
- `docs/HETZNER_SUPABASE_DEPLOYMENT.md`: Deployment playbook for Hetzner + Supabase stack.

### Feature-Specific Docs
- `app/[locale]/embed/README.md`: Embed API, iframe parameters, postMessage, and theming.
- `app/api/ai/support/README.md`: Support assistant behavior, tools, and escalation flow.
- `prisma/migrations/README.md`: Migration workflow for dashboard layout version history.
- `scripts/loadtest/README.md`: k6 load-test execution guide for preview/production.

### Documentation Source-of-Truth Rules
1. Source markdown files are authoritative.
2. `COMBINED_DOCUMENTATION.md` is generated output.
3. When docs change, update source docs first, then regenerate the combined file.
4. If two docs conflict, prefer the more specific domain doc and align the broader summary doc.

## Recent Changes (Last 30 Commits, Detailed)

### Latest Snapshot (2026-02-12)
1. `Uncommitted (2026-02-12)` - Shared page polish and locale-safe share links  
   Scope: shared route visual cleanup and consistency in `app/[locale]/shared/[slug]` plus locale-prefixed share URLs from dashboard manager.
   Key files: `app/[locale]/dashboard/components/shared-layouts-manager.tsx`, `app/[locale]/shared/[slug]/shared-page-client.tsx`, `app/[locale]/shared/[slug]/shared-widget-canvas.tsx`
1. `b44459e` (2026-02-12) - Fix import-time Supabase admin client crash paths  
   Scope: harden admin/team server actions by moving Supabase admin client creation into per-action helpers with env guards (`app/[locale]/teams/actions/stats.ts`, `app/[locale]/admin/actions/stats.ts`, `app/[locale]/admin/actions/send-email.ts`, `app/[locale]/admin/actions/weekly-recap.ts`)
2. `c3e6411` (2026-02-12) - Clarify auth redirect handling  
   Scope: authentication redirect behavior and edge-case session routing
3. `40c920c` (2026-02-12) - Update authentication page styling  
   Scope: visual refresh of authentication route UI
4. `ec22828` (2026-02-12) - Clean dashboard UI alignment  
   Scope: dashboard layout polish and component alignment consistency
5. `a72038b` (2026-02-12) - Redesign trader profile and add avatar in hero  
   Scope: complete trader-profile redesign with benchmark storytelling, richer metrics, and hero avatar fallback handling in `app/[locale]/dashboard/trader-profile/page.tsx`

1. `de50c3f7` (2026-02-09) - Fix dashboard subscription request loop  
   Scope: billing + subscription hook (`hooks/use-subscription.tsx`, `server/billing.ts`)  
   Diff size: 2 files changed, 29 insertions, 13 deletions

2. `87a66fa5` (2026-02-09) - fix(tradovate): improve synchronization error handling and auth checks  
   Scope: Tradovate sync actions/route/context (`app/[locale]/dashboard/components/import/tradovate/actions.ts`, `app/api/tradovate/synchronizations/route.ts`, `context/tradovate-sync-context.tsx`)  
   Diff size: 3 files changed, 12 insertions, 3 deletions

3. `66b95b6e` (2026-02-09) - fix(prisma): remove deprecated datasource url fields for prisma 7  
   Scope: Prisma schema compatibility cleanup (`prisma/schema.prisma`)  
   Diff size: 1 file changed, 2 deletions

4. `8405f848` (2026-02-08) - Stabilize import/account sync and align core runtime config  
   Scope: broad runtime + sync hardening across admin actions, import UI, cron renewal, root API route, data provider, Supabase/Prisma/auth/database layers, build config  
   Key files: `context/data-provider.tsx`, `server/database.ts`, `prisma/schema.prisma`, `proxy.ts`, `scripts/sync-stack.mjs`, `next.config.ts`, `package.json`  
   Diff size: 19 files changed, 308 insertions, 408 deletions

5. `b1b2128f` (2026-02-08) - Extend basic trade visibility window to 3 months  
   Scope: dashboard data-loading window and backing query logic (`context/data-provider.tsx`, `server/database.ts`)  
   Diff size: 2 files changed, 7 insertions, 7 deletions

6. `b4912810` (2026-02-08) - Harden Prisma pooling for high-concurrency serverless traffic  
   Scope: connection strategy + docs/env guidance (`lib/prisma.ts`, `.env.example`, `README.md`)  
   Diff size: 3 files changed, 73 insertions, 8 deletions

7. `515c83f7` (2026-02-08) - Fix Zod error property usage in validation test  
   Scope: test correction for Zod error shape (`test-validation-fix.ts`)  
   Diff size: 1 file changed, 3 insertions, 3 deletions

8. `700220e7` (2026-02-08) - Fix trade import validation: handle string numbers and null groupId  

9. `Uncommitted` (2026-02-12) - Add trader profile surface and benchmark API
   Scope: dashboard trader profile page and benchmark endpoint (`app/[locale]/dashboard/trader-profile/page.tsx`, `app/api/trader-profile/benchmark/route.ts`)
   Verification: route present in `public/routes.json`, production build includes `/[locale]/dashboard/trader-profile` and `/api/trader-profile/benchmark`
   Scope: import validation reliability in trade ingestion + supporting test/docs (`server/database.ts`, `test-validation-fix.ts`, `IMPORT_FIX_SUMMARY.md`)  
   Diff size: 3 files changed, 284 insertions, 7 deletions

9. `2379de45` (2026-02-08) - docs: update AGENTS.md with last 30 commits  
   Scope: agent guidance changelog refresh (`public/AGENTS.md`)  
   Diff size: 1 file changed, 31 insertions, 21 deletions

10. `43b8e9c0` (2026-02-08) - docs: update AGENTS.md with latest changes and cache guidelines  
    Scope: agent workflow/docs updates (`public/AGENTS.md`)  
    Diff size: 1 file changed, 21 insertions, 20 deletions

11. `0ef14304` (2026-02-08) - fix: resolve Tradovate sync and trade import data visibility issues  
    Scope: large cross-cut fix touching import flow, dashboard import UI, Tradovate context/actions, Prisma access layer, locale strings, cron/email/team APIs, billing/shared server services, and load testing scripts  
    Key files: `app/[locale]/dashboard/components/import/*`, `context/tradovate-sync-context.tsx`, `server/database.ts`, `lib/prisma.ts`, `prisma/schema.prisma`, `scripts/loadtest/k6-smoke.js`  
    Diff size: 32 files changed, 673 insertions, 424 deletions

12. `0698a700` (2026-02-08) - Add bulk sync translations for Tradovate  
    Scope: i18n additions for bulk sync text (`locales/en.ts`, `locales/fr.ts`)  
    Diff size: 2 files changed, 14 insertions

13. `f0b751c9` (2026-02-08) - Update Tradovate sync route and context  
    Scope: API/context logic updates for sync lifecycle (`app/api/tradovate/sync/route.ts`, `context/tradovate-sync-context.tsx`)  
    Diff size: 2 files changed, 71 insertions, 31 deletions

14. `420e9516` (2026-02-08) - Handle Prisma P3005 by baselining migrations in CI build  
    Scope: CI/db sync script resilience (`scripts/sync-stack.mjs`)  
    Diff size: 1 file changed, 52 insertions, 1 deletion

15. `6a109794` (2026-02-08) - Fix client crash and add Prisma DB sync in build  
    Scope: crash fix + build pipeline DB synchronization (`app/layout.tsx`, `package.json`, `scripts/sync-stack.mjs`)  
    Diff size: 3 files changed, 73 insertions, 33 deletions

16. `803a85ff` (2026-02-08) - chore: update chart-the-future-panel  
    Scope: dashboard chart panel adjustments (`app/[locale]/dashboard/components/chart-the-future-panel.tsx`)  
    Diff size: 1 file changed, 5 insertions, 3 deletions

17. `d682678d` (2026-02-08) - chore: update dashboard and api components  
    Scope: dashboard component/API cleanup and database updates (`app/[locale]/dashboard/page.tsx`, `app/api/thor/store/route.ts`, `server/database.ts`)  
    Diff size: 5 files changed, 305 insertions, 866 deletions

18. `1694ca10` (2026-02-08) - chore: force update codebase  
    Scope: page-level updates across dashboard and teams routes  
    Key files: `app/[locale]/dashboard/*/page.tsx`, `app/[locale]/teams/dashboard/page.tsx`  
    Diff size: 9 files changed, 81 insertions, 72 deletions

19. `4e02294f` (2026-02-08) - chore: Clean up unused files and components  
    Scope: major repository cleanup; removed many audit/docs artifacts and deprecated UI/lib modules; updated home/import/sidebar/webhook/team-invite/next-config paths; added component analysis script and import platform card  
    Key files: `app/[locale]/dashboard/components/import/components/platform-card.tsx`, `scripts/analyze-components.js`, `next.config.ts`  
    Diff size: 46 files changed, 1308 insertions, 6292 deletions

20. `bc037040` (2026-02-08) - chore: update codebase  
    Scope: home page component and sidebar integration updates  
    Key files: `app/[locale]/(home)/components/*`, `components/ui/sidebar.tsx`, `components/ui/unified-sidebar.tsx`  
    Diff size: 8 files changed, 207 insertions, 148 deletions

21. `96305917` (2026-02-08) - Revert home page sidebar changes  
    Scope: rollback in home content/sidebar behavior (`app/[locale]/(home)/components/HomeContent.tsx`)  
    Diff size: 1 file changed, 22 insertions, 103 deletions

22. `83e7aef2` (2026-02-08) - Update Hero metrics and messaging  
    Scope: landing hero content metrics/copy (`app/[locale]/(home)/components/Hero.tsx`)  
    Diff size: 1 file changed, 13 insertions, 13 deletions

23. `4e216b30` (2026-02-08) - Add dashboard chart and update widget/sidebar integration  
    Scope: new dashboard chart component, widget registry/lazy widget wiring, dashboard types, teams manage layout, sidebar integration  
    Key files: `app/[locale]/dashboard/config/widget-registry.tsx`, `components/ui/unified-sidebar.tsx`  
    Diff size: 7 files changed, 361 insertions, 83 deletions

24. `0aa08895` (2026-02-08) - Unify widget shell styling and dashboard UI updates  
    Scope: dashboard widget shell refactor, quick action cards removal, sidebar/dialog/email/newsletter context updates  
    Key files: `app/[locale]/dashboard/components/widget-canvas.tsx`, `app/[locale]/dashboard/page.tsx`, `components/ui/unified-sidebar.tsx`  
    Diff size: 7 files changed, 114 insertions, 278 deletions

25. `2568eb50` (2026-02-08) - Reduce dashboard widget grid gap to 6x6  
    Scope: layout spacing tweak (`app/[locale]/dashboard/components/widget-canvas.tsx`)  
    Diff size: 1 file changed, 1 insertion, 1 deletion

26. `e98800d3` (2026-02-08) - Optimize dashboard widget loading with lazy split and mobile summary fix  
    Scope: lazy widget loading architecture, registry updates, navbar/PnL summary adjustments, package updates  
    Key files: `app/[locale]/dashboard/components/lazy-widget.tsx`, `app/[locale]/dashboard/components/widget-canvas.tsx`, `app/[locale]/dashboard/config/widget-registry.tsx`  
    Diff size: 6 files changed, 335 insertions, 534 deletions

27. `9fd43041` (2026-02-08) - doc updates  
    Scope: docs + dashboard summary text update (`README.md`, `docs/PAYMENT_SYSTEM_GUIDE.md`, `app/[locale]/dashboard/components/pnl-summary.tsx`)  
    Diff size: 3 files changed, 16 insertions, 1 deletion

28. `3cf798c0` (2026-02-08) - Refresh data provider context  
    Scope: data context behavior refresh (`context/data-provider.tsx`)  
    Diff size: 1 file changed, 3 insertions, 3 deletions

29. `09dba7b6` (2026-02-08) - Update French terms localization  
    Scope: FR legal terms update (`locales/fr/terms.ts`)  
    Diff size: 1 file changed, 1 insertion, 1 deletion

30. `2476e6b6` (2026-02-08) - Update terms localization  
    Scope: EN legal terms update (`locales/en/terms.ts`)  
    Diff size: 1 file changed, 1 insertion, 1 deletion

---

## Recent Changes (Complete History - 24 Commits, Updated 2026-02-12)

### 📊 Repository Overview
- **Total Commits**: 24
- **Primary Author**: Timon
- **Date Range**: 2026-02-09 to 2026-02-10
- **Major Focus Areas**: Data normalization, dashboard redesign, widget system, enterprise hardening

---

### 🔥 Critical Infrastructure Changes

#### 1. `a5454a7` (2026-02-10) - **Refactor: Centralize data normalization and fix type mismatches**
**Author**: Timon  
**Impact**: 🔴 HIGH - Breaking changes to data handling patterns

**What Changed**:
- Centralized all trade/account normalization logic in `lib/data-types.ts`
- Fixed decimal/number type mismatches across dashboard components
- Introduced `normalizeTradesForClient()` and `normalizeAccountsForClient()` helpers
- Updated all server actions to return properly serialized data

**Files Modified**: 8 files
- `lib/data-types.ts` - New centralized normalization module
- Dashboard components - Updated to use new normalization patterns
- Server actions - Standardized serialization

**Migration Required**: ✅ Yes
- Any code fetching trades/accounts must use new normalization helpers
- Direct access to Decimal fields will cause type errors

**Technical Debt**: Resolved floating-point precision issues, improved type safety

---

#### 2. `146a0a6` (2026-02-10) - **Refactor: Normalize trade and account data types**
**Author**: Timon  
**Impact**: 🔴 HIGH - Cross-cutting type system improvements

**What Changed**:
- Ensured consistent data handling between server and client
- Standardized on JavaScript numbers for client-side operations
- Removed string-to-number conversions scattered across codebase
- Updated `DataProvider` context for consistent normalization

**Files Modified**: 12+ files
- `context/data-provider.tsx` - Core data context updates
- Multiple server actions - Consistent serialization patterns
- Dashboard widgets - Updated data consumption

**Performance Impact**: 📈 Positive - Reduced unnecessary type conversions

---

#### 3. `78d30f2` (2026-02-10) - **Fix TypeScript decimal errors**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - Build compilation fixes

**What Changed**:
- Resolved Prisma Decimal type compilation errors
- Added proper type guards for Decimal handling
- Fixed edge cases in numeric field access

**Files Modified**: 3 files

---

#### 4. `1d6979a` (2026-02-10) - **Implement enterprise hardening sweep**
**Author**: Timon  
**Impact**: 🔴 HIGH - Production deployment critical

**What Changed**:
- Massive file count - entire codebase initialization
- Security enhancements across auth boundaries
- Performance optimizations for database queries
- Reliability improvements in error handling
- Complete migration system setup

**Files Modified**: 500+ files (full codebase)
- Complete Prisma migration history
- All server actions
- Authentication system
- Payment webhooks
- Team management
- Import pipelines

**Deployment Notes**:
- Run all Prisma migrations before deployment
- Verify environment variables are configured
- Test webhook endpoints in staging first

---

### 🎨 Dashboard & UI Improvements

#### 5. `2b5cda3` (2026-02-10) - **fix: resolve build errors in free-users-table.tsx**
**Author**: Timon  
**Impact**: 🟡 MEDIUM

**Files Modified**: 1 file
- `app/[locale]/dashboard/teams/admin/free-users-table.tsx`

**What Changed**: Fixed Date object handling in admin tables

---

#### 6. `0f0ecf7` (2026-02-10) - **feat: redesign dashboard customization UI**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - UX enhancement

**What Changed**:
- Redesigned dashboard edit mode
- Fixed trade serialization for open trades (no close date)
- Improved widget customization flow
- Better user feedback during edits

**User-Facing**: ✅ Yes - Better dashboard customization experience

---

#### 7. `620c6b0` (2026-02-10) - **Merge branch 'main'**
**Author**: Timon  
**Type**: Repository maintenance

---

#### 8. `630181f` (2026-02-10) - **feat: initial commit from local codebase**
**Author**: Timon  
**Impact**: 🔴 CRITICAL - Initial repository setup

**Files Added**: Entire codebase
**Purpose**: First commit establishing the repository structure

---

#### 9. `f3c385c` (2026-02-10) - **Remove widget hover effects and set black surfaces**
**Author**: Timon  
**Impact**: 🟢 LOW - Visual polish

**What Changed**:
- Removed distracting hover effects from widgets
- Applied consistent black surface styling
- Cleaner, more professional appearance

**User-Facing**: ✅ Yes - Visual consistency improvement

---

#### 10. `dde6403` (2026-02-10) - **Fix dashboard edit button**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - User experience fix

**What Changed**: Restored functionality to dashboard edit mode toggle

---

#### 11. `4b1561e` (2026-02-10) - **fix(dashboard): make navbar edit toggle reliable**
**Author**: Timon  
**Impact**: 🟡 MEDIUM

**What Changed**:
- Fixed state management in dashboard navbar
- Made edit mode toggle work consistently on dashboard root
- Resolved race conditions in edit state

---

### 📈 Chart & Visualization Updates

#### 12. `6caa114` (2026-02-10) - **Add explicit no-data states to chart cards**
**Author**: Timon  
**Impact**: 🟢 LOW - UX improvement

**What Changed**: Added comprehensive empty states to all remaining dashboard charts

---

#### 13. `ad2bf84` (2026-02-10) - **Show explicit empty states for chart widgets**
**Author**: Timon  
**Impact**: 🟢 LOW - UX improvement

**What Changed**: Improved user feedback when charts have no data to display

---

#### 14. `c32011a` (2026-02-10) - **Strengthen chart visual surfaces**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - Visual polish

**What Changed**:
- Enhanced chart readability with better contrast
- Improved visual hierarchy in charts
- Better accessibility for chart data

---

#### 15. `9ec1fcd` (2026-02-10) - **Redesign charts with modern unified surface**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - Design system update

**What Changed**:
- Complete chart design system overhaul
- Consistent modern styling across all charts
- Unified color palette and typography
- Better responsive behavior

**User-Facing**: ✅ Yes - Significantly improved chart aesthetics

---

#### 16. `efdc377` (2026-02-10) - **Adjust widget grid sizing**
**Author**: Timon  
**Impact**: 🟢 LOW

**Files Modified**: 1 file
- `app/[locale]/dashboard/components/widget-canvas.tsx`

**What Changed**: Fine-tuned widget grid layout calculations

---

#### 17. `998bb7e` (2026-02-09) - **Fix widget canvas sizing**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - Layout bug fix

**What Changed**:
- Prevented widget clipping and dead space
- Improved responsive grid calculations
- Better widget positioning on all screen sizes

---

#### 18. `84b1456` (2026-02-09) - **Explain widget layout gaps**
**Author**: Timon  
**Impact**: 🟢 LOW - Documentation

**What Changed**: Added code comments explaining widget spacing logic

---

### ⚡ Performance & Infrastructure

#### 19. `8ff44a6` (2026-02-09) - **Extend opengraph cache headers**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - SEO & performance

**Files Modified**: 1 file
- `next.config.ts`

**What Changed**:
- Extended cache duration for OpenGraph images
- Improved social media preview loading
- Better CDN utilization

**Technical**: Optimized for Vercel Edge Network

---

#### 20. `b3cacdf` (2026-02-09) - **Analyze best hosting provider**
**Author**: Timon  
**Type**: Documentation/Analysis

**Purpose**: Infrastructure planning and provider evaluation

---

#### 21. `509146f` (2026-02-09) - **Optimize Vercel Edge middleware**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - Performance improvement

**What Changed**:
- Optimized Edge middleware request path
- Reduced latency for API routes
- Better edge function performance

**Performance**: 📈 Faster API response times

---

### 🔄 Integration & Sync

#### 22. `8691d26` (2026-02-09) - **Replace dashboard widgets from upstream repo**
**Author**: Timon  
**Impact**: 🟡 MEDIUM - External integration

**What Changed**:
- Synchronized widget implementations with upstream repository
- Pulled latest widget improvements
- Updated widget component library

**Source**: External repository sync (likely from deltalytix)

---

#### 23. `a5843eb` (2026-02-09) - **chore: fresh sync before dual remote push**
**Author**: Timon  
**Type**: Repository maintenance

**Purpose**: Preparation for multi-remote push

---

#### 24. `7d6d680` (2026-02-09) - **Fix post-import client crash**
**Author**: Timon  
**Impact**: 🔴 HIGH - Critical bug fix

**Files Modified**: 2 files (~250 lines changed)
- `app/[locale]/dashboard/components/import/import-button.tsx` (+467 lines)
- `context/data-provider.tsx` (+1783 lines)

**What Changed**:
- Fixed client-side crashes occurring after trade imports
- Improved import flow responsiveness
- Better error boundary handling
- Enhanced state management during imports

**Bug Fixed**: App would crash when importing large trade datasets
**User Impact**: ✅ Critical - Prevented data loss and app crashes

---

## 🎯 Key Theme Analysis

### Data Architecture
**Commits**: #1, #2, #3, #24  
**Focus**: Type safety, serialization, normalization  
**Impact**: Foundation for reliable financial data handling

### Dashboard Experience
**Commits**: #5, #6, #9, #10, #11, #16, #17  
**Focus**: Edit mode, customization, layout  
**Impact**: Improved user control over dashboard

### Visual Design
**Commits**: #12, #13, #14, #15, #18  
**Focus**: Charts, empty states, consistency  
**Impact**: Modern, professional appearance

### Performance
**Commits**: #19, #21  
**Focus**: Caching, edge optimization  
**Impact**: Faster load times, better CDN utilization

### External Integration
**Commits**: #22  
**Focus**: Upstream widget sync  
**Impact**: Access to latest widget features

---

## 🔧 Engineering Insights

### Migration Requirements
**Required Actions**:
1. Update all data fetch patterns to use new normalization helpers from `lib/data-types.ts`
2. Run Prisma migrations before deploying commit #4
3. Verify environment variables match new security requirements
4. Test import flows thoroughly (commit #24 fixes critical crashes)

### Testing Priority
**High Priority**:
- [ ] Import flows with large datasets (>100 trades)
- [ ] Dashboard edit mode toggle and persistence
- [ ] Widget drag-and-drop with new grid system
- [ ] Chart rendering with empty data states

**Medium Priority**:
- [ ] OpenGraph previews on social platforms
- [ ] Edge function latency measurements
- [ ] Widget customization across mobile/desktop

### Known Issues
1. **Large Import Performance**: Imports >1000 trades may cause temporary UI lag (commit #24)
2. **Widget Resize**: Some edge cases in grid calculations may need refinement (commit #16, #17)

### Technical Debt Resolved
✅ Floating-point precision in financial calculations (commits #1-3)  
✅ Inconsistent data normalization patterns  
✅ Scattered type conversions  
✅ Widget styling inconsistencies

---

## 📝 Notes for AI Agents

### When Modifying Trade/Account Data
- **Always** use normalization helpers from `lib/data-types.ts`
- Server actions should return serialized data (numbers as strings)
- Client components normalize to JS numbers
- Never perform financial calculations on string types

### When Working on Dashboard
- Edit mode state is managed in navbar component
- Widget grid uses CSS Grid with calculated dimensions
- Dark surfaces are intentional (black backgrounds)
- Empty states are required for all chart widgets

### When Optimizing Performance
- Target Vercel Edge Network specifically
- Use appropriate cache headers (see commit #19)
- Consider edge middleware for API routes (commit #21)

### When Handling Imports
- Implement proper error boundaries (commit #24)
- Handle large datasets with chunking/pagination
- Provide user feedback during long operations
- Test with >1000 trade imports

---

## 2026-02-12 Update Addendum

### Scope Added
- Chart tab was simplified to a strict two-panel composition (`ChartPanel` + `AssistantPanel`) while preserving `tab=chart` route behavior.
- Trader Profile was introduced as a dashboard subpage and linked in sidebar navigation.
- Shared dashboard primitives were added for reuse:
  - `components/ui/segmented-control.tsx`
  - `components/ui/stat-tile.tsx`
  - `app/[locale]/dashboard/components/top-nav.tsx`
- Global visual system alignment was extended with flat surfaces and unified mono typography defaults.

### Auth/Runtime Guidance
- Build success does not imply login success; auth must be validated end-to-end in deployed runtime.
- For authentication issues, verify in this order:
  1. Vercel env vars are correct for the target environment.
  2. Supabase Auth Site URL and redirect URLs match production and preview domains.
  3. Callback route behavior is observed in runtime logs (`/api/auth/callback` hits and outcomes).
- `server/auth.ts` includes `VERCEL_URL` fallback in `getWebsiteURL()` to avoid localhost callback leakage in production-like environments.

### Naming/Branding Guardrail
- Do not reintroduce legacy handle references in public UI or config.
- Current owner-facing metadata/branding should remain aligned with `TIMON`.

### Latest 30 Commits Snapshot (Most Recent First)
1. `c3e6411` (2026-02-12) - Clarify auth redirect handling
2. `40c920c` (2026-02-12) - Update authentication page styling
3. `ec22828` (2026-02-12) - Clean dashboard UI alignment
4. `a72038b` (2026-02-12) - Redesign trader profile and add avatar in hero
5. `89905c6` (2026-02-12) - Fix login issue on main
6. `015b855` (2026-02-12) - feat: finalize unified dashboard theme and trader profile components
7. `86d02d3` (2026-02-12) - Replace timeframe buttons with Seged
8. `2be2147` (2026-02-12) - Check thread changes applied
9. `b44459e` (2026-02-12) - fix: avoid import-time supabase admin client crashes
10. `9b83e0a` (2026-02-12) - docs: update combined documentation
11. `ff5eb2b` (2026-02-12) - Summarize trader profile updates
12. `825b4ad` (2026-02-12) - Summarize trader profile updates
13. `a27b406` (2026-02-10) - chore: create combined documentation and update multiple components
14. `a5454a7` (2026-02-10) - Refactor: Centralize data normalization and fix type mismatches across the dashboard
15. `146a0a6` (2026-02-10) - Refactor: Normalize trade and account data types across the application. Centralized types in lib/data-types.ts, updated DataProvider for consistent normalization, and ensured server-side actions handle standard JS numbers.
16. `78d30f2` (2026-02-10) - Fix TypeScript decimal errors
17. `1d6979a` (2026-02-10) - Implement enterprise hardening sweep
18. `2b5cda3` (2026-02-10) - fix: resolve build errors in free-users-table.tsx by correctly handling Date objects
19. `0f0ecf7` (2026-02-10) - feat: redesign dashboard customization UI and fix trade serialization for open trades
20. `620c6b0` (2026-02-10) - Merge branch 'main' of https://github.com/afrodeennoff/final-qunt-edge into main
21. `630181f` (2026-02-10) - feat: initial commit from local codebase
22. `f3c385c` (2026-02-10) - Remove widget hover effects and set black widget surfaces
23. `dde6403` (2026-02-10) - Fix dashboard edit button
24. `4b1561e` (2026-02-10) - fix(dashboard): make navbar edit toggle reliable on dashboard root
25. `6caa114` (2026-02-10) - Add explicit no-data states to remaining dashboard chart cards
26. `ad2bf84` (2026-02-10) - Show explicit empty states for dashboard chart widgets
27. `c32011a` (2026-02-10) - Strengthen chart visual surfaces and readability
28. `9ec1fcd` (2026-02-10) - Redesign charts with modern unified surface across app
29. `efdc377` (2026-02-10) - Adjust widget grid sizing
30. `998bb7e` (2026-02-09) - Fix widget canvas sizing to prevent clipping and dead space

## End-to-End Component Code Map
Use this map when you need component-level understanding, not just route-level understanding.
Format: `Component/Module` -> `Function` -> `Use Case` -> `File ID`.

### Manual Documents (Catalog Style)
- `docs/PROJECT_MANUAL_INDEX.md`: Primary read-first handbook (project flow, code map, task-based edit guide).
- `docs/COMPONENT_CODE_MAP.md`: End-to-end component catalog (`component`, `function`, `use case`, `file ID`).
- `docs/CHANGE_CATALOG_MANUAL.md`: Recent commit catalog with `why`, `how fixed`, and key file IDs.
- `COMBINED_DOCUMENTATION.md`: Aggregated markdown bundle of repository docs (generated output, not source-of-truth).

### How To Understand These Documents
Use this reading order so context builds correctly:
1. `docs/PROJECT_MANUAL_INDEX.md`
   - Understand the product first: route flow, major surfaces, where to edit for common tasks.
2. `docs/COMPONENT_CODE_MAP.md`
   - Understand component responsibilities: what each component does, why it exists, and exact file ID.
3. `docs/CHANGE_CATALOG_MANUAL.md`
   - Understand recent evolution: per commit, why change happened and how it was implemented.
4. `COMBINED_DOCUMENTATION.md`
   - Use as a broad reference snapshot only when you need all docs in one place.

### Source-of-Truth Clarification
- Canonical docs are the original markdown files (`README.md`, `docs/**`, `app/**/README.md`, etc.).
- `COMBINED_DOCUMENTATION.md` is generated and should not be edited manually.
- If content differs:
  1. trust source markdown files first,
  2. update those files,
  3. regenerate `COMBINED_DOCUMENTATION.md`.

### Dashboard Core Components (Function + Use Case + File ID)
- `DashboardLayout` -> auth gate + shell wrapper -> ensures only authenticated users access dashboard and wires providers -> `app/[locale]/dashboard/layout.tsx`
- `DashboardSidebar` -> primary navigation rail -> user switches between widgets, trades, reports, billing, settings, teams/admin -> `components/sidebar/dashboard-sidebar.tsx`
- `DashboardHeader` -> top control bar -> filters/import/sync/share/customize actions for current dashboard context -> `app/[locale]/dashboard/components/dashboard-header.tsx`
- `DashboardPage` -> tab router view -> mounts widgets/table/accounts/chart tabs based on URL params -> `app/[locale]/dashboard/page.tsx`
- `WidgetCanvas` -> dashboard widget runtime -> renders, reorders, and persists user widget layout -> `app/[locale]/dashboard/components/widget-canvas.tsx`
- `AddWidgetSheet` -> widget picker panel -> user selects and inserts new widget into layout -> `app/[locale]/dashboard/components/add-widget-sheet.tsx`
- `TradeTableReview` -> trade table workspace -> edit/review/imported trades with inline tools -> `app/[locale]/dashboard/components/tables/trade-table-review.tsx`
- `AccountsOverview` -> account analytics panel -> compare accounts, performance, progress, and configuration -> `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`
- `ChartTheFuturePanel` -> chart-focused dashboard mode -> quick chart analysis with timeframe and view controls -> `app/[locale]/dashboard/components/chart-the-future-panel.tsx`
- `ImportButton` -> import entry trigger -> opens platform/file import flows from dashboard header -> `app/[locale]/dashboard/components/import/import-button.tsx`
- `GlobalSyncButton` -> sync trigger -> forces data refresh from linked sources -> `app/[locale]/dashboard/components/global-sync-button.tsx`
- `ShareButton` -> sharing action -> generates share links for dashboard artifacts/layout -> `app/[locale]/dashboard/components/share-button.tsx`
- `SharedLayoutsManager` -> shared-layout management -> create/manage/reuse shared dashboard layouts -> `app/[locale]/dashboard/components/shared-layouts-manager.tsx`

### Dashboard Navigation and Header Action Use Cases
- Sidebar item `Dashboard` (`?tab=widgets`) -> default operational overview for active trader session -> `components/sidebar/dashboard-sidebar.tsx`
- Sidebar item `Trades` (`?tab=table`) -> trade review/edit workflow -> `components/sidebar/dashboard-sidebar.tsx`
- Sidebar item `Chart the Future` (`?tab=chart`) -> chart-only strategy analysis mode -> `components/sidebar/dashboard-sidebar.tsx`
- Sidebar item `Accounts` (`?tab=accounts`) -> account-level comparisons and configuration -> `components/sidebar/dashboard-sidebar.tsx`
- Sidebar item `Reports` -> historical analytics summaries -> `components/sidebar/dashboard-sidebar.tsx`
- Sidebar item `Behavior` -> mindset/behavior tracking and journaling context -> `components/sidebar/dashboard-sidebar.tsx`
- Sidebar item `Billing` -> plan/subscription management -> `components/sidebar/dashboard-sidebar.tsx`
- Header action `Import` -> ingest broker/files data -> `app/[locale]/dashboard/components/import/import-button.tsx`
- Header action `Edit Layout` -> toggle widget customization mode -> `app/[locale]/dashboard/components/dashboard-header.tsx`
- Header action `Add Widget` -> add widget while customizing -> `app/[locale]/dashboard/components/add-widget-sheet.tsx`
- Header action `Restore Defaults` -> revert layout baseline -> `app/[locale]/dashboard/components/dashboard-header.tsx`
- Header action `Delete All` -> clear current widget layout -> `app/[locale]/dashboard/components/dashboard-header.tsx`

### Dashboard Feature Packs (Folder-Level Function Map)
- `components/accounts/*` -> account cards/tables/charts/configuration for account analytics workflows.
- `components/analysis/*` -> higher-level analytic summaries and loading shells.
- `components/calendar/*` -> day/week calendar + mood/comment/stat overlays.
- `components/charts/*` -> chart widgets for pnl/time/side/distribution/contract metrics.
- `components/chat/*` -> AI chat UI frames and message components.
- `components/filters/*` -> account/instrument/pnl/date/tag filtering UI and command menu.
- `components/import/*` -> broker/file import pipelines, mapping, upload, sync, tutorials.
- `components/mindset/*` -> journaling/emotion/news-impact behavioral overlays.
- `components/statistics/*` -> compact stat cards (risk-reward, streak, expectancy-like KPIs).
- `components/tables/*` -> editable cells, bulk edit, media/comment/tag trade table subcomponents.
- `components/widgets/*` -> specialized widget cards for expectancy/risk/trading-score.

### Complete Dashboard Component File IDs
- `app/[locale]/dashboard/components/accounts/account-card.tsx`
- `app/[locale]/dashboard/components/accounts/account-configurator.tsx`
- `app/[locale]/dashboard/components/accounts/account-table.tsx`
- `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`
- `app/[locale]/dashboard/components/accounts/accounts-table-view.tsx`
- `app/[locale]/dashboard/components/accounts/propfirms-comparison-table.tsx`
- `app/[locale]/dashboard/components/accounts/suggestion-input.tsx`
- `app/[locale]/dashboard/components/accounts/trade-progress-chart.tsx`
- `app/[locale]/dashboard/components/add-widget-sheet.tsx`
- `app/[locale]/dashboard/components/analysis/accounts-analysis.tsx`
- `app/[locale]/dashboard/components/analysis/analysis-overview.tsx`
- `app/[locale]/dashboard/components/analysis/analysis-skeleton.tsx`
- `app/[locale]/dashboard/components/calendar/calendar-widget.tsx`
- `app/[locale]/dashboard/components/calendar/charts.tsx`
- `app/[locale]/dashboard/components/calendar/daily-comment.tsx`
- `app/[locale]/dashboard/components/calendar/daily-modal.tsx`
- `app/[locale]/dashboard/components/calendar/daily-mood.tsx`
- `app/[locale]/dashboard/components/calendar/daily-stats.tsx`
- `app/[locale]/dashboard/components/calendar/desktop-calendar.tsx`
- `app/[locale]/dashboard/components/calendar/mobile-calendar.tsx`
- `app/[locale]/dashboard/components/calendar/mood-selector.tsx`
- `app/[locale]/dashboard/components/calendar/weekly-calendar.tsx`
- `app/[locale]/dashboard/components/calendar/weekly-modal.tsx`
- `app/[locale]/dashboard/components/chart-the-future-panel.tsx`
- `app/[locale]/dashboard/components/charts/account-selection-popover.tsx`
- `app/[locale]/dashboard/components/charts/commissions-pnl.tsx`
- `app/[locale]/dashboard/components/charts/contract-quantity.tsx`
- `app/[locale]/dashboard/components/charts/daily-tick-target.tsx`
- `app/[locale]/dashboard/components/charts/equity-chart.tsx`
- `app/[locale]/dashboard/components/charts/pnl-bar-chart.tsx`
- `app/[locale]/dashboard/components/charts/pnl-by-side.tsx`
- `app/[locale]/dashboard/components/charts/pnl-per-contract-daily.tsx`
- `app/[locale]/dashboard/components/charts/pnl-per-contract.tsx`
- `app/[locale]/dashboard/components/charts/pnl-time-bar-chart.tsx`
- `app/[locale]/dashboard/components/charts/tick-distribution.tsx`
- `app/[locale]/dashboard/components/charts/time-in-position.tsx`
- `app/[locale]/dashboard/components/charts/time-range-performance.tsx`
- `app/[locale]/dashboard/components/charts/trade-distribution.tsx`
- `app/[locale]/dashboard/components/charts/weekday-pnl.tsx`
- `app/[locale]/dashboard/components/chat/bot-message.tsx`
- `app/[locale]/dashboard/components/chat/chat.tsx`
- `app/[locale]/dashboard/components/chat/equity-chart-message.tsx`
- `app/[locale]/dashboard/components/chat/header.tsx`
- `app/[locale]/dashboard/components/chat/input.tsx`
- `app/[locale]/dashboard/components/chat/user-message.tsx`
- `app/[locale]/dashboard/components/daily-summary-modal.tsx`
- `app/[locale]/dashboard/components/dashboard-header.tsx`
- `app/[locale]/dashboard/components/filters/account-coin.tsx`
- `app/[locale]/dashboard/components/filters/account-filter.tsx`
- `app/[locale]/dashboard/components/filters/account-group-board.tsx`
- `app/[locale]/dashboard/components/filters/account-group.tsx`
- `app/[locale]/dashboard/components/filters/active-filter-tags.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu-account-section.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu-instrument-section.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu-pnl-section.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu-tag-section.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu.tsx`
- `app/[locale]/dashboard/components/filters/filter-dropdown.tsx`
- `app/[locale]/dashboard/components/filters/filter-dropdowns.tsx`
- `app/[locale]/dashboard/components/filters/filter-selection.tsx`
- `app/[locale]/dashboard/components/filters/filters.tsx`
- `app/[locale]/dashboard/components/filters/instrument-filter-simple.tsx`
- `app/[locale]/dashboard/components/filters/instrument-filter.tsx`
- `app/[locale]/dashboard/components/filters/pnl-filter-simple.tsx`
- `app/[locale]/dashboard/components/filters/pnl-filter.tsx`
- `app/[locale]/dashboard/components/filters/pnl-range-filter.tsx`
- `app/[locale]/dashboard/components/filters/tag-filter.tsx`
- `app/[locale]/dashboard/components/filters/tag-widget.tsx`
- `app/[locale]/dashboard/components/global-sync-button.tsx`
- `app/[locale]/dashboard/components/import/account-selection.tsx`
- `app/[locale]/dashboard/components/import/atas/atas-file-upload.tsx`
- `app/[locale]/dashboard/components/import/atas/atas-processor.tsx`
- `app/[locale]/dashboard/components/import/column-mapping.tsx`
- `app/[locale]/dashboard/components/import/components/format-preview.tsx`
- `app/[locale]/dashboard/components/import/components/import-dialog-footer.tsx`
- `app/[locale]/dashboard/components/import/components/import-dialog-header.tsx`
- `app/[locale]/dashboard/components/import/components/platform-card.tsx`
- `app/[locale]/dashboard/components/import/components/platform-item.tsx`
- `app/[locale]/dashboard/components/import/components/platform-tutorial.tsx`
- `app/[locale]/dashboard/components/import/config/platforms.tsx`
- `app/[locale]/dashboard/components/import/etp/etp-sync.tsx`
- `app/[locale]/dashboard/components/import/file-upload.tsx`
- `app/[locale]/dashboard/components/import/ftmo/ftmo-processor.tsx`
- `app/[locale]/dashboard/components/import/header-selection.tsx`
- `app/[locale]/dashboard/components/import/ibkr-pdf/pdf-processing.tsx`
- `app/[locale]/dashboard/components/import/ibkr-pdf/pdf-upload.tsx`
- `app/[locale]/dashboard/components/import/import-button.tsx`
- `app/[locale]/dashboard/components/import/import-type-selection.tsx`
- `app/[locale]/dashboard/components/import/manual/manual-processor.tsx`
- `app/[locale]/dashboard/components/import/ninjatrader/ninjatrader-performance-processor.tsx`
- `app/[locale]/dashboard/components/import/quantower/quantower-processor.tsx`
- `app/[locale]/dashboard/components/import/rithmic/rithmic-order-processor-new.tsx`
- `app/[locale]/dashboard/components/import/rithmic/rithmic-performance-processor.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-credentials-manager.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-notifications.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-sync-connection.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-sync-progress.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/sync-countdown.tsx`
- `app/[locale]/dashboard/components/import/thor/thor-sync.tsx`
- `app/[locale]/dashboard/components/import/topstep/topstep-processor.tsx`
- `app/[locale]/dashboard/components/import/tradezella/tradezella-processor.tsx`
- `app/[locale]/dashboard/components/import/tradovate/tradovate-credentials-manager.tsx`
- `app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx`
- `app/[locale]/dashboard/components/import/tradovate/tradovate-sync.tsx`
- `app/[locale]/dashboard/components/importance-filter.tsx`
- `app/[locale]/dashboard/components/lazy-widget.tsx`
- `app/[locale]/dashboard/components/mindset/day-tag-selector.tsx`
- `app/[locale]/dashboard/components/mindset/emotion-selector.tsx`
- `app/[locale]/dashboard/components/mindset/hourly-financial-timeline.tsx`
- `app/[locale]/dashboard/components/mindset/journaling.tsx`
- `app/[locale]/dashboard/components/mindset/mindset-summary.tsx`
- `app/[locale]/dashboard/components/mindset/mindset-widget.tsx`
- `app/[locale]/dashboard/components/mindset/news-impact.tsx`
- `app/[locale]/dashboard/components/mindset/timeline.tsx`
- `app/[locale]/dashboard/components/navbar.tsx`
- `app/[locale]/dashboard/components/pnl-summary.tsx`
- `app/[locale]/dashboard/components/share-button.tsx`
- `app/[locale]/dashboard/components/shared-layouts-manager.tsx`
- `app/[locale]/dashboard/components/statistics/average-position-time-card.tsx`
- `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx`
- `app/[locale]/dashboard/components/statistics/long-short-card.tsx`
- `app/[locale]/dashboard/components/statistics/profit-factor-card.tsx`
- `app/[locale]/dashboard/components/statistics/risk-reward-ratio-card.tsx`
- `app/[locale]/dashboard/components/statistics/statistics-widget.tsx`
- `app/[locale]/dashboard/components/statistics/trade-performance-card.tsx`
- `app/[locale]/dashboard/components/statistics/winning-streak-card.tsx`
- `app/[locale]/dashboard/components/tables/bulk-edit-panel.tsx`
- `app/[locale]/dashboard/components/tables/column-header.tsx`
- `app/[locale]/dashboard/components/tables/editable-instrument-cell.tsx`
- `app/[locale]/dashboard/components/tables/editable-time-cell.tsx`
- `app/[locale]/dashboard/components/tables/trade-comment.tsx`
- `app/[locale]/dashboard/components/tables/trade-image-editor.tsx`
- `app/[locale]/dashboard/components/tables/trade-table-review.tsx`
- `app/[locale]/dashboard/components/tables/trade-tag.tsx`
- `app/[locale]/dashboard/components/tables/trade-video-url.tsx`
- `app/[locale]/dashboard/components/toolbar.tsx`
- `app/[locale]/dashboard/components/top-nav.tsx`
- `app/[locale]/dashboard/components/user-menu.tsx`
- `app/[locale]/dashboard/components/widget-canvas.tsx`
- `app/[locale]/dashboard/components/widgets/expectancy-widget.tsx`
- `app/[locale]/dashboard/components/widgets/risk-metrics-widget.tsx`
- `app/[locale]/dashboard/components/widgets/trading-score-widget.tsx`

### Dashboard Data and Config File IDs
- `app/[locale]/dashboard/config/widget-registry.tsx`
- `app/[locale]/dashboard/dashboard-context.tsx`
- `app/[locale]/dashboard/dashboard-context-auto-save.tsx`
- `app/[locale]/dashboard/data/components/data-management/account-equity-chart.tsx`
- `app/[locale]/dashboard/data/components/data-management/data-management-card.tsx`

### End-to-End Locale App Component File IDs
Includes home, landing, auth, admin, teams, shared, embed, and dashboard TSX files:
- `app/[locale]/(authentication)/authentication/page.tsx`
- `app/[locale]/(authentication)/components/user-auth-form.tsx`
- `app/[locale]/(authentication)/layout.tsx`
- `app/[locale]/(home)/components/AnalysisDemo.tsx`
- `app/[locale]/(home)/components/CTA.tsx`
- `app/[locale]/(home)/components/DeferredHomeSections.tsx`
- `app/[locale]/(home)/components/Differentiators.tsx`
- `app/[locale]/(home)/components/Features.tsx`
- `app/[locale]/(home)/components/Footer.tsx`
- `app/[locale]/(home)/components/Hero.tsx`
- `app/[locale]/(home)/components/HomeContent.tsx`
- `app/[locale]/(home)/components/HowItWorks.tsx`
- `app/[locale]/(home)/components/Navigation.tsx`
- `app/[locale]/(home)/components/ProblemStatement.tsx`
- `app/[locale]/(home)/components/Qualification.tsx`
- `app/[locale]/(home)/layout.tsx`
- `app/[locale]/(home)/loading.tsx`
- `app/[locale]/(home)/page.tsx`
- `app/[locale]/(landing)/_updates/[slug]/opengraph-image.tsx`
- `app/[locale]/(landing)/_updates/[slug]/page.tsx`
- `app/[locale]/(landing)/_updates/page.tsx`
- `app/[locale]/(landing)/about/page.tsx`
- `app/[locale]/(landing)/community/components/auth-prompt.tsx`
- `app/[locale]/(landing)/community/components/comment-section.tsx`
- `app/[locale]/(landing)/community/components/copy-notification.tsx`
- `app/[locale]/(landing)/community/components/create-post.tsx`
- `app/[locale]/(landing)/community/components/post-card.tsx`
- `app/[locale]/(landing)/community/components/post-list.tsx`
- `app/[locale]/(landing)/community/page.tsx`
- `app/[locale]/(landing)/community/post/[id]/loading.tsx`
- `app/[locale]/(landing)/community/post/[id]/not-found.tsx`
- `app/[locale]/(landing)/community/post/[id]/page.tsx`
- `app/[locale]/(landing)/components/ai-feature.tsx`
- `app/[locale]/(landing)/components/calendar-preview.tsx`
- `app/[locale]/(landing)/components/card-showcase.tsx`
- `app/[locale]/(landing)/components/chat-feature.tsx`
- `app/[locale]/(landing)/components/completed-timeline.tsx`
- `app/[locale]/(landing)/components/faq.tsx`
- `app/[locale]/(landing)/components/features.tsx`
- `app/[locale]/(landing)/components/footer.tsx`
- `app/[locale]/(landing)/components/hero.tsx`
- `app/[locale]/(landing)/components/how-it-works.tsx`
- `app/[locale]/(landing)/components/import-feature.tsx`
- `app/[locale]/(landing)/components/marketing-layout-shell.tsx`
- `app/[locale]/(landing)/components/navbar.tsx`
- `app/[locale]/(landing)/components/partners.tsx`
- `app/[locale]/(landing)/components/performance-visualization-chart.tsx`
- `app/[locale]/(landing)/components/pnl-per-contract-preview.tsx`
- `app/[locale]/(landing)/components/problem-statement.tsx`
- `app/[locale]/(landing)/components/qualification.tsx`
- `app/[locale]/(landing)/disclaimers/page.tsx`
- `app/[locale]/(landing)/docs/page.tsx`
- `app/[locale]/(landing)/faq/page.tsx`
- `app/[locale]/(landing)/layout.tsx`
- `app/[locale]/(landing)/maintenance/page.tsx`
- `app/[locale]/(landing)/newsletter/page.tsx`
- `app/[locale]/(landing)/pricing/page.tsx`
- `app/[locale]/(landing)/privacy/page.tsx`
- `app/[locale]/(landing)/propfirms/components/accounts-bar-chart.tsx`
- `app/[locale]/(landing)/propfirms/components/sort-controls.tsx`
- `app/[locale]/(landing)/propfirms/components/timeframe-controls.tsx`
- `app/[locale]/(landing)/propfirms/page.tsx`
- `app/[locale]/(landing)/referral/page.tsx`
- `app/[locale]/(landing)/support/components/support-form.tsx`
- `app/[locale]/(landing)/support/page.tsx`
- `app/[locale]/(landing)/terms/page.tsx`
- `app/[locale]/(landing)/updates/[slug]/opengraph-image.tsx`
- `app/[locale]/(landing)/updates/[slug]/page.tsx`
- `app/[locale]/(landing)/updates/page.tsx`
- `app/[locale]/[...not-found]/page.tsx`
- `app/[locale]/admin/components/dashboard/admin-dashboard.tsx`
- `app/[locale]/admin/components/dashboard/free-users-table.tsx`
- `app/[locale]/admin/components/dashboard/user-growth-chart.tsx`
- `app/[locale]/admin/components/newsletter/newsletter-audio-extractor.tsx`
- `app/[locale]/admin/components/newsletter/newsletter-audio-player.tsx`
- `app/[locale]/admin/components/newsletter/newsletter-audio-splitter.tsx`
- `app/[locale]/admin/components/newsletter/newsletter-context.tsx`
- `app/[locale]/admin/components/newsletter/newsletter-editor.tsx`
- `app/[locale]/admin/components/newsletter/newsletter-preview.tsx`
- `app/[locale]/admin/components/newsletter/newsletter-transcription.tsx`
- `app/[locale]/admin/components/newsletter/subscriber-table.tsx`
- `app/[locale]/admin/components/payments/subscriptions-table.tsx`
- `app/[locale]/admin/components/payments/transactions-table.tsx`
- `app/[locale]/admin/components/send-email/email-preview.tsx`
- `app/[locale]/admin/components/send-email/email-template-selector.tsx`
- `app/[locale]/admin/components/send-email/send-email-page-client.tsx`
- `app/[locale]/admin/components/send-email/user-selector.tsx`
- `app/[locale]/admin/components/sidebar-nav.tsx`
- `app/[locale]/admin/components/theme-switcher.tsx`
- `app/[locale]/admin/components/weekly-stats/email-preview-loading.tsx`
- `app/[locale]/admin/components/weekly-stats/weekly-recap-context.tsx`
- `app/[locale]/admin/components/weekly-stats/weekly-recap-preview.tsx`
- `app/[locale]/admin/components/welcome-email/welcome-email-context.tsx`
- `app/[locale]/admin/components/welcome-email/welcome-email-preview.tsx`
- `app/[locale]/admin/layout.tsx`
- `app/[locale]/admin/newsletter-builder/page.tsx`
- `app/[locale]/admin/page.tsx`
- `app/[locale]/admin/send-email/page.tsx`
- `app/[locale]/admin/weekly-recap/page.tsx`
- `app/[locale]/admin/welcome-email/loading.tsx`
- `app/[locale]/admin/welcome-email/page.tsx`
- `app/[locale]/dashboard/behavior/page.tsx`
- `app/[locale]/dashboard/billing/components/billing-management.tsx`
- `app/[locale]/dashboard/billing/page.tsx`
- `app/[locale]/dashboard/components/accounts/account-card.tsx`
- `app/[locale]/dashboard/components/accounts/account-configurator.tsx`
- `app/[locale]/dashboard/components/accounts/account-table.tsx`
- `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`
- `app/[locale]/dashboard/components/accounts/accounts-table-view.tsx`
- `app/[locale]/dashboard/components/accounts/propfirms-comparison-table.tsx`
- `app/[locale]/dashboard/components/accounts/suggestion-input.tsx`
- `app/[locale]/dashboard/components/accounts/trade-progress-chart.tsx`
- `app/[locale]/dashboard/components/add-widget-sheet.tsx`
- `app/[locale]/dashboard/components/analysis/accounts-analysis.tsx`
- `app/[locale]/dashboard/components/analysis/analysis-overview.tsx`
- `app/[locale]/dashboard/components/analysis/analysis-skeleton.tsx`
- `app/[locale]/dashboard/components/calendar/calendar-widget.tsx`
- `app/[locale]/dashboard/components/calendar/charts.tsx`
- `app/[locale]/dashboard/components/calendar/daily-comment.tsx`
- `app/[locale]/dashboard/components/calendar/daily-modal.tsx`
- `app/[locale]/dashboard/components/calendar/daily-mood.tsx`
- `app/[locale]/dashboard/components/calendar/daily-stats.tsx`
- `app/[locale]/dashboard/components/calendar/desktop-calendar.tsx`
- `app/[locale]/dashboard/components/calendar/mobile-calendar.tsx`
- `app/[locale]/dashboard/components/calendar/mood-selector.tsx`
- `app/[locale]/dashboard/components/calendar/weekly-calendar.tsx`
- `app/[locale]/dashboard/components/calendar/weekly-modal.tsx`
- `app/[locale]/dashboard/components/chart-the-future-panel.tsx`
- `app/[locale]/dashboard/components/charts/account-selection-popover.tsx`
- `app/[locale]/dashboard/components/charts/commissions-pnl.tsx`
- `app/[locale]/dashboard/components/charts/contract-quantity.tsx`
- `app/[locale]/dashboard/components/charts/daily-tick-target.tsx`
- `app/[locale]/dashboard/components/charts/equity-chart.tsx`
- `app/[locale]/dashboard/components/charts/pnl-bar-chart.tsx`
- `app/[locale]/dashboard/components/charts/pnl-by-side.tsx`
- `app/[locale]/dashboard/components/charts/pnl-per-contract-daily.tsx`
- `app/[locale]/dashboard/components/charts/pnl-per-contract.tsx`
- `app/[locale]/dashboard/components/charts/pnl-time-bar-chart.tsx`
- `app/[locale]/dashboard/components/charts/tick-distribution.tsx`
- `app/[locale]/dashboard/components/charts/time-in-position.tsx`
- `app/[locale]/dashboard/components/charts/time-range-performance.tsx`
- `app/[locale]/dashboard/components/charts/trade-distribution.tsx`
- `app/[locale]/dashboard/components/charts/weekday-pnl.tsx`
- `app/[locale]/dashboard/components/chat/bot-message.tsx`
- `app/[locale]/dashboard/components/chat/chat.tsx`
- `app/[locale]/dashboard/components/chat/equity-chart-message.tsx`
- `app/[locale]/dashboard/components/chat/header.tsx`
- `app/[locale]/dashboard/components/chat/input.tsx`
- `app/[locale]/dashboard/components/chat/user-message.tsx`
- `app/[locale]/dashboard/components/daily-summary-modal.tsx`
- `app/[locale]/dashboard/components/dashboard-header.tsx`
- `app/[locale]/dashboard/components/filters/account-coin.tsx`
- `app/[locale]/dashboard/components/filters/account-filter.tsx`
- `app/[locale]/dashboard/components/filters/account-group-board.tsx`
- `app/[locale]/dashboard/components/filters/account-group.tsx`
- `app/[locale]/dashboard/components/filters/active-filter-tags.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu-account-section.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu-date-section.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu-instrument-section.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu-pnl-section.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu-tag-section.tsx`
- `app/[locale]/dashboard/components/filters/filter-command-menu.tsx`
- `app/[locale]/dashboard/components/filters/filter-dropdown.tsx`
- `app/[locale]/dashboard/components/filters/filter-dropdowns.tsx`
- `app/[locale]/dashboard/components/filters/filter-selection.tsx`
- `app/[locale]/dashboard/components/filters/filters.tsx`
- `app/[locale]/dashboard/components/filters/instrument-filter-simple.tsx`
- `app/[locale]/dashboard/components/filters/instrument-filter.tsx`
- `app/[locale]/dashboard/components/filters/pnl-filter-simple.tsx`
- `app/[locale]/dashboard/components/filters/pnl-filter.tsx`
- `app/[locale]/dashboard/components/filters/pnl-range-filter.tsx`
- `app/[locale]/dashboard/components/filters/tag-filter.tsx`
- `app/[locale]/dashboard/components/filters/tag-widget.tsx`
- `app/[locale]/dashboard/components/global-sync-button.tsx`
- `app/[locale]/dashboard/components/import/account-selection.tsx`
- `app/[locale]/dashboard/components/import/atas/atas-file-upload.tsx`
- `app/[locale]/dashboard/components/import/atas/atas-processor.tsx`
- `app/[locale]/dashboard/components/import/column-mapping.tsx`
- `app/[locale]/dashboard/components/import/components/format-preview.tsx`
- `app/[locale]/dashboard/components/import/components/import-dialog-footer.tsx`
- `app/[locale]/dashboard/components/import/components/import-dialog-header.tsx`
- `app/[locale]/dashboard/components/import/components/platform-card.tsx`
- `app/[locale]/dashboard/components/import/components/platform-item.tsx`
- `app/[locale]/dashboard/components/import/components/platform-tutorial.tsx`
- `app/[locale]/dashboard/components/import/config/platforms.tsx`
- `app/[locale]/dashboard/components/import/etp/etp-sync.tsx`
- `app/[locale]/dashboard/components/import/file-upload.tsx`
- `app/[locale]/dashboard/components/import/ftmo/ftmo-processor.tsx`
- `app/[locale]/dashboard/components/import/header-selection.tsx`
- `app/[locale]/dashboard/components/import/ibkr-pdf/pdf-processing.tsx`
- `app/[locale]/dashboard/components/import/ibkr-pdf/pdf-upload.tsx`
- `app/[locale]/dashboard/components/import/import-button.tsx`
- `app/[locale]/dashboard/components/import/import-type-selection.tsx`
- `app/[locale]/dashboard/components/import/manual/manual-processor.tsx`
- `app/[locale]/dashboard/components/import/ninjatrader/ninjatrader-performance-processor.tsx`
- `app/[locale]/dashboard/components/import/quantower/quantower-processor.tsx`
- `app/[locale]/dashboard/components/import/rithmic/rithmic-order-processor-new.tsx`
- `app/[locale]/dashboard/components/import/rithmic/rithmic-performance-processor.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-credentials-manager.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-notifications.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-sync-connection.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/rithmic-sync-progress.tsx`
- `app/[locale]/dashboard/components/import/rithmic/sync/sync-countdown.tsx`
- `app/[locale]/dashboard/components/import/thor/thor-sync.tsx`
- `app/[locale]/dashboard/components/import/topstep/topstep-processor.tsx`
- `app/[locale]/dashboard/components/import/tradezella/tradezella-processor.tsx`
- `app/[locale]/dashboard/components/import/tradovate/tradovate-credentials-manager.tsx`
- `app/[locale]/dashboard/components/import/tradovate/tradovate-processor.tsx`
- `app/[locale]/dashboard/components/import/tradovate/tradovate-sync.tsx`
- `app/[locale]/dashboard/components/importance-filter.tsx`
- `app/[locale]/dashboard/components/lazy-widget.tsx`
- `app/[locale]/dashboard/components/mindset/day-tag-selector.tsx`
- `app/[locale]/dashboard/components/mindset/emotion-selector.tsx`
- `app/[locale]/dashboard/components/mindset/hourly-financial-timeline.tsx`
- `app/[locale]/dashboard/components/mindset/journaling.tsx`
- `app/[locale]/dashboard/components/mindset/mindset-summary.tsx`
- `app/[locale]/dashboard/components/mindset/mindset-widget.tsx`
- `app/[locale]/dashboard/components/mindset/news-impact.tsx`
- `app/[locale]/dashboard/components/mindset/timeline.tsx`
- `app/[locale]/dashboard/components/navbar.tsx`
- `app/[locale]/dashboard/components/pnl-summary.tsx`
- `app/[locale]/dashboard/components/share-button.tsx`
- `app/[locale]/dashboard/components/shared-layouts-manager.tsx`
- `app/[locale]/dashboard/components/statistics/average-position-time-card.tsx`
- `app/[locale]/dashboard/components/statistics/cumulative-pnl-card.tsx`
- `app/[locale]/dashboard/components/statistics/long-short-card.tsx`
- `app/[locale]/dashboard/components/statistics/profit-factor-card.tsx`
- `app/[locale]/dashboard/components/statistics/risk-reward-ratio-card.tsx`
- `app/[locale]/dashboard/components/statistics/statistics-widget.tsx`
- `app/[locale]/dashboard/components/statistics/trade-performance-card.tsx`
- `app/[locale]/dashboard/components/statistics/winning-streak-card.tsx`
- `app/[locale]/dashboard/components/tables/bulk-edit-panel.tsx`
- `app/[locale]/dashboard/components/tables/column-header.tsx`
- `app/[locale]/dashboard/components/tables/editable-instrument-cell.tsx`
- `app/[locale]/dashboard/components/tables/editable-time-cell.tsx`
- `app/[locale]/dashboard/components/tables/trade-comment.tsx`
- `app/[locale]/dashboard/components/tables/trade-image-editor.tsx`
- `app/[locale]/dashboard/components/tables/trade-table-review.tsx`
- `app/[locale]/dashboard/components/tables/trade-tag.tsx`
- `app/[locale]/dashboard/components/tables/trade-video-url.tsx`
- `app/[locale]/dashboard/components/toolbar.tsx`
- `app/[locale]/dashboard/components/top-nav.tsx`
- `app/[locale]/dashboard/components/user-menu.tsx`
- `app/[locale]/dashboard/components/widget-canvas.tsx`
- `app/[locale]/dashboard/components/widgets/expectancy-widget.tsx`
- `app/[locale]/dashboard/components/widgets/risk-metrics-widget.tsx`
- `app/[locale]/dashboard/components/widgets/trading-score-widget.tsx`
- `app/[locale]/dashboard/config/widget-registry.tsx`
- `app/[locale]/dashboard/dashboard-context-auto-save.tsx`
- `app/[locale]/dashboard/dashboard-context.tsx`
- `app/[locale]/dashboard/data/components/data-management/account-equity-chart.tsx`
- `app/[locale]/dashboard/data/components/data-management/data-management-card.tsx`
- `app/[locale]/dashboard/data/page.tsx`
- `app/[locale]/dashboard/import/page.tsx`
- `app/[locale]/dashboard/layout.tsx`
- `app/[locale]/dashboard/loading.tsx`
- `app/[locale]/dashboard/page.tsx`
- `app/[locale]/dashboard/reports/page.tsx`
- `app/[locale]/dashboard/settings/page.tsx`
- `app/[locale]/dashboard/strategies/page.tsx`
- `app/[locale]/dashboard/trader-profile/page.tsx`
- `app/[locale]/embed/components/commissions-pnl.tsx`
- `app/[locale]/embed/components/contract-quantity.tsx`
- `app/[locale]/embed/components/pnl-bar-chart.tsx`
- `app/[locale]/embed/components/pnl-by-side.tsx`
- `app/[locale]/embed/components/pnl-per-contract-daily.tsx`
- `app/[locale]/embed/components/pnl-per-contract.tsx`
- `app/[locale]/embed/components/pnl-time-bar-chart.tsx`
- `app/[locale]/embed/components/tick-distribution.tsx`
- `app/[locale]/embed/components/time-in-position.tsx`
- `app/[locale]/embed/components/time-range-performance.tsx`
- `app/[locale]/embed/components/trade-distribution.tsx`
- `app/[locale]/embed/components/weekday-pnl.tsx`
- `app/[locale]/embed/page.tsx`
- `app/[locale]/layout.tsx`
- `app/[locale]/shared/[slug]/layout.tsx`
- `app/[locale]/shared/[slug]/opengraph-image.tsx`
- `app/[locale]/shared/[slug]/page.tsx`
- `app/[locale]/shared/[slug]/shared-page-client.tsx`
- `app/[locale]/shared/[slug]/shared-widget-canvas.tsx`
- `app/[locale]/teams/(landing)/layout.tsx`
- `app/[locale]/teams/(landing)/page.tsx`
- `app/[locale]/teams/components/auth-profile-button-skeleton.tsx`
- `app/[locale]/teams/components/auth-profile-button.tsx`
- `app/[locale]/teams/components/logout-button.tsx`
- `app/[locale]/teams/components/team-management.tsx`
- `app/[locale]/teams/components/team-navbar.tsx`
- `app/[locale]/teams/components/team-subscription-badge-client.tsx`
- `app/[locale]/teams/components/team-subscription-badge.tsx`
- `app/[locale]/teams/components/teams-sidebar.tsx`
- `app/[locale]/teams/components/theme-switcher.tsx`
- `app/[locale]/teams/components/trader-info.tsx`
- `app/[locale]/teams/components/user-equity/team-equity-grid-client.tsx`
- `app/[locale]/teams/components/user-equity/user-equity-chart.tsx`
- `app/[locale]/teams/dashboard/[slug]/analytics/page.tsx`
- `app/[locale]/teams/dashboard/[slug]/members/page.tsx`
- `app/[locale]/teams/dashboard/[slug]/page.tsx`
- `app/[locale]/teams/dashboard/[slug]/traders/page.tsx`
- `app/[locale]/teams/dashboard/layout.tsx`
- `app/[locale]/teams/dashboard/page.tsx`
- `app/[locale]/teams/dashboard/trader/[slug]/page.tsx`
- `app/[locale]/teams/join/page.tsx`
- `app/[locale]/teams/layout.tsx`
- `app/[locale]/teams/manage/layout.tsx`
- `app/[locale]/teams/manage/page.tsx`

### Shared Reusable Components (`/components`) File IDs
Includes UI primitives, sidebars, providers, editors, email templates, and feature utilities:
- `components/SparkChart.tsx`
- `components/ai-activated.tsx`
- `components/ai-elements/actions.tsx`
- `components/ai-elements/artifact.tsx`
- `components/ai-elements/branch.tsx`
- `components/ai-elements/chain-of-thought.tsx`
- `components/ai-elements/context.tsx`
- `components/ai-elements/conversation.tsx`
- `components/ai-elements/image.tsx`
- `components/ai-elements/inline-citation.tsx`
- `components/ai-elements/loader.tsx`
- `components/ai-elements/message.tsx`
- `components/ai-elements/news-sub-menu.tsx`
- `components/ai-elements/open-in-chat.tsx`
- `components/ai-elements/prompt-input.tsx`
- `components/ai-elements/reasoning.tsx`
- `components/ai-elements/response-test.tsx`
- `components/ai-elements/response.tsx`
- `components/ai-elements/sources.tsx`
- `components/ai-elements/suggestion.tsx`
- `components/ai-elements/task.tsx`
- `components/ai-elements/web-preview.tsx`
- `components/animated-icons/calendar-days.tsx`
- `components/animated-icons/clipboard-check.tsx`
- `components/animated-icons/upload.tsx`
- `components/animated-icons/users.tsx`
- `components/auth/auth-timeout.tsx`
- `components/consent-banner.tsx`
- `components/country-filter.tsx`
- `components/emails/black-friday.tsx`
- `components/emails/blog/comment-notification.tsx`
- `components/emails/missing-data.tsx`
- `components/emails/new-feature.tsx`
- `components/emails/renewal-notice.tsx`
- `components/emails/support-request.tsx`
- `components/emails/support-subscription-error.tsx`
- `components/emails/team-invitation.tsx`
- `components/emails/weekly-recap.tsx`
- `components/emails/welcome.tsx`
- `components/export-button.tsx`
- `components/icons.tsx`
- `components/lazy/charts.tsx`
- `components/lazy/consent-banner-lazy.tsx`
- `components/lazy/scroll-lock-fix-lazy.tsx`
- `components/linked-accounts.tsx`
- `components/logo.tsx`
- `components/magicui/animated-beam.tsx`
- `components/mdx-sidebar.tsx`
- `components/modals.tsx`
- `components/onboarding-modal.tsx`
- `components/pricing-plans.tsx`
- `components/providers/dashboard-providers.tsx`
- `components/providers/root-providers.tsx`
- `components/referral-button.tsx`
- `components/scroll-lock-fix.tsx`
- `components/sidebar/aimodel-sidebar.tsx`
- `components/sidebar/dashboard-sidebar.tsx`
- `components/subscription-badge.tsx`
- `components/theme-switcher.tsx`
- `components/tiptap-editor.tsx`
- `components/tiptap/menu-bar.tsx`
- `components/tiptap/optimized-bubble-menu.tsx`
- `components/ui/accordion.tsx`
- `components/ui/action-card.tsx`
- `components/ui/alert-dialog.tsx`
- `components/ui/alert.tsx`
- `components/ui/avatar.tsx`
- `components/ui/badge.tsx`
- `components/ui/button.tsx`
- `components/ui/calendar.tsx`
- `components/ui/card.tsx`
- `components/ui/carousel.tsx`
- `components/ui/chart.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/collapsible.tsx`
- `components/ui/column-config-dialog.tsx`
- `components/ui/command.tsx`
- `components/ui/context-menu.tsx`
- `components/ui/dialog.tsx`
- `components/ui/drawer.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/dropzone.tsx`
- `components/ui/form.tsx`
- `components/ui/glass-card.tsx`
- `components/ui/hover-card.tsx`
- `components/ui/input-otp.tsx`
- `components/ui/input.tsx`
- `components/ui/kbd.tsx`
- `components/ui/label.tsx`
- `components/ui/language-selector.tsx`
- `components/ui/media-card.tsx`
- `components/ui/mood-tracker.tsx`
- `components/ui/navigation-menu.tsx`
- `components/ui/pagination.tsx`
- `components/ui/popover.tsx`
- `components/ui/progress.tsx`
- `components/ui/radio-group.tsx`
- `components/ui/range-filter.tsx`
- `components/ui/resizable.tsx`
- `components/ui/scroll-area.tsx`
- `components/ui/segmented-control.tsx`
- `components/ui/select.tsx`
- `components/ui/separator.tsx`
- `components/ui/sheet-tooltip.tsx`
- `components/ui/sheet.tsx`
- `components/ui/sidebar.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/slider.tsx`
- `components/ui/sonner.tsx`
- `components/ui/stat-tile.tsx`
- `components/ui/stats-card.tsx`
- `components/ui/switch.tsx`
- `components/ui/table.tsx`
- `components/ui/tabs.tsx`
- `components/ui/textarea.tsx`
- `components/ui/tooltip.tsx`
- `components/ui/unified-sidebar.tsx`
- `components/updates-navigation.tsx`
- `components/widget-policy/with-risk-evaluation.tsx`

### How to Read Any Component Quickly (Standard Review Method)
1. Identify route entry (`page.tsx`) and wrapper (`layout.tsx`).
2. Identify top controls (navbar/header/sidebar).
3. Identify state provider/context used by the component.
4. Identify server boundary (server action or `/app/api/**/route.ts`).
5. Identify persistence layer touchpoints (dashboard context, db actions, sync/import modules).

### Component Documentation Rule
When adding a new component, document in this section:
- Component name
- Function
- Main use case
- File ID
