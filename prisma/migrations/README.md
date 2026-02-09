# Database Migration Instructions

## Migration to Add Version History Support

### Step 1: Generate Migration

Run the following command to generate the migration:

```bash
npx prisma migrate dev --name add_widget_version_history
```

This will create a new migration file in `prisma/migrations/` that adds:
- `version`, `checksum`, `deviceId` fields to `DashboardLayout`
- New `LayoutVersion` model with full history tracking

### Step 2: Review Generated Migration

The migration will automatically:
1. Add columns to existing `DashboardLayout` table
2. Create new `LayoutVersion` table
3. Set up foreign key relationships
4. Create indexes for performance

### Step 3: Deploy to Production

For production deployment:

```bash
npx prisma migrate deploy
```

### Step 4: Verify Migration

After migration, verify with:

```bash
npx prisma studio
```

Check that:
- `DashboardLayout` has new fields: `version`, `checksum`, `deviceId`
- `LayoutVersion` table exists with correct structure
- Foreign key relationships are intact

### Rollback Instructions (If Needed)

If you need to rollback:

```bash
npx prisma migrate resolve --rolled-back [migration-name]
```

### Data Migration Notes

- Existing layouts will get `version: 1` and a generated checksum
- No data loss occurs during migration
- The migration is backwards compatible

### Next Steps

After migration is complete:
1. Restart your development server
2. Test widget save operations
3. Verify version history is being created
4. Test rollback functionality
