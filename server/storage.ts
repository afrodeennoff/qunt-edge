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
  const { prefix = '', limit = 100, offset = 0 } = options

  const { data, error } = await supabase.rpc('list_objects', {
    bucket_id: bucketId,
    prefix,
    limits: limit,
    offsets: offset,
  })

  if (error) {
    throw new Error(`Failed to list storage objects: ${error.message}`)
  }

  return (data ?? []) as StorageListObject[]
}
