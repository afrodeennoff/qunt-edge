import { NextResponse } from "next/server"
import { createClient } from "@/server/auth"
import { getTeamById, getTeamAnalytics, updateTeamAnalytics } from "@/server/teams"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teamId = (await params).id
    const url = new URL(req.url)
    const period = url.searchParams.get('period') as 'daily' | 'weekly' | 'monthly' || 'monthly'

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const teamId = (await params).id
    const result = await updateTeamAnalytics(teamId, user.id)

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
