import { NextResponse } from "next/server"
import { getTeamById, getTeamAnalytics, updateTeamAnalytics } from "@/server/teams"
import { createRouteClient } from "@/lib/supabase/route-client"
import { z } from "zod"

const teamIdSchema = z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/)
const periodSchema = z.enum(["daily", "weekly", "monthly"])

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteClient(req)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teamIdResult = teamIdSchema.safeParse((await params).id)
    if (!teamIdResult.success) {
      return NextResponse.json({ error: 'Invalid team id' }, { status: 400 })
    }
    const teamId = teamIdResult.data
    const url = new URL(req.url)
    const periodResult = periodSchema.safeParse(url.searchParams.get('period') ?? 'monthly')
    if (!periodResult.success) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
    }
    const period = periodResult.data

    const team = await getTeamById(teamId, user.id)

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const analytics = await getTeamAnalytics(teamId, period)
    return NextResponse.json(analytics, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Team not found') {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }
    console.error('Error fetching team analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteClient(req)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teamIdResult = teamIdSchema.safeParse((await params).id)
    if (!teamIdResult.success) {
      return NextResponse.json({ error: 'Invalid team id' }, { status: 400 })
    }
    const teamId = teamIdResult.data
    const url = new URL(req.url)
    const periodResult = periodSchema.safeParse(url.searchParams.get('period') ?? 'monthly')
    if (!periodResult.success) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
    }
    const period = periodResult.data
    const result = await updateTeamAnalytics(teamId, user.id, period)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(result.analytics, { status: 200 })
  } catch (error) {
    console.error('Error updating team analytics:', error)
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    )
  }
}
