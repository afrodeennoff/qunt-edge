# Qunt Edge - Project Structure Analysis

## 📋 Overview

**Qunt Edge** is an open-source trading analytics platform built with Next.js 15+, React 19, TypeScript, and Prisma. It's designed for professional traders to analyze their trading performance, sync broker data, and leverage AI-powered insights.

**License**: Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)

---

## 🎯 Core Functionality

### Main Features
- **Real-time PnL Tracking** with customizable dashboards
- **Multi-Broker Integration** (Tradovate, Rithmic, FTMO, ProjectX, ATAS, IBKR)
- **AI-Powered Trade Analysis** with OpenAI integration
- **Team Collaboration** with shared analytics
- **Internationalization** (English/French)
- **Payment Integration** via Whop
- **Advanced Analytics** with customizable widgets

---

## 🏗️ Architecture Overview

### Technology Stack

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand + React Context
- **Animations**: Framer Motion
- **i18n**: next-international
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts + D3.js
- **Table**: TanStack Table
- **Rich Text**: TipTap editor

#### Backend
- **API**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Auth**: Supabase Auth (Discord OAuth, Email)
- **Storage**: Supabase Storage
- **Cache**: Redis (local) / Upstash (production)
- **Payments**: Whop integration
- **AI**: OpenAI API

#### Development Tools
- **Package Manager**: Bun or npm
- **Type Checking**: TypeScript (strict mode)
- **Linting**: ESLint
- **Testing**: Vitest
- **Database Migrations**: Prisma

---

## 📁 Directory Structure

```
/Users/timon/Downloads/final-qunt-edge-main/
├── 📂 app/                          # Next.js App Router (443 items)
│   ├── 📂 [locale]/                 # Internationalized routes (348 items)
│   │   ├── 📂 (authentication)/     # Auth pages (login, signup)
│   │   ├── 📂 (landing)/            # Marketing pages (63 items)
│   │   ├── 📂 (home)/               # Home pages (15 items)
│   │   ├── 📂 dashboard/            # Main dashboard (172 items)
│   │   │   ├── 📂 components/       # Dashboard widgets (150 items)
│   │   │   ├── 📂 behavior/         # Behavior analytics
│   │   │   ├── 📂 billing/          # Subscription management
│   │   │   ├── 📂 data/             # Data views
│   │   │   ├── 📂 import/           # Trade import
│   │   │   ├── 📂 reports/          # Report generation
│   │   │   ├── 📂 settings/         # User settings
│   │   │   ├── 📂 strategies/       # Trading strategies
│   │   │   ├── 📂 types/            # TypeScript types (5 items)
│   │   │   ├── dashboard-context.tsx
│   │   │   ├── dashboard-context-auto-save.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── 📂 admin/                # Admin panel (41 items)
│   │   ├── 📂 teams/                # Team collaboration (29 items)
│   │   ├── 📂 embed/                # Embeddable widgets (16 items)
│   │   ├── 📂 shared/               # Shared resources (5 items)
│   │   └── 📂 [...not-found]/       # 404 handler
│   ├── 📂 api/                      # API routes (86 items)
│   │   ├── 📂 ai/                   # AI endpoints (49 items)
│   │   ├── 📂 auth/                 # Authentication
│   │   ├── 📂 behavior/             # Behavior tracking
│   │   ├── 📂 cron/                 # Scheduled tasks (5 items)
│   │   ├── 📂 email/                # Email service (7 items)
│   │   ├── 📂 imports/              # Import handlers (6 items)
│   │   ├── 📂 tradovate/            # Tradovate sync (2 items)
│   │   ├── 📂 rithmic/              # Rithmic sync
│   │   ├── 📂 whop/                 # Payment webhooks (3 items)
│   │   ├── 📂 health/               # Health check
│   │   ├── 📂 team/                 # Team management (2 items)
│   │   ├── 📂 referral/             # Referral system
│   │   └── 📂 og/                   # Open Graph images
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── robots.ts
│   └── sitemap.ts
│
├── 📂 components/                   # Reusable components (118 items)
│   ├── 📂 ui/                       # Base UI components (53 items)
│   │   └── (Radix UI wrappers: button, dialog, dropdown, etc.)
│   ├── 📂 ai-elements/              # AI components (20 items)
│   ├── 📂 emails/                   # Email templates (10 items)
│   ├── 📂 tiptap/                   # Rich text editor (2 items)
│   ├── 📂 sidebar/                  # Navigation (2 items)
│   ├── 📂 providers/                # Context providers (2 items)
│   ├── 📂 widget-policy/            # Widget policies
│   ├── consent-banner.tsx
│   ├── export-button.tsx
│   ├── icons.tsx
│   ├── logo.tsx
│   ├── pricing-plans.tsx
│   └── theme-switcher.tsx
│
├── 📂 server/                       # Server-side logic (23 files)
│   ├── auth.ts                      # Authentication logic (25KB)
│   ├── database.ts                  # Main DB operations (29KB)
│   ├── accounts.ts                  # Account management (16KB)
│   ├── trades.ts                    # Trade operations
│   ├── groups.ts                    # Group management
│   ├── tags.ts                      # Tag management
│   ├── equity-chart.ts              # Chart data (15KB)
│   ├── billing.ts                   # Billing logic
│   ├── teams.ts                     # Team operations (14KB)
│   ├── payment-service.ts           # Payment processing (12KB)
│   ├── subscription-manager.ts      # Subscriptions (18KB)
│   ├── webhook-service.ts           # Webhook handlers (22KB)
│   ├── journal.ts                   # Journal entries
│   ├── referral.ts                  # Referral system
│   ├── user-data.ts                 # User data fetching
│   └── shared.ts                    # Shared utilities
│
├── 📂 lib/                          # Utility libraries (68 files)
│   ├── 📂 ai/                       # AI utilities
│   ├── 📂 analytics/                # Analytics metrics (2 items)
│   ├── 📂 domain/                   # Domain logic
│   ├── 📂 indexeddb/                # Client storage
│   ├── 📂 widget-policy-engine/     # Widget policies (13 items)
│   ├── data-types.ts                # Shared type definitions (11KB)
│   ├── utils.ts                     # General utilities (6KB)
│   ├── supabase.ts                  # Supabase client
│   ├── prisma.ts                    # Prisma client (3KB)
│   ├── trade-types.ts               # Trade type definitions
│   ├── account-metrics.ts           # Account calculations (10KB)
│   ├── behavior-insights.ts         # Behavior analysis (9KB)
│   ├── query-optimizer.ts           # Query optimization (8KB)
│   ├── auto-save-service.ts         # Auto-save logic (12KB)
│   ├── widget-persistence-manager.ts # Widget state (12KB)
│   ├── widget-validator.ts          # Widget validation (10KB)
│   ├── financial-math.ts            # Financial calculations
│   ├── date-utils.ts                # Date utilities
│   └── env.ts                       # Environment config
│
├── 📂 store/                        # Zustand state stores (28 files)
│   ├── 📂 filters/                  # Filter stores
│   ├── user-store.ts                # User state (6KB)
│   ├── analysis-store.ts            # Analysis state (5KB)
│   ├── tradovate-sync-store.ts      # Tradovate sync (5KB)
│   ├── rithmic-sync-store.ts        # Rithmic sync (4KB)
│   ├── daily-tick-target-store.ts   # Tick targets (4KB)
│   ├── account-order-store.ts       # Account ordering (3KB)
│   ├── table-config-store.ts        # Table configuration (9KB)
│   ├── equity-chart-store.ts        # Chart state (2KB)
│   ├── subscription-store.ts        # Subscription state
│   └── modal-state-store.ts         # Modal management
│
├── 📂 context/                      # React Context providers (5 files)
│   ├── data-provider.tsx            # Main data provider (57KB)
│   ├── rithmic-sync-context.tsx     # Rithmic sync (28KB)
│   ├── tradovate-sync-context.tsx   # Tradovate sync (10KB)
│   ├── theme-provider.tsx           # Theme state (3KB)
│   └── sync-context.tsx             # General sync (2KB)
│
├── 📂 hooks/                        # Custom React hooks (11 files)
│   ├── use-subscription.tsx         # Subscription hook (7KB)
│   ├── use-hash-upload.ts           # File upload (8KB)
│   ├── use-supabase-upload.ts       # Supabase upload (5KB)
│   ├── use-auto-save.ts             # Auto-save hook (3KB)
│   ├── use-auto-scroll.ts           # Scroll behavior (3KB)
│   ├── use-keyboard-shortcuts.ts    # Keyboard shortcuts
│   ├── use-tradovate-token-manager.ts # Token management
│   ├── use-media-query.ts           # Responsive queries
│   └── use-auth.ts                  # Authentication
│
├── 📂 locales/                      # Internationalization (36 files)
│   ├── en.ts                        # English translations
│   ├── fr.ts                        # French translations
│   └── client.ts / server.ts        # i18n utilities
│
├── 📂 prisma/                       # Database schema (88 files)
│   ├── 📂 migrations/               # Migration history (85 items)
│   ├── 📂 generated/                # Prisma client
│   ├── schema.prisma                # Main schema (27KB, 1178 lines)
│   ├── schema-optimizations.prisma  # Performance optimizations
│   └── webhook-model.prisma         # Webhook schema
│
├── 📂 schemas/                      # Validation schemas (4 files)
│   └── Zod validation schemas
│
├── 📂 scripts/                      # Utility scripts (7 files)
│   ├── sync-stack.mjs               # DB sync script
│   └── generate-routes.ts           # Route generation
│
├── 📂 docs/                         # Documentation (20 files)
│   ├── JOURNAL_EDITOR.md
│   ├── ANALYTICS_METRIC_DEFINITIONS.md
│   ├── INCIDENT_RUNBOOK.md
│   └── PRODUCTION_READINESS_CHECKLIST.md
│
├── 📂 content/                      # MDX content (17 files)
│   └── Update announcements
│
├── 📂 public/                       # Static assets (14 items)
│   └── Images, icons, etc.
│
├── 📂 styles/                       # Global styles (2 files)
│   └── CSS files
│
├── 📂 tests/                        # Test files (5 items)
│   └── Vitest tests
│
├── package.json                     # Dependencies (196 lines)
├── tsconfig.json                    # TypeScript config
├── next.config.ts                   # Next.js config
├── tailwind.config.ts               # Tailwind config (6KB)
├── vitest.config.ts                 # Test config
├── .env                             # Environment variables
├── README.md                        # Project documentation (496 lines)
├── COMBINED_DOCUMENTATION.md        # Combined docs (401KB)
└── docker-compose.yml               # Docker setup

```

---

## 🗄️ Database Schema (Prisma)

### Core Models

#### Authentication & Users
- **User** - User accounts with auth integration
- **Referral** - Referral system
- **Subscription** - User subscriptions
- **DashboardLayout** - Customizable dashboard layouts
- **LayoutVersion** - Layout version history

#### Trading Core
- **Account** - Trading accounts with prop firm details
- **Trade** - Individual trade records
- **Group** - Account groupings
- **Payout** - Payout tracking
- **Order** - Order execution details
- **Synchronization** - Broker sync status

#### Analytics & Market Data
- **TickDetails** - Instrument tick specifications
- **TradeAnalytics** - MAE/MFE calculations
- **HistoricalData** - Market data (Databento)
- **FinancialEvent** - Economic calendar events

#### Collaboration
- **Team** - Trading teams
- **TeamMember** - Team membership
- **TeamSubscription** - Team subscriptions
- **TeamAnalytics** - Team performance metrics
- **Business** - Business accounts
- **Organization** - Multi-team organizations

#### User Content
- **Post** - Feature requests/bug reports
- **Comment** - Post discussions
- **Vote** - Post voting
- **Mood** - Daily mood tracking
- **Tag** - Trade tags
- **Notification** - User notifications

#### Payments (Whop Integration)
- **PaymentTransaction** - Payment records
- **Invoice** - Billing invoices
- **Refund** - Refund processing
- **SubscriptionEvent** - Subscription lifecycle
- **PaymentMethod** - Stored payment methods

---

## 🔑 Key Files & Their Responsibilities

### Data Layer

#### `/context/data-provider.tsx` (57KB)
- **Central data provider** for the entire app
- Fetches user data, accounts, trades, tags
- Manages real-time subscriptions
- Handles data normalization with `decimal.js`
- Provides data to all dashboard components

#### `/server/database.ts` (29KB)
- **Core database operations**
- Trade import/export
- Data validation with Zod
- Hash-based deduplication
- Financial calculations with Decimal.js

#### `/lib/data-types.ts` (11KB)
- **Shared type definitions**
- Normalization functions for:
  - Trades (numeric/date conversion)
  - Accounts
  - Groups
- Type-safe data handling

### Dashboard & Widgets

#### `/app/[locale]/dashboard/page.tsx`
- Main dashboard page
- Widget canvas rendering
- Layout management

#### `/app/[locale]/dashboard/components/` (150 items)
- **widget-canvas.tsx** - Drag-and-drop widget container
- **Widget components**:
  - Expectancy widget
  - PnL charts
  - Win rate metrics
  - Calendar views
  - Trade tables
  - Performance analytics

#### `/app/[locale]/dashboard/dashboard-context.tsx` (12KB)
- Dashboard-specific state
- Widget configuration
- Layout persistence

### Authentication & Authorization

#### `/server/auth.ts` (25KB)
- User authentication
- Session management
- Role-based access control
- OAuth integration (Discord)

### API Routes

#### `/app/api/ai/` (49 items)
- AI-powered features
- Field mapping for imports
- Trade analysis
- Journal insights

#### `/app/api/tradovate/`, `/app/api/rithmic/`
- Broker synchronization
- OAuth callbacks
- Trade data fetching

#### `/app/api/whop/` (3 items)
- Payment webhook handling
- Subscription management
- License validation

### State Management

#### Zustand Stores (`/store/`)
- **user-store.ts** - User preferences
- **analysis-store.ts** - Analytics filters
- **table-config-store.ts** - Table settings
- **tradovate-sync-store.ts** - Sync status
- **account-order-store.ts** - Account ordering

#### React Context (`/context/`)
- **data-provider.tsx** - Global data
- **theme-provider.tsx** - Dark/light mode
- **tradovate-sync-context.tsx** - Sync management
- **rithmic-sync-context.tsx** - Rithmic integration

---

## 🔄 Data Flow

### 1. Authentication Flow
```
User Login → Supabase Auth → server/auth.ts 
→ Create/Update User in DB → Set Session → Redirect to Dashboard
```

### 2. Trade Import Flow
```
Upload CSV → api/imports/parse → AI Field Mapping (if needed)
→ server/database.ts → Validate with Zod → Hash-based Deduplication
→ Insert Trades → Revalidate Cache → Update UI
```

### 3. Broker Sync Flow (Tradovate)
```
User Connects → OAuth → api/tradovate/callback 
→ Store Token → server/accounts.ts → Fetch Trades
→ server/database.ts → Import with Deduplication → Update Dashboard
```

### 4. Dashboard Render Flow
```
context/data-provider.tsx → Fetch All User Data
→ Normalize Data (data-types.ts) → Zustand Stores
→ Dashboard Components → Widget Canvas → Individual Widgets
```

### 5. Payment Flow (Whop)
```
User Subscribes → Whop Checkout → Webhook to api/whop/webhook
→ server/webhook-service.ts → Update Subscription in DB
→ Grant Access → Notify User
```

---

## 🧩 Component Architecture

### UI Component Pattern
```typescript
// Base UI components in components/ui/
// Radix UI primitives wrapped with custom styling

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"

// Business logic components in app/[locale]/dashboard/components/
// Use Zustand stores + data from context

import { useData } from "@/context/data-provider"
import { useAnalysisStore } from "@/store/analysis-store"
```

### Widget Pattern
```typescript
// Each widget is a self-contained component
// Receives data from data-provider context
// Uses Recharts/D3 for visualizations

export function ExpectancyWidget() {
  const { trades } = useData()
  const filters = useAnalysisStore()
  
  // Calculate metrics
  // Render chart
}
```

---

## 🌍 Internationalization (i18n)

### Structure
```
/locales/
├── en.ts      # English translations
├── fr.ts      # French translations
├── client.ts  # Client-side hook
└── server.ts  # Server-side utilities
```

### Usage
```typescript
import { useI18n } from "@/locales/client"

const t = useI18n()
<h1>{t('dashboard.title')}</h1>
<p>{t('dashboard.welcome', { name: user.name })}</p>
```

---

## 🔐 Security Features

### Data Protection
- **Row Level Security (RLS)** via Supabase
- **User data isolation** - users only see their own data
- **API authentication** - all routes require auth
- **Webhook signature verification** - Whop webhooks
- **Environment variable validation** - Zod schemas

### Financial Data
- **decimal.js** for precise calculations
- **Hash-based deduplication** prevents duplicate imports
- **Trade validation** - entry date cannot be in future
- **Commission auto-calculation** based on historical data

---

## ⚡ Performance Optimizations

### Caching Strategy
- **React Query** for API calls
- **Redis/Upstash** for server-side caching
- **Next.js revalidation** with cache tags
- **IndexedDB** for offline widget state

### Database Optimizations
- **Prisma indexes** on frequently queried fields
- **Connection pooling** (PgBouncer via Supabase)
- **Query optimization** - selective field loading
- **Batch operations** for bulk imports

### Frontend Optimizations
- **Code splitting** with Next.js
- **Lazy loading** components
- **Virtualized tables** for large datasets
- **Debounced inputs** for filters

---

## 🧪 Testing

### Test Structure
```
/tests/                  # Integration tests
/lib/__tests__/          # Unit tests for utilities
vitest.config.ts         # Main test config
vitest.payment.config.ts # Payment integration tests
```

### Running Tests
```bash
npm run test                    # Run all tests
npm run test:coverage           # With coverage
npm run test:payment            # Payment tests only
```

---

## 📦 Key Dependencies

### Core
- `next@^16.1.1` - Framework
- `react@19.2.1` - UI library
- `typescript@^5.9.3` - Type safety
- `@prisma/client@^7.2.0` - Database ORM
- `@supabase/supabase-js` - Auth & storage

### UI & Visualization
- `@radix-ui/*` - Accessible components
- `recharts@^2.15.4` - Charts
- `d3@^7.9.0` - Data visualization
- `framer-motion@^11.18.2` - Animations
- `@tanstack/react-table@^8.21.3` - Tables

### State & Forms
- `zustand@^5.0.8` - State management
- `react-hook-form@^7.65.0` - Form handling
- `zod@^4.3.6` - Validation

### AI & Services
- `openai@^6.7.0` - AI integration
- `@whop/sdk@^0.0.23` - Payment integration
- `resend@^4.8.0` - Email service
- `decimal.js@^10.6.0` - Financial math

### Development
- `vitest@^2.1.9` - Testing
- `eslint@^9` - Linting
- `tailwindcss@^4.1.16` - Styling

---

## 🚀 Deployment

### Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Environment Variables (Production)
```bash
# Required in Vercel
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DIRECT_URL
OPENAI_API_KEY
WHOP_SECRET_KEY
WHOP_WEBHOOK_SECRET
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

### Docker Support
- `Dockerfile.bun` - Production container
- `docker-compose.yml` - Development setup
- `docker-compose.prod.yml` - Production stack

---

## 📚 Documentation Files

### Developer Docs
- `README.md` - Setup & overview
- `COMBINED_DOCUMENTATION.md` - All docs combined (401KB)
- `docs/JOURNAL_EDITOR.md` - Journal feature
- `docs/ANALYTICS_METRIC_DEFINITIONS.md` - Metric formulas
- `docs/INCIDENT_RUNBOOK.md` - Emergency procedures
- `docs/PRODUCTION_READINESS_CHECKLIST.md` - Deployment checklist

### Change Logs
- `CHANGELOG_SECURITY.md` - Security updates
- `IMPORT_FIX_SUMMARY.md` - Import fixes
- `ROUTE_MAPPING_VERIFICATION.md` - Route verification

---

## 🔧 Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run dev server
npm run dev
```

### Code Quality
```bash
npm run lint           # ESLint
npm run typecheck      # TypeScript
npm run test           # Unit tests
npm run bundle:check   # Build verification
```

### Database Management
```bash
npx prisma studio      # Visual DB editor
npx prisma migrate dev # Create migration
npx prisma db push     # Push schema changes
npm run db:sync        # Sync with Supabase
```

---

## 🎨 Design System

### Colors
- Defined in `tailwind.config.ts`
- Theme-aware (light/dark)
- Accessible contrast ratios
- Custom color tokens in `lib/color-tokens.ts`

### Components
- Base components in `components/ui/`
- Dashboard widgets in `app/[locale]/dashboard/components/`
- Consistent spacing with Tailwind utilities
- Responsive breakpoints: mobile, tablet, desktop

### Typography
- Google Fonts integration
- Consistent font sizes
- Proper heading hierarchy

---

## 🔄 Recent Refactoring (From Conversation History)

### Data Normalization
- Moved normalization to `lib/data-types.ts`
- Centralized `decimal.js` usage
- Fixed type errors across codebase

### Trade Import Hardening
- Added Zod validation for all imports
- Implemented hash-based deduplication
- Future date validation
- User-specific trade hashing

### Widget Styling
- Glassmorphism aesthetic
- Consistent color scheme
- Glowing border effects
- Removed bottom toolbar

### Internationalization
- Localized all navigation links
- Fixed import errors in sidebar
- Updated proxy.ts for locale redirects

---

## 🎯 Current Focus Areas (Based on Recent Work)

1. **Data Provider Refactoring** - Centralizing data fetching
2. **Widget Styling** - Unified glassmorphism design
3. **Localization** - Complete i18n coverage
4. **Financial Correctness** - Decimal.js for all calculations
5. **Trade Import** - AI-powered field mapping

---

## 📊 Statistics

- **Total Files**: ~1000+ files
- **Code Size**: ~500KB TypeScript code
- **Database Models**: 40+ Prisma models
- **API Routes**: 80+ endpoints
- **UI Components**: 100+ components
- **Zustand Stores**: 28 state stores
- **Supported Locales**: 2 (EN, FR)
- **Test Coverage**: Vitest integration tests

---

## 🚦 Health & Monitoring

### Health Endpoint
```
GET /api/health
```

Returns:
- Overall status (`ok` / `degraded`)
- DB latency
- Request ID
- Uptime

### Metrics
- Analytics versioned in `docs/ANALYTICS_METRIC_DEFINITIONS.md`
- Runtime metrics in `lib/analytics/metrics-v1.ts`

---

## 🎓 Learning Resources

### For New Developers
1. Read `README.md` for setup
2. Explore `prisma/schema.prisma` for data model
3. Check `app/[locale]/dashboard/page.tsx` for main dashboard
4. Review `context/data-provider.tsx` for data flow
5. Look at `components/ui/` for component patterns

### Key Patterns
- **Server Actions** for mutations
- **API Routes** for public data
- **Zustand** for client state
- **React Context** for global data
- **Prisma** for database queries

---

This document provides a comprehensive overview of the Qunt Edge project structure. For specific implementation details, refer to the individual files and the comprehensive documentation in `COMBINED_DOCUMENTATION.md`.
