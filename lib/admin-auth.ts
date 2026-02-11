import { NextResponse } from 'next/server'
import { createClient } from '@/server/auth'
import { User } from '@supabase/supabase-js'

export type AdminValidationResult =
  | { user: User; error: null }
  | { user: null; error: NextResponse }

export async function validateAdmin(): Promise<AdminValidationResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const adminDomains = process.env.ADMIN_EMAIL_DOMAINS?.split(',') || []
  // Ensure domains are trimmed and non-empty
  const validAdminDomains = adminDomains
    .map(d => d.trim())
    .filter(d => d.length > 0)

  const isAdmin = validAdminDomains.some((domain) =>
    user.email?.toLowerCase().endsWith(domain.toLowerCase())
  )

  if (!isAdmin) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return { user, error: null }
}
