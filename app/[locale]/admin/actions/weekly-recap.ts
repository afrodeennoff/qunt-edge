'use server'
import { render } from "@react-email/render"
import TraderStatsEmail from "@/components/emails/weekly-recap"
import { createClient } from '@supabase/supabase-js'
import { generateTradingAnalysis } from "@/app/api/email/weekly-summary/[userid]/actions/analysis"
import { getUserData, computeTradingStats } from "@/app/api/email/weekly-summary/[userid]/actions/user-data"
import { assertAdminAccess } from '@/server/authz'

function parseCsvEnv(value?: string): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase admin configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export interface WeeklyRecapContent {
  firstName: string
  dailyPnL: Array<{
    date: Date
    pnl: number
  }>
  winLossStats: {
    wins: number
    losses: number
  }
}

function compareDates(dateA: Date, dateB: Date) {
  return dateA.getTime() - dateB.getTime()
}

export async function generateAnalysis(content: WeeklyRecapContent) {
  await assertAdminAccess()
  try {
    // Sort dailyPnL by date before analysis
    const sortedContent = {
      ...content,
      dailyPnL: [...content.dailyPnL].sort((a, b) => compareDates(a.date, b.date))
    }

    const analysis = await generateTradingAnalysis(
      sortedContent.dailyPnL,
      'fr' // Default to French for now, can be made dynamic based on user preferences
    )

    return {
      success: true,
      analysis
    }
  } catch (error) {
    console.error("Failed to generate analysis:", error)
    return {
      success: false,
      error: "Failed to generate analysis"
    }
  }
}

export async function renderEmail(content: WeeklyRecapContent, analysis: { resultAnalysisIntro: string, tipsForNextWeek: string }) {
  await assertAdminAccess()
  try {
    const html = await render(
      TraderStatsEmail({
        firstName: content.firstName,
        dailyPnL: content.dailyPnL,
        winLossStats: content.winLossStats,
        email: "preview@example.com",
        resultAnalysisIntro: analysis.resultAnalysisIntro,
        tipsForNextWeek: analysis.tipsForNextWeek
      })
    )

    return {
      success: true,
      html: `<!DOCTYPE html>
        <html>
          <head>
            <base target="_blank" />
            <style>
              body { margin: 0; padding: 20px; }
              .preview-subject { 
                font-size: 1.25rem; 
                font-weight: 600; 
                margin-bottom: 1rem;
                padding: 0.5rem;
                background-color: #f3f4f6;
                border-radius: 0.375rem;
              }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>`
    }
  } catch (error) {
    console.error("Failed to render email:", error)
    return {
      success: false,
      error: "Failed to render email"
    }
  }
}

export async function loadInitialContent(email?: string, userId?: string) {
  const admin = await assertAdminAccess()
  
  // Only allow admin to query other users' data; otherwise use admin's own userId
  // This prevents unauthorized enumeration of user data
  const allowedAdminIds = parseCsvEnv(process.env.ALLOWED_ADMIN_USER_ID)
  const isAllowedAdmin = allowedAdminIds.includes(admin.userId.toLowerCase())
  const targetUserId = userId && isAllowedAdmin ? userId : admin.userId

  if (!targetUserId) {
    throw new Error('Unable to determine target user')
  }

  try {
    // Get user data and compute stats
    const { user, newsletter, trades } = await getUserData(targetUserId)
    const stats = await computeTradingStats(trades, user.language)

    return {
      firstName: newsletter.firstName || 'Trader',
      dailyPnL: stats.dailyPnL,
      winLossStats: stats.winLossStats,
    }
  } catch (error) {
    console.error("Failed to load initial content:", error)
    throw error
  }
}

export async function listUsers() {
  await assertAdminAccess()
  const supabase = getSupabaseAdminClient()
  let allUsers: any[] = []
  let page = 1
  const perPage = 1000
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage
    })

    if (error) {
      console.error('Error fetching users:', error)
      break
    }

    if (data.users.length === 0) {
      hasMore = false
    } else {
      allUsers = [...allUsers, ...data.users]
      page++
    }
  }

  return allUsers.map(user => ({
    id: user.id,
    email: user.email,
    created_at: user.created_at
  }))
} 
