import { describe, expect, it } from "vitest"

import { CACHE_SCHEMA_VERSION, readCacheEntry } from "@/lib/indexeddb/trades-cache"

describe("trades cache schema guards", () => {
  it("accepts cache entries with the current schema version", () => {
    const parsed = readCacheEntry<string[]>({
      updatedAt: Date.now(),
      schemaVersion: CACHE_SCHEMA_VERSION,
      data: ["a", "b"],
    })

    expect(parsed.isStaleSchema).toBe(false)
    expect(parsed.data).toEqual(["a", "b"])
  })

  it("marks entries with missing schema version as stale", () => {
    const parsed = readCacheEntry<string[]>({
      updatedAt: Date.now(),
      data: ["legacy"],
    })

    expect(parsed.isStaleSchema).toBe(true)
    expect(parsed.data).toBeNull()
  })

  it("marks entries with mismatched schema version as stale", () => {
    const parsed = readCacheEntry<string[]>({
      updatedAt: Date.now(),
      schemaVersion: CACHE_SCHEMA_VERSION + 1,
      data: ["future"],
    })

    expect(parsed.isStaleSchema).toBe(true)
    expect(parsed.data).toBeNull()
  })

  it("returns null data for non-object values without stale marker", () => {
    const parsed = readCacheEntry<string[]>(null)

    expect(parsed.isStaleSchema).toBe(false)
    expect(parsed.data).toBeNull()
  })
})
