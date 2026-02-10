import { User } from '@supabase/supabase-js'

/**
 * Centralized utility to check if a user has administrative privileges.
 *
 * Privileges are granted if:
 * 1. The user's ID matches ADMIN_USER_ID or ALLOWED_ADMIN_USER_ID
 * 2. The user's email domain is included in ADMIN_EMAIL_DOMAINS
 *
 * @param user The Supabase user object
 * @returns boolean indicating if the user is an admin
 */
export async function isAdmin(user: User | null | undefined): Promise<boolean> {
  if (!user) return false

  // Check by User ID
  const adminUserId = process.env.ADMIN_USER_ID || process.env.ALLOWED_ADMIN_USER_ID
  if (adminUserId && user.id === adminUserId) {
    return true
  }

  // Check by Email Domain
  if (user.email) {
    const adminDomains = process.env.ADMIN_EMAIL_DOMAINS?.split(',') || []
    const userEmail = user.email.toLowerCase()

    const isAdminByDomain = adminDomains.some((domain) => {
      const trimmedDomain = domain.trim().toLowerCase()
      if (!trimmedDomain) return false

      // Ensure it matches the domain part specifically to avoid partial matches
      return userEmail.endsWith(`@${trimmedDomain}`) || userEmail.endsWith(`.${trimmedDomain}`)
    })

    if (isAdminByDomain) {
      return true
    }
  }

  return false
}
