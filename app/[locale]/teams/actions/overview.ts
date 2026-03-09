'use server'

import { getTeamOverviewData } from '@/server/teams'

export async function getTeamOverviewDataAction(teamId: string, userId: string) {
    try {
        const result = await getTeamOverviewData(teamId, userId)
        return result
    } catch (error) {
        console.error('Action error:', error)
        return { success: false, error: 'Failed to fetch overview' }
    }
}
