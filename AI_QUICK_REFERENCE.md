# 🎴 AI Auto-Fix Quick Reference Card

## 📋 Essential Copy-Paste Prompts

### 🚀 FULL AUTO-FIX (Most Common)
```
I have the Qunt Edge codebase open. 

Read AI_MASTER_PROMPT.md and automatically fix all CRITICAL issues (Phase 1-3):
- Type safety (remove 'any' types)
- Financial precision (use Decimal.js)
- Error handling (add Error Boundaries)
- Security (auth checks + validation)

Execute and provide detailed report.
```

### 🔍 QUICK SCAN (Before Committing)
```
Read AI_MASTER_PROMPT.md and scan my recent changes for issues.
Report any violations of type safety, security, or performance standards.
```

### 🐛 FIX SPECIFIC ERROR
```
I have an error: [paste error message]

Read AI_MASTER_PROMPT.md and fix this error following the established patterns.
```

### 📊 WEEKLY AUDIT
```
Run a comprehensive quality audit.
Read AI_MASTER_PROMPT.md and check Phase 1-6.
Provide a checklist of issues found and fixes recommended.
```

### 🔒 SECURITY CHECK (Before Production)
```
Security audit for production deployment.
Read AI_MASTER_PROMPT.md section 6 (SECURITY).
Verify all server actions, input validation, and auth checks.
```

---

## 🎯 Common Issues → Quick Fixes

| Issue | Prompt |
|-------|--------|
| **Type errors after npm update** | `Read AI_MASTER_PROMPT.md section 1 and fix all type errors` |
| **Dashboard not loading** | `Read AI_MASTER_PROMPT.md section 4 and debug data loading issues in data-provider.tsx` |
| **Slow performance with large data** | `Read AI_MASTER_PROMPT.md section 5 and optimize filtering/rendering in dashboard widgets` |
| **Financial calculation wrong** | `Read AI_MASTER_PROMPT.md section 2 and verify all PnL calculations use Decimal.js` |
| **Import validation failing** | `Read AI_MASTER_PROMPT.md section 3 and fix trade normalization in server/database.ts` |
| **Missing translations** | `Read AI_MASTER_PROMPT.md section 7 and add i18n to hardcoded strings` |
| **Need tests for new code** | `Read AI_MASTER_PROMPT.md section 10 and create unit tests for [file name]` |

---

## 📁 File Quick Reference

| File | Purpose | When to Read |
|------|---------|--------------|
| **AI_MASTER_PROMPT.md** (26KB) | Complete auto-fix system | Always (AI needs this) |
| **AI_AUTO_FIX_QUICK_START.md** (11KB) | Usage examples | When learning the system |
| **AI_AUTO_FIX_SUMMARY.md** (14KB) | Overview & results | First read / onboarding |
| **PROJECT_STRUCTURE.md** (25KB) | Architecture details | Understanding codebase |
| **ARCHITECTURE_GRADE.md** (19KB) | Known issues & priorities | Planning improvements |

---

## ⚡ Emergency Commands

### Production is Down
```bash
# Check health
curl https://your-app.com/api/health

# Check recent changes
git log -5 --oneline

# AI diagnosis
echo "AI: Read docs/INCIDENT_RUNBOOK.md and help diagnose production issue"
```

### Build Failing
```bash
# Check what's wrong
npm run typecheck 2>&1 | tee errors.log

# AI fix
echo "AI: Build failing with these errors: [paste errors from errors.log]
Read AI_MASTER_PROMPT.md section 1 and fix all type errors"
```

### Tests Failing After Merge
```bash
# Run tests
npm run test 2>&1 | tee test-errors.log

# AI fix
echo "AI: Tests failing after merge. Read AI_MASTER_PROMPT.md section 10
and fix test failures in: [paste failing test names]"
```

---

## 🔄 Development Workflow Integration

### Before Starting Work
```bash
git pull origin main
npm install
npm run typecheck  # Baseline
```

### While Coding
```
AI: Review my changes in [file] against AI_MASTER_PROMPT.md standards
```

### Before Committing
```bash
npm run typecheck && npm run lint && npm run test
# If any fail: "AI: Fix these issues using AI_MASTER_PROMPT.md"
```

### Before Creating PR
```
AI: Run full quality check on my branch against AI_MASTER_PROMPT.md.
Report any issues before I create PR.
```

---

## 📊 Quality Metrics Dashboard

```bash
# Run all checks at once
npm run typecheck && \
npm run lint && \
npm run test:coverage && \
npm run bundle:check

# Ask AI to interpret results
echo "AI: Here are my quality metrics: [paste results]
Compare against targets in AI_MASTER_PROMPT.md and recommend improvements."
```

---

## 🎯 Phase-by-Phase Execution

### Phase 1: Type Safety (1-2 hours)
```
AI: Execute Phase 1 from AI_MASTER_PROMPT.md
Fix type safety issues, remove 'any' types, add type guards.
Report findings.
```

### Phase 2: Error Handling (1 hour)
```
AI: Execute Phase 2 from AI_MASTER_PROMPT.md
Add Error Boundaries, wrap async ops, improve messages.
Report findings.
```

### Phase 3: Security (2 hours)
```
AI: Execute Phase 3 from AI_MASTER_PROMPT.md
Verify auth, validate inputs, sanitize content.
Report findings.
```

### Phase 4: Performance (2-3 hours)
```
AI: Execute Phase 4 from AI_MASTER_PROMPT.md
Add memoization, debouncing, caching, virtual scrolling.
Report findings.
```

### Phase 5: Code Quality (2 hours)
```
AI: Execute Phase 5 from AI_MASTER_PROMPT.md
Consolidate duplicates, fix naming, add docs.
Report findings.
```

### Phase 6: Testing (3-4 hours)
```
AI: Execute Phase 6 from AI_MASTER_PROMPT.md
Add unit tests, integration tests, E2E tests.
Report coverage.
```

---

## 🎓 Learning Path for New Developers

### Day 1: Understanding
```
1. Read AI_AUTO_FIX_SUMMARY.md (this overview)
2. Skim AI_MASTER_PROMPT.md (don't memorize, just familiarize)
3. Read PROJECT_STRUCTURE.md (understand architecture)
```

### Day 2: Setup
```
4. Run: npm install && npm run dev
5. Ask AI: "Read AI_MASTER_PROMPT.md and explain key patterns in context/data-provider.tsx"
6. Make a small change, ask AI to review it
```

### Day 3: Practice
```
7. Pick a simple issue from ARCHITECTURE_GRADE.md
8. Ask AI: "Read AI_MASTER_PROMPT.md and help me fix [issue]"
9. Review AI's changes, learn the patterns
```

### Week 2+: Mastery
```
10. Use AI auto-fix prompts daily
11. Start recognizing patterns without AI
12. Eventually, you'll write code that passes AI review first time!
```

---

## 🎪 Power User Tips

### Batch Operations
```
AI: Read AI_MASTER_PROMPT.md and execute Phase 1-3 in sequence.
After each phase, wait for my approval before continuing.
```

### Explain-Then-Fix Pattern
```
AI: First, read [file] and explain what it does.
Then, read AI_MASTER_PROMPT.md and identify any issues.
Finally, fix issues you found and explain each fix.
```

### Progressive Enhancement
```
Week 1: AI: Fix type safety (Phase 1)
Week 2: AI: Fix error handling (Phase 2)
Week 3: AI: Fix security (Phase 3)
Week 4: AI: Optimize performance (Phase 4)
```

### Documentation Generation
```
AI: Read [file] and AI_MASTER_PROMPT.md.
Generate JSDoc comments following the style guide.
```

---

## 🚨 Red Flags - When to Stop AI

⚠️ **Stop and ask for human help if AI:**
1. Wants to delete more than 100 lines
2. Wants to change database schema
3. Suggests removing security checks
4. Can't explain why a change is needed
5. Makes 3+ attempts at same issue

**What to do**: Switch from "fix" to "explain" mode
```
AI: Stop fixing. Instead, explain why this is challenging
and what human decision is needed.
```

---

## 📈 Success Tracking

### Week 1 Baseline
```bash
npm run typecheck 2>&1 | grep "error" | wc -l > week1-errors.txt
npm run test:coverage | grep "All files" > week1-coverage.txt
```

### Week 4 Comparison
```bash
npm run typecheck 2>&1 | grep "error" | wc -l > week4-errors.txt
npm run test:coverage | grep "All files" > week4-coverage.txt

diff week1-errors.txt week4-errors.txt
diff week1-coverage.txt week4-coverage.txt
```

### Expected Improvement
- Type errors: 23 → 0
- Test coverage: 10% → 85%
- Build time: 4min → 2.5min
- Bundle size: 650KB → 420KB

---

## 🎁 Bonus: AI Pair Programming

### Rubber Duck Debugging
```
AI: I'm stuck on [problem].
Here's what I've tried: [list attempts]
Read AI_MASTER_PROMPT.md and suggest solutions.
```

### Code Review
```
AI: Review my PR against AI_MASTER_PROMPT.md standards.
Focus on type safety, security, and performance.
```

### Architecture Decisions
```
AI: I'm deciding between [option A] and [option B] for [feature].
Read AI_MASTER_PROMPT.md and recommend which fits better with our patterns.
```

### Refactoring Guidance
```
AI: I want to refactor [file] because [reason].
Read AI_MASTER_PROMPT.md and suggest safest approach.
```

---

## 🎯 Specialization Prompts

### For Financial Logic
```
AI: Read AI_MASTER_PROMPT.md section 2 (FINANCIAL PRECISION).
Review all files in lib/analytics/ and ensure Decimal.js usage.
```

### For Dashboard Widgets
```
AI: Read AI_MASTER_PROMPT.md section 9 (COMPONENT PATTERNS).
Review all files in app/[locale]/dashboard/components/ for consistency.
```

### For API Routes
```
AI: Read AI_MASTER_PROMPT.md section 6 (SECURITY).
Audit all files in app/api/ for auth and validation.
```

### For Database Operations
```
AI: Read AI_MASTER_PROMPT.md section 8 (DATABASE).
Review all files in server/ for query optimization.
```

---

## 🏁 Quick Start (First Time Using)

**Step 1**: Verify files exist
```bash
ls AI_*.md
# Should see: AI_MASTER_PROMPT.md, AI_AUTO_FIX_QUICK_START.md, AI_AUTO_FIX_SUMMARY.md
```

**Step 2**: Run baseline tests
```bash
npm run typecheck
npm run lint
npm run test
# Note the errors/warnings
```

**Step 3**: AI auto-fix Phase 1
```
AI: Read AI_MASTER_PROMPT.md and execute Phase 1 (Type Safety).
Fix all type errors and remove 'any' types.
```

**Step 4**: Verify improvements
```bash
npm run typecheck
# Should see fewer errors
```

**Step 5**: Review changes
```bash
git diff
# Review each change AI made
```

**Step 6**: Commit if good
```bash
git add .
git commit -m "fix: AI auto-fix Phase 1 - type safety improvements"
```

**Step 7**: Continue with Phase 2-3
```
AI: Read AI_MASTER_PROMPT.md and execute Phase 2 (Error Handling)
AI: Read AI_MASTER_PROMPT.md and execute Phase 3 (Security)
```

---

## 🎉 You're Ready!

**Remember:**
- ✅ AI reads `AI_MASTER_PROMPT.md` to understand patterns
- ✅ You use prompts from this card for common tasks
- ✅ Review AI changes before committing
- ✅ Run tests after each phase
- ✅ Keep improving the system

**Result:** Better code in less time! 🚀

---

**Print this card** or bookmark it for quick reference during development!

---

*Last Updated: 2026-02-10 | Version: 1.0*
