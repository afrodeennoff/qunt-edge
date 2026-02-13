# Supabase Storage Scaling (Production)

This project applies Supabase's production Storage scaling guidance from:
- https://supabase.com/docs/guides/storage/production/scaling

## What we implemented in app code

- Immutable cache headers for hash-based object paths:
  - `/Users/timon/Downloads/final-qunt-edge-main/hooks/use-hash-upload.ts`
  - `/Users/timon/Downloads/final-qunt-edge-main/components/tiptap-editor.tsx`
- Shared storage helpers:
  - `/Users/timon/Downloads/final-qunt-edge-main/lib/supabase-storage.ts`
- Server-side scalable listing helper (RPC-backed):
  - `/Users/timon/Downloads/final-qunt-edge-main/server/storage.ts`
- Transformed image URLs for dashboard thumbnails/previews to reduce transfer size:
  - `/Users/timon/Downloads/final-qunt-edge-main/app/[locale]/dashboard/components/tables/trade-image-editor.tsx`
- Storage DB function + indexes for scalable object listings and RLS performance:
  - `/Users/timon/Downloads/final-qunt-edge-main/prisma/migrations/20260213091500_supabase_storage_scaling/migration.sql`

## Post-deploy DB and bucket checklist

Run Prisma migrations in your deployment environment:

```bash
npx prisma migrate deploy
```

Then validate bucket limits for `trade-images` in Supabase SQL Editor:

```sql
update storage.buckets
set
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
where id = 'trade-images';
```

Recommended:
- Keep hash-based object naming for immutable assets.
- Use long cache TTLs only for immutable paths.
- Prefer transformed image URLs for thumbnails/list views.
