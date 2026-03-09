import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createRouteClient } from "@/lib/supabase/route-client"
import { MemberRole } from "@/prisma/generated/prisma"
import { ensureTeamMembership, resolveTeamUserId } from "@/server/team-membership"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = createRouteClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { invitationId } = await req.json()

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      )
    }

    // Find the invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { team: { select: { id: true } } }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if invitation is still valid
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invitation has already been used or expired' },
        { status: 400 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if the email matches the current user
    if (invitation.email !== user.email) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      )
    }

    const teamUserId = await resolveTeamUserId(user.id)

    await prisma.$transaction(async (tx) => {
      await ensureTeamMembership(tx, {
        teamId: invitation.teamId,
        userId: teamUserId,
        role: invitation.role ?? MemberRole.TRADER,
      })

      await tx.teamInvitation.update({
        where: { id: invitationId },
        data: {
          status: 'ACCEPTED',
        },
      })
    })

    return NextResponse.json(
      { success: true, teamId: invitation.teamId },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error accepting team invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
