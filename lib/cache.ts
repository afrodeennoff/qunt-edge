import { unstable_cache } from 'next/cache';

/**
 * Wrapper around Next.js unstable_cache for standardized caching.
 * @param fn The database query or expensive function to cache.
 * @param keyParts Unique array of strings to identify the cache key.
 * @param options Cache options: revalidate (seconds) and tags (for revalidation).
 */
export async function cached<T>(
    fn: () => Promise<T>,
    keyParts: string[],
    options: { revalidate?: number | false; tags?: string[] } = {}
): Promise<T> {
    return unstable_cache(fn, keyParts, options)();
}

/**
 * Usage Example:
 * 
 * const getUsers = async () => prisma.user.findMany()
 * 
 * const getCachedUsers = () => cached(
 *   getUsers, 
 *   ['all-users'], 
 *   { revalidate: 60, tags: ['users'] }
 * )
 */
