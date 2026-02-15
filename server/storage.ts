'use server'

import { createClient } from '@/server/auth'

type ListStorageObjectsOptions = {
  prefix?: string
  limit?: number
  offset?: number
}

type StorageListObject = {
  id: string
  name: string
  bucket_id: string
  owner: string | null
  created_at: string
  updated_at: string
  last_accessed_at: string | null
  metadata: Record<string, unknown> | null
}

/**
 * Scalable object listing via indexed storage.list_objects RPC.
 */
export async function listStorageObjects(
  bucketId: string,
  options: ListStorageObjectsOptions = {}
): Promise<StorageListObject[]> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Authentication required to list storage objects')
  }

  const { prefix = '', limit = 100, offset = 0 } = options
  const userRootPrefix = `${user.id}/`
  const normalizedPrefix = prefix.replace(/^\/+/, '')
  const scopedPrefix = normalizedPrefix
    ? normalizedPrefix.startsWith(userRootPrefix)
      ? normalizedPrefix
      : `${userRootPrefix}${normalizedPrefix}`
    : userRootPrefix

  const { data, error } = await supabase.storage.from(bucketId).list(scopedPrefix, {
    limit,
    offset,
    sortBy: { column: 'name', order: 'asc' },
  })

  if (error) {
    throw new Error(`Failed to list storage objects: ${error.message}`)
  }

  return (data ?? []).map((item) => ({
    id: item.id ?? '',
    name: `${scopedPrefix}${item.name}`,
    bucket_id: bucketId,
    owner: null,
    created_at: item.created_at ?? '',
    updated_at: item.updated_at ?? '',
    last_accessed_at: null,
    metadata: item.metadata ?? null,
  })) as StorageListObject[]
}
