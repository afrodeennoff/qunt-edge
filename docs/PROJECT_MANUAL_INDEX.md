# Qunt Edge Project Handbook

This is the single, structured manual for understanding the project quickly.
Use this document first, then open linked deep-dive catalogs.

## 1. Project In One Minute
Qunt Edge is a trading analytics platform with these core surfaces:
- Public marketing site (landing pages)
- Authentication (sign in/up)
- Trader dashboard (widgets, charts, imports, reports)
- Teams workspace (shared analytics and member views)
- Admin workspace (operations, newsletters, billing support)
- API/service layer (imports, AI, webhooks, scheduled tasks)

Primary correctness areas:
- Trade import and normalization
- Analytics math and metric consistency
- Auth/session boundaries
- Billing/subscription/webhook integrity

## 2. How The App Is Organized

### 2.1 Route and Rendering Model
- `app/[locale]/**`: user-facing localized routes
- `app/api/**/route.ts`: server HTTP endpoints
- `components/**`: reusable UI and feature components
- `server/**`: server-side business logic and DB operations
- `lib/**`: shared utilities, domain helpers, metrics, validation
- `prisma/**`: schema and migrations

### 2.2 File Role Definitions
- `page.tsx`: route entry (first screen for that route)
- `layout.tsx`: persistent shell/guard/provider wrapper
- `components/*.tsx`: composable UI blocks
- `actions.ts`: server actions for mutations and data operations
- `route.ts`: HTTP API boundary for external/internal calls

## 3. User Journey to Code Map

### 3.1 Public Home and Landing
1. User opens `/<locale>`
2. Entry file: `app/[locale]/(home)/page.tsx`
3. Page composition: `app/[locale]/(home)/components/HomeContent.tsx`
4. Hero message/CTA: `app/[locale]/(home)/components/Hero.tsx`
5. Marketing shell with navbar/footer: `app/[locale]/(landing)/components/marketing-layout-shell.tsx`
6. Top navigation: `app/[locale]/(landing)/components/navbar.tsx`
7. Footer: `app/[locale]/(landing)/components/footer.tsx`

### 3.2 Authentication
1. Auth page: `app/[locale]/(authentication)/authentication/page.tsx`
2. Form component: `app/[locale]/(authentication)/components/user-auth-form.tsx`
3. Auth callback: `app/api/auth/callback/route.ts`

### 3.3 Dashboard (Main Product)
1. Layout/auth gate: `app/[locale]/dashboard/layout.tsx`
2. Sidebar navigation: `components/sidebar/dashboard-sidebar.tsx`
3. Header controls: `app/[locale]/dashboard/components/dashboard-header.tsx`
4. Dashboard tabs route: `app/[locale]/dashboard/page.tsx`
5. Widget workspace: `app/[locale]/dashboard/components/widget-canvas.tsx`
6. Trade table workspace: `app/[locale]/dashboard/components/tables/trade-table-review.tsx`
7. Accounts workspace: `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`
8. Chart mode workspace: `app/[locale]/dashboard/components/chart-the-future-panel.tsx`

### 3.4 Data Import Flow
1. User triggers import: `app/[locale]/dashboard/components/import/import-button.tsx`
2. Upload/mapping/parsing components: `app/[locale]/dashboard/components/import/**`
3. Save/validation and persistence paths: `server/database.ts`, import API routes under `app/api/imports/**`

### 3.5 Teams and Admin
- Teams hub: `app/[locale]/teams/**`
- Admin hub: `app/[locale]/admin/**`
- Admin/teams action handlers: `app/[locale]/admin/actions/**`, `app/[locale]/teams/actions/**`

## 4. Dashboard Component Catalog (Practical)

### 4.1 Core Control Components
- `DashboardHeader` -> top control bar for filters/import/share/customize -> `app/[locale]/dashboard/components/dashboard-header.tsx`
- `DashboardSidebar` -> main navigation tree across trading/analytics/system sections -> `components/sidebar/dashboard-sidebar.tsx`
- `AddWidgetSheet` -> widget selection and insertion UI -> `app/[locale]/dashboard/components/add-widget-sheet.tsx`
- `GlobalSyncButton` -> forced data refresh trigger -> `app/[locale]/dashboard/components/global-sync-button.tsx`
- `ShareButton` -> share-link generation action -> `app/[locale]/dashboard/components/share-button.tsx`

### 4.2 Dashboard Feature Packs
- Accounts pack: `app/[locale]/dashboard/components/accounts/**`
- Charts pack: `app/[locale]/dashboard/components/charts/**`
- Filters pack: `app/[locale]/dashboard/components/filters/**`
- Import pack: `app/[locale]/dashboard/components/import/**`
- Mindset/journal pack: `app/[locale]/dashboard/components/mindset/**`
- Tables pack: `app/[locale]/dashboard/components/tables/**`
- Stats cards pack: `app/[locale]/dashboard/components/statistics/**`
- Specialized widgets: `app/[locale]/dashboard/components/widgets/**`

## 5. Where To Edit (Task-Oriented)

### 5.1 Change Home Hero Copy
- Primary file: `app/[locale]/(home)/components/Hero.tsx`
- If marketing shell/nav/footer also affected: `app/[locale]/(landing)/components/navbar.tsx`, `app/[locale]/(landing)/components/footer.tsx`

### 5.2 Add Dashboard Widget
- Register widget: `app/[locale]/dashboard/config/widget-registry.tsx`
- Render logic: `app/[locale]/dashboard/components/widget-canvas.tsx`
- Widget component: `app/[locale]/dashboard/components/widgets/*.tsx`

### 5.3 Modify Import Behavior
- Trigger/dialog flow: `app/[locale]/dashboard/components/import/import-button.tsx`
- Processor path: `app/[locale]/dashboard/components/import/**`
- Persistence/validation: `server/database.ts`

### 5.4 Update Billing Logic
- Routes: `app/[locale]/dashboard/billing/page.tsx`, admin payment components
- Services: `server/payment-service.ts`, `server/subscription-manager.ts`, `server/webhook-service.ts`
- Webhook endpoint: `app/api/whop/webhook/route.ts`

## 6. Change and Commit Manuals
For full file-level and commit-level catalogs, use:
- Component deep map: `docs/COMPONENT_CODE_MAP.md`
- Commit why/how/file IDs: `docs/CHANGE_CATALOG_MANUAL.md`

## 7. Safety Checklist Before Shipping
1. Verify impacted route entry (`page.tsx`) and wrapper (`layout.tsx`).
2. Verify server boundary (`actions.ts` or `route.ts`).
3. Verify state/data normalization path (`context/*`, `server/*`, `lib/*`).
4. Run relevant validation:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`
5. Update docs if behavior changed in imports, analytics, auth, or billing.

## 8. Fast Links
- Agent operating rules: `public/AGENTS.md`
- Combined markdown bundle: `COMBINED_DOCUMENTATION.md`
- Routes snapshot: `public/routes.json`
