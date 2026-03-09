import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    if (process.env.NODE_ENV !== 'production') {
      return createBrowserClient(
        'http://127.0.0.1:54321',
        'dummy-anon-key'
      )
    }

    throw new Error('Missing Supabase public environment variables')
  }

  return createBrowserClient(url, key)
}
