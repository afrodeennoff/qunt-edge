# 🚀 AI Auto-Fix Quick Start Guide

## How to Use the AI Master Prompt

### For AI Assistants (Claude, GPT-4, etc.)

Simply paste this prompt to any AI:

```
I have the Qunt Edge trading analytics platform codebase. 
Please read the file AI_MASTER_PROMPT.md and automatically fix all issues you can find.

Focus on:
1. Type safety - remove all 'any' types
2. Financial precision - ensure all calculations use Decimal.js
3. Error handling - add try-catch and Error Boundaries
4. Security - verify auth checks and input validation
5. Performance - add memoization and caching

Execute Phase 1-3 (CRITICAL priorities) and report back.
```

---

## Quick Commands for Manual Fixes

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

### Run Tests
```bash
npm run test
npm run test:coverage
```

### Database Check
```bash
npx prisma validate
npx prisma generate
```

### Build Verification
```bash
npm run bundle:check
```

---

## Common Auto-Fix Scenarios

### Scenario 1: Type Errors After Update
**Prompt to AI:**
```
I just updated dependencies and now have TypeScript errors. 
Read AI_MASTER_PROMPT.md section 1 (TYPE SAFETY) and fix all type errors.
```

### Scenario 2: Financial Calculation Bug
**Prompt to AI:**
```
There's a precision issue with trade PnL calculations.
Read AI_MASTER_PROMPT.md section 2 (FINANCIAL PRECISION) and ensure 
all calculations in lib/account-metrics.ts use Decimal.js correctly.
```

### Scenario 3: Import Not Working
**Prompt to AI:**
```
Trade imports are failing with validation errors.
Read AI_MASTER_PROMPT.md section 3 (DATA NORMALIZATION) and fix 
the import pipeline in server/database.ts.
```

### Scenario 4: Performance Issues
**Prompt to AI:**
```
Dashboard is slow when filtering large datasets.
Read AI_MASTER_PROMPT.md section 5 (PERFORMANCE) and optimize 
the filtering logic in context/data-provider.tsx.
```

### Scenario 5: Security Audit Preparation
**Prompt to AI:**
```
Running security audit before production deploy.
Read AI_MASTER_PROMPT.md section 6 (SECURITY) and verify all 
server actions have proper auth and validation.
```

---

## Emergency Fix Protocol

If the app is broken in production:

1. **Read the Incident Runbook**
   ```
   AI: Read docs/INCIDENT_RUNBOOK.md and diagnose the issue
   ```

2. **Check Health Endpoint**
   ```bash
   curl https://your-app.com/api/health
   ```

3. **Review Recent Changes**
   ```bash
   git log -10 --oneline
   ```

4. **Rollback if Needed**
   ```bash
   git revert HEAD
   git push
   ```

5. **AI-Assisted Fix**
   ```
   AI: The health endpoint shows database latency issues.
   Read AI_MASTER_PROMPT.md section 8 (DATABASE) and identify 
   slow queries that need optimization.
   ```

---

## Automated Workflow Example

### Daily Maintenance Task

Create a script: `scripts/ai-daily-check.sh`

```bash
#!/bin/bash

echo "🤖 Running AI-powered daily checks..."

# 1. Type check
echo "📝 Type checking..."
npm run typecheck

# 2. Lint
echo "🔍 Linting..."
npm run lint

# 3. Test
echo "🧪 Testing..."
npm run test

# 4. Security audit
echo "🔒 Security audit..."
npm audit --production

# 5. Bundle size check
echo "📦 Bundle analysis..."
npm run bundle:check

echo "✅ Daily checks complete. Review any errors above."
```

Then have AI fix issues found:
```
AI: I ran the daily checks and found:
- 3 TypeScript errors
- 2 security vulnerabilities
- Bundle size increased 15%

Read AI_MASTER_PROMPT.md and fix these issues automatically.
```

---

## Integration with CI/CD

### GitHub Actions Workflow

Create `.github/workflows/ai-quality-check.yml`:

```yaml
name: AI Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Type Check
        run: npm run typecheck
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm run test
      
      - name: Build
        run: npm run bundle:check
      
      # If any fail, AI can auto-fix
      - name: Comment on PR with issues
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Quality checks failed. Run: `AI: Read AI_MASTER_PROMPT.md and fix CI/CD failures.`'
            })
```

---

## Pre-Commit Auto-Fix

### Setup Husky Hook

```bash
npx husky install
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run type check and lint before commit
npm run typecheck || {
  echo "❌ Type errors found. AI can fix these:"
  echo "   AI: Read AI_MASTER_PROMPT.md section 1 and fix type errors"
  exit 1
}

npm run lint || {
  echo "❌ Lint errors found. AI can fix these:"
  echo "   AI: Read AI_MASTER_PROMPT.md section 9 and fix code style"
  exit 1
}
```

---

## Specific File Auto-Fix Examples

### Fix data-provider.tsx (57KB monster file)

**Prompt:**
```
The file context/data-provider.tsx is 1764 lines (57KB) - too large.
Read AI_MASTER_PROMPT.md and split it into:
- data-fetching.ts (fetching logic)
- data-normalization.ts (type conversions)
- data-caching.ts (IndexedDB operations)
- data-provider.tsx (context provider only)

Keep the same API so existing components don't break.
```

### Fix account-metrics.ts (no tests)

**Prompt:**
```
The file lib/account-metrics.ts has 270 lines of financial calculations with ZERO tests.
Read AI_MASTER_PROMPT.md section 10 (TESTING) and create comprehensive tests
in lib/__tests__/account-metrics.test.ts that verify:
1. Total PnL calculation with decimal precision
2. Commission deductions
3. Win rate calculations
4. Average trade metrics
```

### Fix database.ts (too large)

**Prompt:**
```
The file server/database.ts is 968 lines. Extract domain-specific operations into:
- server/trades-db.ts (trade operations)
- server/accounts-db.ts (account operations)
- server/import-db.ts (import logic)
Keep database.ts as coordinator only.
```

---

## Monitoring & Alerting Setup

### Add Performance Monitoring

**Prompt to AI:**
```
Add performance monitoring to the app.
Read AI_MASTER_PROMPT.md section 5 (PERFORMANCE) and:
1. Add Vercel Analytics tracking
2. Create custom metrics for:
   - Dashboard load time
   - Trade import processing time
   - API response times
3. Set up alerts for degraded performance
```

### Add Error Tracking

**Prompt:**
```
Integrate Sentry for error tracking.
Read AI_MASTER_PROMPT.md section 4 (ERROR HANDLING) and:
1. Install @sentry/nextjs
2. Configure in next.config.ts
3. Add error boundaries that report to Sentry
4. Set up source maps for production debugging
```

---

## Weekly Maintenance Checklist

Run these prompts weekly:

### Week 1: Type Safety Audit
```
AI: Scan entire codebase for type safety issues.
Report any 'any' types, 'as unknown as' casts, or missing type definitions.
Read AI_MASTER_PROMPT.md section 1 and fix all findings.
```

### Week 2: Performance Audit
```
AI: Analyze codebase for performance issues.
Find expensive calculations without memoization, missing lazy loading,
or missing caching. Read AI_MASTER_PROMPT.md section 5 and optimize.
```

### Week 3: Security Audit
```
AI: Run security audit on all server actions and API routes.
Check for missing auth, unvalidated inputs, or SQL injection risks.
Read AI_MASTER_PROMPT.md section 6 and fix vulnerabilities.
```

### Week 4: Code Quality Audit
```
AI: Check for code duplication, inconsistent naming, and missing docs.
Read AI_MASTER_PROMPT.md section 9 and refactor as needed.
```

---

## Advanced: Custom Auto-Fix Rules

### Create Project-Specific Rules

Add to `AI_MASTER_PROMPT.md` under section 11:

```markdown
### 11. PROJECT-SPECIFIC RULES

#### Widget Development
- All widgets must use the glassmorphism design (see widget-canvas.tsx)
- All widgets must support light/dark theme
- All widgets must handle empty data state
- All widgets must be lazy-loaded

#### Trade Import Rules
- All imports must use UUID v5 for deduplication
- All imports must validate entryDate is not in future
- All imports must calculate commission if missing
- All imports must assign to correct account
```

---

## Success Metrics

Track these after each auto-fix session:

### Code Quality Metrics
```bash
# Type coverage
npx type-coverage --detail

# Bundle size
npm run bundle:check | grep "Total"

# Test coverage
npm run test:coverage | grep "All files"

# Lint errors
npm run lint 2>&1 | grep "error" | wc -l
```

### Performance Metrics
```bash
# Build time
time npm run build

# Lighthouse score
npx lighthouse https://your-app.com --view
```

---

## Troubleshooting

### AI Makes Breaking Changes
**Solution:** Always have AI work on a branch
```bash
git checkout -b ai-auto-fix-$(date +%Y%m%d)
# Let AI make changes
git diff # Review changes
git checkout main # Discard if bad
```

### AI Can't Understand Complex Code
**Solution:** Ask AI to explain first
```
AI: Read context/data-provider.tsx and explain what it does.
Don't make any changes yet, just document the logic.
```

### AI Introduces New Bugs
**Solution:** Test incrementally
```
AI: Fix type errors in lib/utils.ts only. 
After you're done, I'll run tests before you continue.
```

---

## Resources

- **Main Prompt**: `AI_MASTER_PROMPT.md`
- **Architecture**: `PROJECT_STRUCTURE.md`
- **Known Issues**: `ARCHITECTURE_GRADE.md`
- **Emergency Guide**: `docs/INCIDENT_RUNBOOK.md`

---

## Example Full Auto-Fix Session

```
USER: Fix everything automatically

AI: Reading AI_MASTER_PROMPT.md...

PHASE 1: Type Safety (CRITICAL)
✅ Scanning for 'any' types... Found 12 instances
✅ Fixing data-provider.tsx line 114...
✅ Fixing database.ts line 492...
... (10 more fixes)
✅ Removed all 'any' types
✅ TypeScript: 0 errors

PHASE 2: Error Handling (CRITICAL)
✅ Adding Error Boundary to dashboard layout...
✅ Adding try-catch to 8 async operations...
✅ Improving error messages in 6 components...

PHASE 3: Security (CRITICAL)
✅ Verifying auth checks... Found 3 missing
✅ Adding getUserId() to deleteTradeAction...
✅ Adding getUserId() to updateSettingsAction...
✅ Adding getUserId() to saveJournalAction...
✅ All mutations now require auth

SUMMARY:
- Fixed 47 issues
- 0 TypeScript errors
- 0 Lint errors
- All tests passing (45/45)
- Estimated grade improvement: B+ → A-

MANUAL REVIEW NEEDED:
1. data-provider.tsx - Still very large, recommend splitting
2. account-metrics.ts - Needs unit tests
3. Performance testing recommended before deploy

Ready for next phase? (Y/N)
```

---

**Pro Tip**: Bookmark this guide and the AI_MASTER_PROMPT.md file. 
Any AI assistant that reads these files will understand your codebase 
and can fix issues automatically while following your exact patterns!
