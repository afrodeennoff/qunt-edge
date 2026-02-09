import { NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from 'resend'
import { createClient } from '@/server/auth'
import TeamInvitationEmail from '@/components/emails/team-invitation'
import { render } from "@react-email/render"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing')
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
  }
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {

    const body = await req.json()
    const schema = z.object({
      teamId: z.string(),
      email: z.string().email(),
    })

    const parseResult = schema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: parseResult.error.format() }, { status: 400 })
    }

    const { teamId, email } = parseResult.data

    if (!teamId || !email) {
      return NextResponse.json(
        { error: 'Team ID and email are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.id || !user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const inviter = await prisma.user.findUnique({
      where: { auth_user_id: user.id },
      select: { id: true, email: true },
    })

    if (!inviter) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const isOwner = team.userId === inviter.id
    const isAdminManager = team.managers.length > 0
    if (!isOwner && !isAdminManager) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Check if user is already a trader in this team
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser && team.traderIds.includes(existingUser.id)) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
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
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
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
    const joinUrl = `${appUrl}/teams/join?invitation=${invitation.id}`

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
      replyTo: 'hugo.demenez@qunt-edge.vercel.app',
    })

    if (error) {
      console.error('Error sending invitation email:', error)
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, invitationId: invitation.id },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error sending team invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
