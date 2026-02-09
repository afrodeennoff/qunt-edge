import { prisma } from '@/lib/prisma'
import { MemberRole, Prisma } from '@/prisma/generated/prisma'

export async function createTeam(userId: string, name: string, organizationId?: string) {
  try {
    const team = await prisma.team.create({
      data: {
        name,
        userId,
        organizationId,
        traderIds: [],
      }
    })

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role: MemberRole.ADMIN,
      }
    })

    return { success: true, team }
  } catch (error) {
    console.error('Error creating team:', error)
    return { success: false, error: 'Failed to create team' }
  }
}

export async function getTeamsByUser(userId: string) {
  try {
    const teams = await prisma.team.findMany({
      where: {
        userId,
      },
      include: {
        members: {
          include: {
            user: true,
          }
        },
        invitations: true,
        teamSubscription: true,
        analytics: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    return teams
  } catch (error) {
    console.error('Error fetching teams:', error)
    return []
  }
}

export async function getTeamById(teamId: string, userId: string) {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        userId,
      },
      include: {
        members: {
          include: {
            user: true,
          }
        },
        invitations: true,
        teamSubscription: true,
        analytics: {
          orderBy: {
            createdAt: 'desc',
          }
        },
      }
    })

    if (!team) {
      throw new Error('Team not found')
    }

    return team
  } catch (error) {
    console.error('Error fetching team:', error)
    throw error
  }
}

export async function updateTeam(teamId: string, userId: string, data: { name?: string }) {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        userId,
      }
    })

    if (!team) {
      throw new Error('Team not found or unauthorized')
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data
    })

    return { success: true, team: updatedTeam }
  } catch (error) {
    console.error('Error updating team:', error)
    return { success: false, error: 'Failed to update team' }
  }
}

export async function deleteTeam(teamId: string, userId: string) {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        userId,
      }
    })

    if (!team) {
      throw new Error('Team not found or unauthorized')
    }

    await prisma.team.delete({
      where: { id: teamId }
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting team:', error)
    return { success: false, error: 'Failed to delete team' }
  }
}

export async function inviteMember(teamId: string, email: string, invitedBy: string, role: 'TRADER' | 'ANALYST' | 'VIEWER' = 'TRADER') {
  try {
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        teamId,
        email,
        status: 'PENDING'
      }
    })

    if (existingInvitation) {
      throw new Error('Invitation already sent')
    }

    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId,
        email: email.toLowerCase(),
        invitedBy,
        status: 'PENDING',
        role,
      }
    })

    return { success: true, invitation }
  } catch (error) {
    console.error('Error inviting member:', error)
    return { success: false, error: 'Failed to send invitation' }
  }
}

export async function acceptInvitation(invitationId: string, userId: string) {
  try {
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId }
    })

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation expired')
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('Invitation already processed')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    await prisma.$transaction(async (tx) => {
      await tx.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId,
          role: invitation.role || MemberRole.TRADER,
        }
      })

      await tx.teamInvitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' }
      })
    })

    return { success: true }
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to accept invitation' }
  }
}

export async function updateMemberRole(teamId: string, userId: string, requesterUserId: string, role: 'ADMIN' | 'TRADER' | 'ANALYST' | 'VIEWER') {
  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId },
      include: { members: true }
    }) as unknown as Prisma.TeamGetPayload<{ include: { members: true } }>

    if (!team) {
      throw new Error('Team not found')
    }

    const requester = team.members.find(m => m.userId === requesterUserId)
    if (!requester || requester.role !== MemberRole.ADMIN) {
      throw new Error('Unauthorized: Only admins can update roles')
    }

    const member = team.members.find(m => m.userId === userId)
    if (!member) {
      throw new Error('Member not found')
    }

    if (requester.userId === userId && member.role === MemberRole.ADMIN) {
      throw new Error('Cannot remove admin role from yourself')
    }

    await prisma.teamMember.update({
      where: { id: member.id },
      data: { role }
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating member role:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update member role' }
  }
}

export async function removeMember(teamId: string, userId: string, requesterUserId: string) {
  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId },
      include: { members: true }
    }) as unknown as Prisma.TeamGetPayload<{ include: { members: true } }>

    if (!team) {
      throw new Error('Team not found')
    }

    const requester = team.members.find(m => m.userId === requesterUserId)
    if (!requester || requester.role !== MemberRole.ADMIN) {
      throw new Error('Unauthorized: Only admins can remove members')
    }

    const member = team.members.find(m => m.userId === userId)
    if (!member) {
      throw new Error('Member not found')
    }

    if (requester.userId === userId) {
      throw new Error('Cannot remove yourself from team. Delete the team instead.')
    }

    await prisma.teamMember.delete({
      where: { id: member.id }
    })

    return { success: true }
  } catch (error) {
    console.error('Error removing member:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove member' }
  }
}

export async function getTeamAnalytics(teamId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  try {
    const analytics = await prisma.teamAnalytics.findFirst({
      where: {
        teamId,
        period,
      }
    })

    if (!analytics) {
      await prisma.teamAnalytics.create({
        data: {
          teamId,
          period,
          totalPnl: 0,
          totalTrades: 0,
          winRate: 0,
          averageRr: 0,
        }
      })
    }

    return analytics
  } catch (error) {
    console.error('Error fetching team analytics:', error)
    throw error
  }
}

export async function updateTeamAnalytics(teamId: string, userId: string) {
  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              include: {
                accounts: {
                  include: {
                    trades: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!team) {
      throw new Error('Team not found')
    }

    const teamWithMembers = team as unknown as Prisma.TeamGetPayload<{
      include: {
        members: {
          include: {
            user: {
              include: {
                accounts: {
                  include: {
                    trades: true
                  }
                }
              }
            }
          }
        }
      }
    }>

    const member = teamWithMembers.members.find(m => m.userId === userId)
    if (!member || (member.role !== MemberRole.ADMIN && member.role !== MemberRole.TRADER && member.role !== MemberRole.ANALYST)) {
      throw new Error('Unauthorized')
    }

    if (teamWithMembers.members.length === 0) {
      return { success: true, analytics: null }
    }

    let totalPnl = 0
    let totalTrades = 0
    let winningTrades = 0
    let totalRr = 0
    let rrCount = 0

    for (const teamMember of teamWithMembers.members) {
      for (const account of teamMember.user.accounts) {
        for (const trade of account.trades) {
          totalPnl += trade.pnl
          totalTrades++
          if (trade.pnl > 0) winningTrades++
          // Simplified RR calculation based on risk taken vs reward
          // This assumes a standard risk per trade if not available, can be improved
        }
      }
    }

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const averageRr = 0 // Placeholder for better calculation logic

    const bestMember = teamWithMembers.members.reduce((best: any, member: any) => {
      const memberPnl = member.user.accounts.reduce((sum: number, acc: any) => {
        return sum + acc.trades.reduce((accSum: number, t: any) => accSum + t.pnl, 0)
      }, 0)
      const bestPnl = best.user.accounts.reduce((sum: number, acc: any) => {
        return sum + acc.trades.reduce((accSum: number, t: any) => accSum + t.pnl, 0)
      }, 0)
      return memberPnl > bestPnl ? member : best
    }, teamWithMembers.members[0])

    const analytics = await prisma.teamAnalytics.upsert({
      where: {
        teamId_period: {
          teamId,
          period: 'monthly'
        }
      },
      create: {
        teamId,
        period: 'monthly',
        totalPnl,
        totalTrades,
        winRate,
        averageRr,
        bestMemberId: bestMember?.userId,
        bestMemberPnl: bestMember ? bestMember.user.accounts.reduce((sum: number, acc: any) => {
          return sum + acc.trades.reduce((accSum: number, t: any) => accSum + t.pnl, 0)
        }, 0) : 0
      },
      update: {
        totalPnl,
        totalTrades,
        winRate,
        averageRr,
        bestMemberId: bestMember?.userId,
        bestMemberPnl: bestMember ? bestMember.user.accounts.reduce((sum: number, acc: any) => {
          return sum + acc.trades.reduce((accSum: number, t: any) => accSum + t.pnl, 0)
        }, 0) : 0
      }
    })

    return { success: true, analytics }
  } catch (error) {
    console.error('Error updating team analytics:', error)
    return { success: false, error: 'Failed to update analytics' }
  }
}

export async function getTeamOverviewData(teamId: string, userId: string) {
  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              include: {
                accounts: {
                  include: {
                    trades: {
                      orderBy: {
                        createdAt: 'desc'
                      },
                      take: 5
                    }
                  }
                }
              }
            }
          }
        },
        analytics: {
          where: { period: 'monthly' },
          take: 1
        }
      }
    })

    if (!team) throw new Error('Team not found')

    // Find if user is a member
    const isMember = team.members.some(m => m.userId === userId)
    if (!isMember) throw new Error('Unauthorized')

    let totalBalance = 0
    let activeTraders = 0
    let recentActivity: any[] = []

    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    team.members.forEach(member => {
      let memberHasRecentActivity = false
      member.user.accounts.forEach(account => {
        totalBalance += account.startingBalance + (account.balanceRequired || 0) // Basic balance calc

        // Check for recent activity
        const hasRecentTrades = account.trades.some(t => t.createdAt > lastWeek)
        if (hasRecentTrades) memberHasRecentActivity = true

        // Collect recent activity
        account.trades.forEach(trade => {
          recentActivity.push({
            id: trade.id,
            type: 'TRADE_CLOSED',
            description: `${member.user.email} closed ${trade.instrument} with PnL ${trade.pnl}`,
            amount: trade.pnl,
            date: trade.createdAt,
            userEmail: member.user.email
          })
        })
      })
      if (memberHasRecentActivity) activeTraders++
    })

    // Sort and limit activity
    recentActivity = recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)

    return {
      success: true,
      data: {
        totalBalance,
        activeTraders,
        totalPnl: team.analytics[0]?.totalPnl || 0,
        winRate: team.analytics[0]?.winRate || 0,
        recentActivity
      }
    }

  } catch (error) {
    console.error('Error fetching team overview:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch overview' }
  }
}

export async function getTeamInvitations(userId: string) {
  try {
    const invitations = await prisma.teamInvitation.findMany({
      where: {
        email: await prisma.user.findUnique({
          where: { id: userId }
        }).then(u => u?.email || ''),
        status: 'PENDING',
      },
      include: {
        team: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return invitations
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return []
  }
}
