import { NextResponse } from "next/server"
import { headers } from 'next/headers'
import TraderStatsEmail from "@/components/emails/weekly-recap"
import MissingYouEmail from "@/components/emails/missing-data"
import { render } from "@react-email/render"
import { generateTradingAnalysis } from "./actions/analysis"
import { getUserData, computeTradingStats } from "./actions/user-data"
import { buildUnsubscribeUrl } from "@/lib/unsubscribe-url"
import { requireServiceAuth, toErrorResponse } from "@/server/authz"
import { z } from "zod"

const sanitizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "Unknown error"
}

const maskValue = (value?: string) => value ? `${value.slice(0, 8)}…` : 'unknown'

const userIdSchema = z.string().uuid()

export async function POST(req: Request, props: { params: Promise<{ userid: string }> }) {
  const params = await props.params;
  try {
    // Verify that this is a legitimate request with the correct secret
    const headersList = await headers()
    requireServiceAuth(headersList.get('authorization'), { serviceName: 'email-weekly-summary' })

    const userIdResult = userIdSchema.safeParse(params.userid)
    if (!userIdResult.success) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
    }

    // Get user data and compute stats
    const { user, newsletter, trades } = await getUserData(userIdResult.data)
    const stats = await computeTradingStats(trades, user.language)

    // If no trades, return missing you email data
    if (trades.length === 0) {
      const missingYouEmailHtml = await render(
        MissingYouEmail({
          firstName: newsletter.firstName || 'trader',
          email: newsletter.email,
          language: user.language
        })
      )

      return NextResponse.json({
        success: true,
        emailData: {
          from: 'Qunt Edge <newsletter@eu.updates.qunt-edge.vercel.app>',
          to: [newsletter.email],
          replyTo: 'hugo.demenez@qunt-edge.vercel.app',
          subject: user.language === 'fr' ? 'Nous manquons de vous voir sur Qunt Edge' : 'We miss you on Qunt Edge',
          html: missingYouEmailHtml
        }
      })
    }

    // Generate analysis using server action
    const analysis = await generateTradingAnalysis(
      stats.dailyPnL,
      user.language as 'fr' | 'en'
    )

    const unsubscribeUrl = buildUnsubscribeUrl(user.email, req)

    const weeklyStatsEmailHtml = await render(
      TraderStatsEmail({
        firstName: newsletter.firstName || 'trader',
        dailyPnL: stats.dailyPnL,
        winLossStats: stats.winLossStats,
        email: newsletter.email,
        resultAnalysisIntro: analysis.resultAnalysisIntro,
        tipsForNextWeek: analysis.tipsForNextWeek,
        language: user.language
      })
    )



    return NextResponse.json({
      success: true,
      emailData: {
        from: 'Qunt Edge <newsletter@eu.updates.qunt-edge.vercel.app>',
        to: [user.email],
        subject: user.language === 'fr' ? 'Vos statistiques de trading de la semaine 📈' : 'Your trading statistics for the week 📈',
        html: weeklyStatsEmailHtml,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        replyTo: 'hugo.demenez@qunt-edge.vercel.app'
      }
    })

  } catch (error) {
    console.error({
      event: "weekly-summary.post-error",
      phase: "POST",
      userId: maskValue(params.userid),
      errorMessage: sanitizeErrorMessage(error),
    })
    return toErrorResponse(error)
  }
}
