# Claude Code Automation Skills - Quick Reference

This document provides a quick reference for the custom automation skills created for the QuntEdge trading platform.

## Available Skills

### 1. `/widget` - Dashboard Widget Generator

**Purpose**: Generate new dashboard widgets (charts, statistics, tables, other)

**Usage**:
```
/widget
```

**What it will ask you**:
- Widget name (e.g., "win-rate-trend", "account-performance")
- Widget type (chart, statistic, table, other)
- Size (tiny, small, small-long, medium, large, extra-large)
- Data source (which store/hook?)
- i18n keys needed (what translatable strings?)

**What it generates**:
- Complete widget component at `/app/[locale]/dashboard/components/{category}/{name}.tsx`
- Widget registry configuration
- Type definitions for WidgetType
- i18n translation keys (en + 6 other languages)
- Import statements and integration steps

**Best for**: New chart visualizations, statistics displays, data tables

**Time saved**: ~2-3 hours per widget

---

### 2. `/stat-card` - Statistics Card Generator

**Purpose**: Generate tiny-sized statistics cards for dashboard metrics

**Usage**:
```
/stat-card
```

**What it will ask you**:
- Metric name (e.g., "Average Win", "Max Drawdown")
- Data calculation (how to compute from existing data?)
- Icon selection (from lucide-react)
- Color scheme (positive, negative, neutral)
- Tooltip description

**What it generates**:
- Complete card component at `/app/[locale]/dashboard/components/statistics/{name}-card.tsx`
- Widget registry configuration (tiny size only)
- Type definitions
- i18n translation keys

**Best for**: Quick statistics displays, KPI cards, metric summaries

**Time saved**: ~1-2 hours per card

---

### 3. `/api-route` - API Route Scaffolder

**Purpose**: Generate new Next.js API routes with authentication, validation, and error handling

**Usage**:
```
/api-route
```

**What it will ask you**:
- Route path (e.g., "api/dashboard/user-analytics")
- HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Authentication required? (yes/no - which method?)
- Data source (Prisma model, database action, external API?)
- Validation needs (what parameters via Zod?)
- Rate limiting needed?

**What it generates**:
- Complete route file at `/app/api/{route-name}/route.ts`
- Zod validation schemas
- Authentication checks
- Error handling with apiError helper
- Testing examples with curl

**Best for**: CRUD operations, data fetching endpoints, admin endpoints

**Time saved**: ~1-2 hours per route

---

## Automated Hooks

Your project now has these automated hooks configured:

### Pre-ToolUse Hooks

1. **Prisma Schema Validation**
   - **Trigger**: Writing to `prisma/schema.prisma`
   - **Action**: Runs `npx prisma validate`
   - **Purpose**: Catch schema errors before they cause issues

2. **Route Registry Update**
   - **Trigger**: Writing to `app/**/route.ts`
   - **Action**: Runs `npm run generate-routes`
   - **Purpose**: Auto-update route registry when API routes change

### Benefits

- **Catch errors early**: Schema validation before commits
- **Keep registries in sync**: Auto-generate routes.json when routes change
- **Zero manual effort**: Runs automatically when you save files

---

## Quick Start Examples

### Example 1: Create a Win Rate Trend Chart Widget

```
You: /widget

Claude: Let me help you create a new dashboard widget.

First, I need some information:
1. Widget name: win-rate-trend
2. Widget type: chart
3. Size: medium
4. Data source: useTradesStore
5. i18n keys: title, tooltip

[Generates complete widget component]
```

### Example 2: Create an Average Win Card

```
You: /stat-card

Claude: Let me help you create a statistics card.

1. Metric name: Average Win
2. Calculation: totalWin / nbWin
3. Icon: TrendingUp
4. Color: positive
5. Tooltip: Average winning trade amount

[Generates complete card component]
```

### Example 3: Create User Settings API

```
You: /api-route

Claude: Let me help you create an API route.

1. Route path: api/dashboard/user/settings
2. HTTP methods: GET, PUT
3. Authentication: required (session)
4. Data source: Prisma User model
5. Validation: email, timezone, preferences object
6. Rate limiting: no

[Generates complete route file]
```

---

## Integration Checklist

After using any skill, remember to:

### For Widgets
- [ ] Import component in `widget-registry.tsx`
- [ ] Add to `WIDGET_REGISTRY`
- [ ] Add `WidgetType` to `types/dashboard.ts`
- [ ] Add i18n keys to all 7 language files
- [ ] Run `npm run typecheck`
- [ ] Test widget in dashboard
- [ ] Verify all size variations work

### For Statistics Cards
- [ ] Import component in `widget-registry.tsx`
- [ ] Add to `WIDGET_REGISTRY`
- [ ] Add `WidgetType` to `types/dashboard.ts`
- [ ] Add i18n keys to all 7 language files
- [ ] Run `npm run typecheck`
- [ ] Test card displays correctly

### For API Routes
- [ ] Create database action if needed
- [ ] Add any new types
- [ ] Run `npm run typecheck`
- [ ] Test endpoint with curl/Postman
- [ ] Add integration test
- [ ] Update API documentation

---

## File Locations Reference

### Widget Components
- Charts: `/app/[locale]/dashboard/components/charts/`
- Statistics: `/app/[locale]/dashboard/components/statistics/`
- Tables: `/app/[locale]/dashboard/components/tables/`
- Other: `/app/[locale]/dashboard/components/`

### Configuration Files
- Widget Registry: `/app/[locale]/dashboard/config/widget-registry.tsx`
- Type Definitions: `/app/[locale]/dashboard/types/dashboard.ts`

### API Routes
- All routes: `/app/api/`
- Database Actions: `/server/database.ts` or `/server/actions/`

### i18n Files
- English: `/locales/en.ts`
- Other Languages: `/locales/{fr,es,it,de,ja,hi}.ts`

---

## Tips for Best Results

### Widget Generation
1. **Start with existing patterns**: Reference similar widgets in the codebase
2. **Keep data access simple**: Use `useData()` or existing stores
3. **Test sizes early**: Verify your widget works in all allowed sizes
4. **Add meaningful tooltips**: Users should understand metrics quickly

### Statistics Card Generation
1. **Use appropriate icons**: Match icons to metric semantics
2. **Choose colors carefully**: Positive = green, Negative = red, Neutral = gray
3. **Keep it simple**: Cards are tiny, display one key metric
4. **Calculate efficiently**: Don't do heavy computation on every render

### API Route Generation
1. **Validate all inputs**: Use Zod schemas for all POST/PUT/PATCH
2. **Handle errors gracefully**: Use apiError helper with proper codes
3. **Rate limit sensitive operations**: Protect auth, payment, admin endpoints
4. **Document your routes**: Add comments explaining complex logic

---

## Troubleshooting

### Widget Not Appearing in Dashboard
- Check import in `widget-registry.tsx`
- Verify type added to `types/dashboard.ts`
- Confirm component in registry
- Check browser console for errors

### Statistics Card Showing Wrong Value
- Verify calculation logic
- Check data source (statistics object structure)
- Ensure number formatting (.toFixed, etc.)

### API Route Returning 500 Error
- Check error handling in route
- Verify database action exists
- Test with hardcoded values first
- Check Prisma connection

### Hooks Not Running
- Verify `.claude/settings.local.json` is correct
- Check commands are executable (npx, npm)
- Look for hook errors in Claude Code logs

---

## Next Steps

### Recommended Additional Skills

Once you're comfortable with these skills, consider adding:

1. **`/store`** - Generate Zustand stores with persistence
2. **`/hook`** - Generate custom React hooks
3. **`/prisma-model`** - Generate Prisma models with migrations
4. **`/test`** - Generate test suites for existing code
5. **`/i18n-sync`** - Sync translation keys across languages

See the full automation recommendations in the main analysis document for details.

---

## Support

For questions or issues with these skills:
1. Check this reference document first
2. Review the skill file in `.claude/skills/` for detailed patterns
3. Compare with existing implementations in the codebase
4. Test with simple examples before complex features

Happy automating! 🚀
