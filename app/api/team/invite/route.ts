import { NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from 'resend'
import TeamInvitationEmail from '@/components/emails/team-invitation'
import { render } from "@react-email/render"
import { prisma } from "@/lib/prisma"
import { createRouteClient } from "@/lib/supabase/route-client"
import { createRateLimitResponse, rateLimit } from "@/lib/rate-limit"
import { parseJson, toValidationErrorResponse } from "@/app/api/_utils/validate"
import { apiError } from "@/lib/api-response"

export const dynamic = 'force-dynamic'
const inviteRateLimit = rateLimit({ limit: 10, window: 60_000, identifier: "team-invite" })
const inviteSchema = z.object({
  teamId: z.string().min(1),
  email: z.string().email(),
})

const SUPPORTED_LOCALES = new Set([
  "en",
  "fr",
  "de",
  "es",
  "it",
  "pt",
  "vi",
  "hi",
  "ja",
  "zh",
  "yo",
])

// Security: Use environment-configured reply-to address
const getReplyToEmail = (): string => {
  return process.env.TEAM_INVITE_REPLY_TO || 'team@qunt-edge.com'
}

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing')
    return apiError("INTERNAL_ERROR", "Missing API key", 500)
  }
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const limit = await inviteRateLimit(req)
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      })
    }

    const { teamId, email } = await parseJson(req, inviteSchema)

    const supabase = createRouteClient(req)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.id || !user.email) {
      return apiError("UNAUTHORIZED", "Unauthorized", 401)
    }

    const inviter = await prisma.user.findUnique({
      where: { auth_user_id: user.id },
      select: { id: true, email: true },
    })

    if (!inviter) {
      return apiError("UNAUTHORIZED", "Unauthorized", 401)
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        managers: {
          where: {
            managerId: inviter.id,
            access: 'admin',
          },
          select: { id: true },
        },
      },
    })

    if (!team) {
      return apiError("NOT_FOUND", "Team not found", 404)
    }

    const isOwner = team.userId === inviter.id
    const isAdminManager = team.managers.length > 0
    if (!isOwner && !isAdminManager) {
      return apiError("FORBIDDEN", "Forbidden", 403)
    }

    // Check if user is already a trader in this team
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser && team.traderIds.includes(existingUser.id)) {
      return apiError(
        "BAD_REQUEST",
        "User is already a member of this team",
        400
      )
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.teamInvitation.findUnique({
      where: {
        teamId_email: {
          teamId,
          email,
        }
      }
    })

    if (existingInvitation && existingInvitation.status === 'PENDING') {
      return apiError(
        "BAD_REQUEST",
        "An invitation has already been sent to this email",
        400
      )
    }

    // Create or update invitation
    const invitation = await prisma.teamInvitation.upsert({
      where: {
        teamId_email: {
          teamId,
          email,
        }
      },
      update: {
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        invitedBy: inviter.id,
      },
      create: {
        teamId,
        email,
        invitedBy: inviter.id,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Generate join URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
    const inviteLocale =
      existingUser?.language && SUPPORTED_LOCALES.has(existingUser.language)
        ? existingUser.language
        : "en"

    const joinUrl = `${appUrl}/${inviteLocale}/teams/join?invitation=${invitation.id}`

    // Render email
    const emailHtml = await render(
      TeamInvitationEmail({
        email,
        teamName: team.name,
        inviterName: inviter?.email?.split('@')[0] || 'trader',
        inviterEmail: inviter?.email || 'trader@example.com',
        joinUrl,
        language: existingUser?.language || 'en'
      })
    )

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Qunt Edge Team <team@eu.updates.qunt-edge.vercel.app>',
      to: email,
      subject: existingUser?.language === 'fr'
        ? `Invitation à rejoindre ${team.name} sur Qunt Edge`
        : `Invitation to join ${team.name} on Qunt Edge`,
      html: emailHtml,
      replyTo: getReplyToEmail(),
    })

    if (error) {
      // Security: Log only non-sensitive error info
      console.error('Error sending invitation email:', error.name, error.message)
      return apiError(
        "INTERNAL_ERROR",
        'Failed to send invitation email',
        500
      )
    }

    return NextResponse.json(
      { success: true, invitationId: invitation.id },
      { status: 200 }
    )

  } catch (error) {
    const validationResponse = toValidationErrorResponse(error)
    if (validationResponse.status !== 500) return validationResponse
    // Security: Log only error type, not full error object which may contain sensitive data
    console.error('Error sending team invitation:', error instanceof Error ? error.message : 'Unknown error')
    return apiError(
      "INTERNAL_ERROR",
      "Internal server error",
      500,
      { requestId: crypto.randomUUID() }
    )
  }
} 
