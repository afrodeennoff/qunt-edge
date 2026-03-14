import { NextResponse } from "next/server"
import { getTeamById, getTeamAnalytics, updateTeamAnalytics } from "@/server/teams"
import { createRouteClient } from "@/lib/supabase/route-client"
import { resolveTeamUserId } from "@/server/team-membership"
import { apiError } from "@/lib/api-response"
import { z } from "zod"

const teamIdSchema = z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/)
const periodSchema = z.enum(["daily", "weekly", "monthly"])

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID()
  try {
    const supabase = createRouteClient(req)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return apiError("UNAUTHORIZED", "Unauthorized", 401)
    }

    const teamIdResult = teamIdSchema.safeParse((await params).id)
    if (!teamIdResult.success) {
      return apiError("VALIDATION_FAILED", "Invalid team id", 400, {
        issues: teamIdResult.error.issues,
        requestId,
      })
    }
    const teamId = teamIdResult.data
    const url = new URL(req.url)
    const periodResult = periodSchema.safeParse(url.searchParams.get('period') ?? 'monthly')
    if (!periodResult.success) {
      return apiError("VALIDATION_FAILED", "Invalid period", 400, {
        issues: periodResult.error.issues,
        requestId,
      })
    }
    const period = periodResult.data

    const teamUserId = await resolveTeamUserId(user.id)
    const team = await getTeamById(teamId, teamUserId)

    if (!team) {
      return apiError("NOT_FOUND", "Team not found", 404, { requestId })
    }

    const analytics = await getTeamAnalytics(teamId, period)
    return NextResponse.json(analytics, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Team not found') {
      return apiError("NOT_FOUND", "Team not found", 404, { requestId })
    }
    console.error('Error fetching team analytics:', error)
    return apiError("INTERNAL_ERROR", "Failed to fetch analytics", 500, { requestId })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID()
  try {
    const supabase = createRouteClient(req)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return apiError("UNAUTHORIZED", "Unauthorized", 401)
    }

    const teamIdResult = teamIdSchema.safeParse((await params).id)
    if (!teamIdResult.success) {
      return apiError("VALIDATION_FAILED", "Invalid team id", 400, {
        issues: teamIdResult.error.issues,
        requestId,
      })
    }
    const teamId = teamIdResult.data
    const url = new URL(req.url)
    const periodResult = periodSchema.safeParse(url.searchParams.get('period') ?? 'monthly')
    if (!periodResult.success) {
      return apiError("VALIDATION_FAILED", "Invalid period", 400, {
        issues: periodResult.error.issues,
        requestId,
      })
    }
    const period = periodResult.data
    const teamUserId = await resolveTeamUserId(user.id)
    const result = await updateTeamAnalytics(teamId, teamUserId, period)

    if (!result.success) {
      return apiError("INTERNAL_ERROR", result.error || "Failed to update analytics", 500, { requestId })
    }

    return NextResponse.json(result.analytics, { status: 200 })
  } catch (error) {
    console.error('Error updating team analytics:', error)
    return apiError("INTERNAL_ERROR", "Failed to update analytics", 500, { requestId })
  }
}
