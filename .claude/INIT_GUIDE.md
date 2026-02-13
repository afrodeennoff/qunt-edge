# QuntEdge Development Environment - Initialization Guide

This guide helps you set up and verify your development environment for the QuntEdge trading platform.

## Quick Start Checklist

Run through these steps to ensure your environment is ready:

```bash
# 1. Verify Node.js version (should be v22.21.0+)
node --version

# 2. Install dependencies
npm install

# 3. Verify Prisma is set up
npx prisma validate

# 4. Check environment variables
cp .env.example .env.local  # If not already done

# 5. Run database migrations
npx prisma migrate deploy

# 6. Generate Prisma client
npx prisma generate

# 7. Run type check
npm run typecheck

# 8. Start development server
npm run dev
```

---

## Environment Verification

### System Requirements

✅ **Confirmed on your system**:
- **Node.js**: v22.21.0
- **npm**: 10.9.4
- **OS**: macOS (Darwin 25.2.0)
- **Working Directory**: `/Users/timon/Downloads/final-qunt-edge-main`

### Required Tools

| Tool | Purpose | Check Command |
|------|---------|---------------|
| **Node.js** | Runtime | `node --version` |
| **npm** | Package manager | `npm --version` |
| **Git** | Version control | `git --version` |
| **Bun** | Alternative runtime (optional) | `bun --version` |
| **Docker** | Containerization (optional) | `docker --version` |

---

## Project Setup Steps

### 1. Install Dependencies

```bash
npm install
```

**What this does**:
- Installs all production and development dependencies
- Sets up Next.js 16.1.1
- Installs Prisma CLI, shadcn/ui, and all required packages
- Downloads TypeScript, React, and all other dependencies

**Time**: ~5-10 minutes (first run)

---

### 2. Environment Variables

Copy the example environment file and configure:

```bash
# Create local environment file
cp .env.example .env.local
```

**Required Environment Variables** (check `.env.example`):

```bash
# Database
DATABASE_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Stripe (if using payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# API Keys (if applicable)
OPENAI_API_KEY=
```

**Important**:
- Never commit `.env.local` to git
- Use strong, unique secrets for production
- Different values for development vs production

---

### 3. Database Setup

#### Option A: Using Supabase (Recommended)

```bash
# Validate Prisma schema
npx prisma validate

# Push schema to database (development)
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

#### Option B: Using Local PostgreSQL

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

#### Option C: Using Existing Database

```bash
# Just generate Prisma Client
npx prisma generate

# Verify connection
npx prisma db pull  # Pulls current schema
```

---

### 4. Verify TypeScript Configuration

```bash
# Run type checker
npm run typecheck
```

**Expected output**:
```
✓ No TypeScript errors
```

**Common issues**:
- Missing types: `npm install -D @types/...`
- Prisma not generated: Run `npx prisma generate`
- Import errors: Check `tsconfig.json` paths

---

### 5. Development Server

Start the development server:

```bash
npm run dev
```

**Expected output**:
```
   ▲ Next.js 16.1.1
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 3.2s
```

**Access the application**:
- **Dashboard**: http://localhost:3000/en/dashboard
- **API routes**: http://localhost:3000/api/*
- **Admin**: http://localhost:3000/en/admin (if authorized)

---

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Check for migrations
npx prisma migrate status

# 4. Start development server
npm run dev

# 5. In another terminal, run type checker in watch mode
npm run typecheck -- --watch
```

### Before Committing

```bash
# 1. Run type check
npm run typecheck

# 2. Run linter
npm run lint

# 3. Run tests
npm test

# 4. Validate Prisma schema
npx prisma validate

# 5. Build to verify production build works
npm run build
```

**Note**: Your automated hooks will catch Prisma validation and route registry updates automatically!

---

## Available NPM Scripts

Your `package.json` includes these scripts:

### Development
```bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
npm run typecheck         # Run TypeScript compiler
```

### Database
```bash
npm run db:push           # Push Prisma schema to DB (dev)
npm run db:migrate         # Run migrations
npm run db:seed            # Seed database (if configured)
npm run db:studio          # Open Prisma Studio
npm run db:reset           # Reset database (development only!)
```

### Testing
```bash
npm test                   # Run Vitest tests
npm run test:coverage      # Run tests with coverage
npm run test:payment       # Run payment-specific tests
```

### Build & Cleanup
```bash
npm run prebuild           # Generate routes + cleanup
npm run clean:build-artifacts  # Clean build files
```

---

## Project Structure Overview

```
final-qunt-edge-main/
├── .claude/                    # Claude Code automations
│   ├── skills/                  # Custom skills (/widget, /stat-card, /api-route)
│   ├── AUTOMATION_GUIDE.md      # This file
│   └── settings.local.json      # Hooks configuration
├── app/                        # Next.js App Router
│   ├── [locale]/                # Internationalized routes
│   │   ├── dashboard/           # Dashboard pages & widgets
│   │   ├── admin/               # Admin pages
│   │   └── auth/                # Authentication pages
│   └── api/                     # API routes
├── components/                  # React components
│   └── ui/                     # shadcn/ui components (51+)
├── lib/                         # Utility functions
├── locales/                     # i18n translation files (7 languages)
├── prisma/                      # Database schema & migrations
├── public/                      # Static assets
├── store/                       # Zustand state stores (29 stores)
├── hooks/                       # Custom React hooks
├── docs/                        # Documentation (30+ files)
└── scripts/                     # Automation scripts
```

---

## Verifying Your Setup

### Check 1: Dependencies

```bash
npm list --depth=0
```

**Expected**: All dependencies listed without errors

---

### Check 2: Database Connection

```bash
npx prisma db pull
```

**Expected**: Successfully pulls schema without errors

---

### Check 3: TypeScript

```bash
npm run typecheck
```

**Expected**: No TypeScript errors

---

### Check 4: Build

```bash
npm run build
```

**Expected**: Successful build with `.next/` folder created

---

### Check 5: Development Server

```bash
npm run dev
```

**Expected**: Server starts at http://localhost:3000

---

## Troubleshooting

### Issue: "Module not found"

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: "Prisma Client not generated"

**Solution**:
```bash
npx prisma generate
```

---

### Issue: "Database connection failed"

**Solution**:
1. Check `DATABASE_URL` in `.env.local`
2. Verify database server is running
3. Check firewall/network settings

---

### Issue: "TypeScript errors after installation"

**Solution**:
```bash
npx prisma generate
npm run typecheck
```

---

### Issue: "Port 3000 already in use"

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

---

## Next Steps

### After Initial Setup

1. **Explore the Dashboard**: Visit http://localhost:3000/en/dashboard
2. **Try Creating a Widget**: Use `/widget` skill to create a test widget
3. **Review API Routes**: Check `/app/api/` for existing endpoints
4. **Read Documentation**: Explore `/docs/` for architecture guides

### Learning Resources

- **Widget Patterns**: `/app/[locale]/dashboard/components/`
- **API Patterns**: `/app/api/dashboard/*/route.ts`
- **Database Schema**: `/prisma/schema.prisma`
- **State Management**: `/store/*-store.ts`

---

## Getting Help

### Built-in Help

- **Widget Generator**: Use `/widget` skill
- **Statistics Card Generator**: Use `/stat-card` skill
- **API Route Generator**: Use `/api-route` skill
- **Quick Reference**: Check `.claude/AUTOMATION_GUIDE.md`

### Documentation

- **Architecture**: `/docs/ARCHITECTURE.md` (if exists)
- **Payment System**: `/docs/PAYMENT_SYSTEM_COMPLETE_GUIDE.md`
- **Widget Standards**: `/docs/WIDGET_STANDARDIZATION_FRAMEWORK.md`

### Common Issues

- **Build Failures**: Check `.github/workflows/ci.yml` for CI checks
- **Database Issues**: Review Prisma migrations in `/prisma/migrations/`
- **Deployment Issues**: Check `vercel.json` configuration

---

## Automation Features

Your environment now includes:

### ✅ Automated Hooks
- Prisma schema validation on save
- Route registry updates when API routes change

### ✅ Custom Skills
- `/widget` - Generate dashboard widgets
- `/stat-card` - Generate statistics cards
- `/api-route` - Generate API routes

### ✅ Pre-configured Tools
- shadcn/ui (51 components installed)
- Prisma ORM (88 migrations)
- Vitest (testing framework)
- ESLint + TypeScript

---

## Production Deployment

### Vercel Deployment

Your project is configured for Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Configuration**: Check `vercel.json` for:
- Cron jobs
- Environment variables
- Build settings

---

## Success Criteria ✅

Your environment is ready when:

- [ ] `npm run dev` starts without errors
- [ ] TypeScript check passes (`npm run typecheck`)
- [ ] Database migrations applied (`npx prisma migrate status`)
- [ ] Can access dashboard at http://localhost:3000
- [ ] All automated hooks are working
- [ ] At least one custom skill has been tested

---

**Congratulations!** 🎉 Your QuntEdge development environment is initialized and ready to use.

**Next**: Try creating your first widget with `/widget` or explore the dashboard!

---

*Last Updated*: 2026-02-13
*Project*: QuntEdge Trading Platform
*Framework*: Next.js 16.1.1 + TypeScript
*Database*: PostgreSQL + Prisma
*UI Library*: shadcn/ui (51 components)
