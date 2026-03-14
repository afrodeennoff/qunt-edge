'use server'

import { getDatabaseUserId } from '@/server/auth'
import { Trade, Payout, Prisma } from '@/prisma/generated/prisma'
import { computeMetricsForAccounts } from '@/lib/account-metrics'
import { Account, Trade as NormalizedTrade, TradeInput } from '@/lib/data-types'
import { decimalToNumber } from '@/lib/trade-types'
import { updateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { cacheQuery } from '@/lib/cache/query-cache'
import { invalidateAllUserCaches } from '@/lib/cache/cache-invalidation'
import { FEATURE_FLAGS } from '@/lib/feature-flags'

type GroupedTrades = Record<string, Record<string, Trade[]>>

interface FetchTradesResult {
  groupedTrades: GroupedTrades;
  flattenedTrades: Trade[];
}

export async function fetchGroupedTradesAction(_userId?: string): Promise<FetchTradesResult> {
  // Always use authenticated userId - ignore caller-provided userId for security
  const authenticatedUserId = await getDatabaseUserId();
  if (!authenticatedUserId) {
    throw new Error('Unauthorized: Must be authenticated');
  }
  
  const trades = await prisma.trade.findMany({
    where: {
      userId: authenticatedUserId
    },
    orderBy: [
      { accountNumber: 'asc' },
      { instrument: 'asc' }
    ]
  })

  const groupedTrades = trades.reduce<GroupedTrades>((acc, trade) => {
    if (!acc[trade.accountNumber]) {
      acc[trade.accountNumber] = {}
    }
    if (!acc[trade.accountNumber][trade.instrument]) {
      acc[trade.accountNumber][trade.instrument] = []
    }
    acc[trade.accountNumber][trade.instrument].push(trade)
    return acc
  }, {})

  return {
    groupedTrades,
    flattenedTrades: trades
  }
}

export async function removeAccountsFromTradesAction(accountNumbers: string[]): Promise<void> {
  const userId = await getDatabaseUserId()
  await prisma.trade.deleteMany({
    where: {
      accountNumber: { in: accountNumbers },
      userId: userId
    }
  })
  await prisma.account.deleteMany({
    where: {
      number: { in: accountNumbers },
      userId: userId
    }
  })
  updateTag(`trades-${userId}`)
  updateTag(`user-data-${userId}`)
  // Invalidate all user-related caches
  invalidateAllUserCaches(userId)
}

export async function removeAccountFromTradesAction(accountNumber: string): Promise<void> {
  const userId = await getDatabaseUserId()
  await prisma.trade.deleteMany({
    where: {
      accountNumber: accountNumber,
      userId: userId
    }
  })
  updateTag(`trades-${userId}`)
  updateTag(`user-data-${userId}`)
  // Invalidate all user-related caches
  invalidateAllUserCaches(userId)
}

export async function deleteInstrumentGroupAction(accountNumber: string, instrumentGroup: string): Promise<void> {
  const effectiveUserId = await getDatabaseUserId()
  if (!effectiveUserId) {
    throw new Error('Unauthorized')
  }
  await prisma.trade.deleteMany({
    where: {
      accountNumber: accountNumber,
      instrument: { startsWith: instrumentGroup },
      userId: effectiveUserId
    }
  })
  if (effectiveUserId) {
    updateTag(`trades-${effectiveUserId}`)
    updateTag(`user-data-${effectiveUserId}`)
    // Invalidate all user-related caches
    invalidateAllUserCaches(effectiveUserId)
  }
}

export async function updateCommissionForGroupAction(accountNumber: string, instrumentGroup: string, newCommission: number): Promise<void> {
  const userId = await getDatabaseUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Use transaction to batch update all trades in the group atomically
  await prisma.$transaction(async (tx) => {
    // First get all trades in the group with their quantities
    const trades = await tx.trade.findMany({
      where: {
        accountNumber: accountNumber,
        instrument: { startsWith: instrumentGroup },
        userId
      },
      select: {
        id: true,
        quantity: true
      }
    })

    if (trades.length === 0) {
      return // No trades to update
    }

    // Calculate new commission for each trade and prepare batch updates
    const updateOperations = trades.map(trade => {
      const updatedCommission = new Prisma.Decimal(newCommission).times(new Prisma.Decimal(trade.quantity))
      return tx.trade.updateMany({
        where: {
          id: trade.id,
          userId
        },
        data: {
          commission: updatedCommission
        }
      })
    })

    // Execute all updates in parallel within the transaction
    await Promise.all(updateOperations)
  })

  updateTag(`trades-${userId}`)
  updateTag(`user-data-${userId}`)
  // Invalidate all user-related caches
  invalidateAllUserCaches(userId)
}

export async function renameAccountAction(oldAccountNumber: string, newAccountNumber: string): Promise<void> {
  try {
    const userId = await getDatabaseUserId()
    // First check if the account exists and get its ID
    const existingAccount = await prisma.account.findFirst({
      where: {
        number: oldAccountNumber,
        userId: userId
      }
    })

    if (!existingAccount) {
      throw new Error('Account not found')
    }

    // Check if the new account number is already in use by this user
    const duplicateAccount = await prisma.account.findFirst({
      where: {
        number: newAccountNumber,
        userId: userId
      }
    })

    if (duplicateAccount) {
      throw new Error('You already have an account with this number')
    }

    // Use a transaction to ensure all updates happen together
    await prisma.$transaction(async (tx) => {
      // Update the account number
      await tx.account.update({
        where: {
          id: existingAccount.id
        },
        data: {
          number: newAccountNumber
        }
      })

      // Update trades accountNumber
      await tx.trade.updateMany({
        where: {
          accountNumber: oldAccountNumber,
          userId: userId
        },
        data: {
          accountNumber: newAccountNumber
        }
      })

      // Update payouts accountNumber
      await tx.payout.updateMany({
        where: {
          accountId: existingAccount.id
        },
        data: {
          accountNumber: newAccountNumber
        }
      })
    })

    updateTag(`trades-${userId}`)
    updateTag(`user-data-${userId}`)
    // Invalidate all user-related caches
    invalidateAllUserCaches(userId)
  } catch (error) {
    console.error('Error renaming account:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to rename account')
  }
}

export async function deleteTradesByIdsAction(tradeIds: string[]): Promise<void> {
  const userId = await getDatabaseUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  await prisma.$transaction(async (tx) => {
    const ownedCount = await tx.trade.count({
      where: {
        id: { in: tradeIds },
        userId,
      },
    })

    if (ownedCount !== tradeIds.length) {
      throw new Error('Forbidden')
    }

    await tx.trade.deleteMany({
      where: {
        id: { in: tradeIds },
        userId,
      },
    })
  })

  updateTag(`trades-${userId}`)
  updateTag(`user-data-${userId}`)
  updateTag(`dashboard-${userId}`)
  // Invalidate all user-related caches
  invalidateAllUserCaches(userId)
}

export async function setupAccountAction(account: Account): Promise<Account> {
  const userId = await getDatabaseUserId()
  const existingAccount = await prisma.account.findFirst({
    where: {
      number: account.number,
      userId: userId
    }
  })

  // Extract fields that should not be included in the database operation
  // Remove computed fields (metrics, dailyMetrics) and relation fields
  const {
    id,
    userId: _,
    createdAt: _createdAt,
    payouts,
    groupId,
    balanceToDate,
    group,
    metrics,
    dailyMetrics,
    aboveBuffer,
    considerBuffer,
    trades,
    ...baseAccountData
  } = account

  // Only include considerBuffer when explicitly provided to avoid overriding unintentionally
  const considerBufferUpdate = considerBuffer === undefined ? {} : { considerBuffer }

  // Security: Validate groupId ownership before connecting
  if (groupId) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { userId: true }
    })
    if (!group) {
      throw new Error('Group not found')
    }
    if (group.userId !== userId) {
      throw new Error('Unauthorized: cannot connect to another user\'s group')
    }
  }

  // Build group relation payloads separately for update vs create
  // - Update: allow disconnect when groupId is explicitly null
  // - Create: Prisma does not accept `disconnect`; omit the relation when null/undefined
  const accountDataForUpdate = {
    ...baseAccountData,
    ...considerBufferUpdate,
    ...(groupId !== undefined &&
      (groupId
        ? {
          group: {
            connect: {
              id: groupId,
            },
          },
        }
        : {
          group: {
            disconnect: true,
          },
        })),
  }

  const accountDataForCreate = {
    ...baseAccountData,
    ...considerBufferUpdate,
    ...(groupId
      ? {
        group: {
          connect: {
            id: groupId,
          },
        },
      }
      : {}),
  }

  let savedAccount
  if (existingAccount) {
    savedAccount = await prisma.account.update({
      where: { id: existingAccount.id },
      data: accountDataForUpdate,
      include: {
        payouts: {
          select: {
            id: true,
            amount: true,
            date: true,
            status: true,
          }
        },
        group: true,
      }
    })
  } else {
    savedAccount = await prisma.account.create({
      data: {
        ...accountDataForCreate,
        user: {
          connect: {
            id: userId
          }
        }
      },
      include: {
        payouts: {
          select: {
            id: true,
            amount: true,
            date: true,
            status: true,
          }
        },
        group: true,
      }
    })
  }

  // Return the saved account with the original shape
  const result = {
    ...savedAccount,
    payouts: savedAccount.payouts,
    group: savedAccount.group,
  } as unknown as Account
  updateTag(`user-data-${userId}`)
  updateTag(`trades-${userId}`)
  // Invalidate all user-related caches
  invalidateAllUserCaches(userId)
  return result
}

export async function deleteAccountAction(account: Account) {
  const userId = await getDatabaseUserId()
  await prisma.account.delete({
    where: {
      id: account.id,
      userId: userId
    }
  })
  updateTag(`user-data-${userId}`)
  updateTag(`trades-${userId}`)
  // Invalidate all user-related caches
  invalidateAllUserCaches(userId)
}

export async function getAccountsAction() {
  try {
    // First get all accounts for the user
    const userId = await getDatabaseUserId()
    const accounts = await prisma.account.findMany({
      where: {
        userId: userId,
      },
      include: {
        payouts: {
          select: {
            id: true,
            amount: true,
            date: true,
            status: true,
          }
        }
      }
    })

    return accounts.map(account => ({
      ...account,
      number: account.number,
      payouts: account.payouts,
    }))
  } catch (error) {
    console.error('Error fetching accounts:', error)
    throw new Error('Failed to fetch accounts')
  }
}

export async function savePayoutAction(payout: Payout) {

  try {
    // First find the account to get its ID
    const userId = await getDatabaseUserId()
    const account = await prisma.account.findFirst({
      where: {
        number: payout.accountNumber,
        userId: userId
      }
    })

    if (!account) {
      throw new Error('Account not found')
    }

    // Security: Verify ownership if updating existing payout
    if (payout.id) {
      const existingPayout = await prisma.payout.findFirst({
        where: {
          id: payout.id,
          account: {
            userId: userId
          }
        },
        select: {
          id: true,
          accountNumber: true,
        },
      })
      if (!existingPayout) {
        throw new Error('Payout not found or unauthorized')
      }
      if (existingPayout.accountNumber !== payout.accountNumber) {
        throw new Error('Cannot modify payout for different account')
      }
    }

    // Use transaction to ensure atomicity - payout creation/update and account payoutCount update
    const result = await prisma.$transaction(async (tx) => {
      let payoutResult

      if (payout.id) {
        // Update existing payout
        payoutResult = await tx.payout.update({
          where: { id: payout.id },
          data: {
            accountNumber: payout.accountNumber,
            date: payout.date,
            amount: payout.amount,
            status: payout.status,
            account: {
              connect: {
                id: account.id
              }
            }
          },
        })
      } else {
        // Create new payout and increment payoutCount atomically
        payoutResult = await tx.payout.create({
          data: {
            id: payout.id || crypto.randomUUID(),
            accountNumber: payout.accountNumber,
            date: payout.date,
            amount: payout.amount,
            status: payout.status,
            account: {
              connect: {
                id: account.id
              }
            }
          },
        })

        // Increment payoutCount on the account atomically
        await tx.account.update({
          where: { id: account.id },
          data: {
            payoutCount: {
              increment: 1
            }
          }
        })
      }

      return payoutResult
    })

    updateTag(`user-data-${userId}`)
    // Invalidate all user-related caches
    invalidateAllUserCaches(userId)
    return result
  } catch (error) {
    console.error('Error adding payout:', error)
    throw new Error('Failed to add payout')
  }
}

export async function deletePayoutAction(payoutId: string) {
  try {
    const userId = await getDatabaseUserId()
    if (!userId) {
      throw new Error('Unauthorized')
    }
    
    // First get the payout to know which account to update
    const payout = await prisma.payout.findFirst({
      where: { id: payoutId, account: { userId: userId } },
      include: {
        account: true
      }
    });

    if (!payout) {
      throw new Error('Payout not found');
    }

    // Use transaction to ensure atomicity - delete payout and decrement payoutCount atomically
    await prisma.$transaction(async (tx) => {
      // Delete the payout
      const deleted = await tx.payout.deleteMany({
        where: {
          id: payoutId,
          account: {
            userId
          }
        }
      });
      
      if (deleted.count !== 1) {
        throw new Error('Payout not found');
      }

      // Decrement the payoutCount on the account atomically
      await tx.account.update({
        where: {
          id: payout.account.id
        },
        data: {
          payoutCount: {
            decrement: 1
          }
        }
      });
    });

    updateTag(`user-data-${userId}`)
    // Invalidate all user-related caches
    invalidateAllUserCaches(userId)
    return true;
  } catch (error) {
    console.error('Failed to delete payout:', error);
    throw new Error('Failed to delete payout');
  }
}

export async function renameInstrumentAction(accountNumber: string, oldInstrumentName: string, newInstrumentName: string): Promise<void> {
  try {
    const userId = await getDatabaseUserId()
    // Update all trades for this instrument in this account
    await prisma.trade.updateMany({
      where: {
        accountNumber: accountNumber,
        instrument: oldInstrumentName,
        userId: userId
      },
      data: {
        instrument: newInstrumentName
      }
    })
    updateTag(`trades-${userId}`)
    updateTag(`user-data-${userId}`)
    // Invalidate all user-related caches
    invalidateAllUserCaches(userId)
  } catch (error) {
    console.error('Error renaming instrument:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to rename instrument')
  }
}

export async function checkAndResetAccountsAction() {
  const userId = await getDatabaseUserId()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const accountsToReset = await prisma.account.findMany({
    where: {
      userId,
      resetDate: {
        lte: today,
      },
    },
  })

  for (const account of accountsToReset) {
    await prisma.account.update({
      where: {
        id: account.id
      },
      data: {
        resetDate: null,
      }
    })
  }
}


export async function createAccountAction(accountNumber: string) {
  try {
    const userId = await getDatabaseUserId()
    const account = await prisma.account.create({
      data: {
        number: accountNumber,
        userId,
        propfirm: '',
        drawdownThreshold: 0,
        profitTarget: 0,
        isPerformance: false,
        payoutCount: 0,
      },
    })
    updateTag(`user-data-${userId}`)
    updateTag(`trades-${userId}`)
    invalidateAllUserCaches(userId)
    return account
  } catch (error) {
    console.error('Error creating account:', error)
    throw error
  }
}

/**
 * Calculate account balance for multiple accounts
 * @param accounts Array of accounts to calculate balance for
 * @returns Array of accounts with calculated balanceToDate
 */
export async function calculateAccountBalanceAction(
  accounts: Account[],
  processedTrades?: Trade[]
): Promise<Account[]> {
  if (processedTrades?.length) {
    const tradesByAccount = processedTrades.reduce((acc, trade) => {
      (acc[trade.accountNumber] ||= []).push(trade);
      return acc;
    }, {} as Record<string, Trade[]>);
    return accounts.map(account => {
      const accountTrades = tradesByAccount[account.number] ?? [];
      return {
        ...account,
        balanceToDate: calculateAccountBalance(account, accountTrades),
      };
    });
  }
  const userId = await getDatabaseUserId()

  // Early return if no accounts
  if (accounts.length === 0) {
    return [];
  }

  // Collect all account numbers needed
  const accountNumbers = accounts.map(account => account.number);

  // Fetch only required fields for better performance
  const trades = await prisma.trade.findMany({
    where: {
      accountNumber: {
        in: accountNumbers,
      },
      userId: userId
    },
    select: {
      accountNumber: true,
      pnl: true,
      commission: true,
    },
  });

  // Group trades by account number
  const tradesByAccount = trades.reduce((acc, trade) => {
    if (!acc[trade.accountNumber]) {
      acc[trade.accountNumber] = [];
    }
    acc[trade.accountNumber].push(trade);
    return acc;
  }, {} as Record<string, Array<{ accountNumber: string; pnl: Prisma.Decimal; commission: Prisma.Decimal }>>);

  return accounts.map(account => {
    const accountTrades = tradesByAccount[account.number] || [];
    return {
      ...account,
      balanceToDate: calculateAccountBalance(account, accountTrades),
    };
  });
}

/**
 * Calculate balance for a single account
 * @param account The account to calculate balance for
 * @param trades Array of trades for this specific account (already filtered)
 * @returns The calculated balance
 */
function calculateAccountBalance(
  account: Account,
  trades: Array<{ accountNumber: string; pnl: Prisma.Decimal; commission: Prisma.Decimal }>
): number {
  let balance = new Prisma.Decimal(account.startingBalance || 0);

  // Calculate PnL from trades
  const tradesPnL = trades.reduce((sum, trade) => sum.plus(trade.pnl.minus(trade.commission)), new Prisma.Decimal(0));
  balance = balance.plus(tradesPnL);

  return balance.toNumber();
}

/**
 * Calculate comprehensive metrics for accounts including consistency, trading days, and daily metrics
 * Fetches trades from database internally to avoid passing large data to server action
 * @param accounts Array of accounts to calculate metrics for
 * @returns Array of accounts with computed metrics
 */
export async function calculateAccountMetricsAction(
  accounts: Account[]
): Promise<Account[]> {
  if (accounts.length === 0) {
    return [];
  }

  const userId = await getDatabaseUserId();
  const accountNumbers = accounts.map(account => account.number);

  // Fetch trades from database internally
  const trades = await prisma.trade.findMany({
    where: {
      accountNumber: {
        in: accountNumbers,
      },
      userId: userId
    },
  });

  // Normalize trades for metrics calculation
  const normalizedTrades: NormalizedTrade[] = trades.map(trade => ({
    ...trade,
    entryPrice: decimalToNumber(trade.entryPrice),
    closePrice: decimalToNumber(trade.closePrice, null),
    pnl: decimalToNumber(trade.pnl),
    commission: decimalToNumber(trade.commission, null),
    quantity: decimalToNumber(trade.quantity),
    timeInPosition: decimalToNumber(trade.timeInPosition, null),
    entryDate: trade.entryDate,
    closeDate: trade.closeDate,
    tags: Array.isArray(trade.tags) ? trade.tags : [],
  })) as NormalizedTrade[];

  // Delegate to shared utility so both server and client compute identically
  return computeMetricsForAccounts(accounts, normalizedTrades)
}

/**
 * Get account metrics with caching
 *
 * This function caches computed metrics to reduce database load.
 * Cache is automatically invalidated when trades/accounts are modified.
 *
 * @param accounts - Array of accounts to compute metrics for
 * @returns Accounts with computed metrics
 */
export async function getAccountMetrics(accounts: Account[]): Promise<Account[]> {
  const userId = await getDatabaseUserId()
  const shouldCache = FEATURE_FLAGS.ENABLE_QUERY_CACHING

  const computeMetrics = async () => {
    return calculateAccountMetricsAction(accounts)
  }

  // Use cache only if feature flag is enabled
  if (shouldCache) {
    const cachedCompute = cacheQuery(
      computeMetrics,
      ['account-metrics', userId],
      {
        revalidateIn: 60, // Cache for 1 minute
        tags: [`account-metrics-${userId}`]
      }
    )
    return cachedCompute()
  }

  // Bypass cache if feature flag is disabled
  return computeMetrics()
}
