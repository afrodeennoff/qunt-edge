'use server'

import { getDatabaseUserId } from '@/server/auth'
import { Trade, Payout, Prisma } from '@/prisma/generated/prisma'
import { computeMetricsForAccounts } from '@/lib/account-metrics'
import { Account } from '@/context/data-provider'
import { updateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

type GroupedTrades = Record<string, Record<string, Trade[]>>

interface FetchTradesResult {
  groupedTrades: GroupedTrades;
  flattenedTrades: Trade[];
}

export async function fetchGroupedTradesAction(userId: string): Promise<FetchTradesResult> {
  const trades = await prisma.trade.findMany({
    where: {
      userId: userId
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
}

export async function deleteInstrumentGroupAction(accountNumber: string, instrumentGroup: string, userId: string): Promise<void> {
  const currentUserId = await getDatabaseUserId()
  const effectiveUserId = currentUserId ?? userId
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
  }
}

export async function updateCommissionForGroupAction(accountNumber: string, instrumentGroup: string, newCommission: number): Promise<void> {
  const userId = await getDatabaseUserId()
  // We have to update the commission for all trades in the group and compute based on the quantity
  const trades = await prisma.trade.findMany({
    where: {
      accountNumber: accountNumber,
      instrument: { startsWith: instrumentGroup },
      userId
    }
  })
  // For each trade, update the commission
  for (const trade of trades) {
    const updatedCommission = new Prisma.Decimal(newCommission).times(new Prisma.Decimal(trade.quantity))
    await prisma.trade.update({
      where: {
        id: trade.id
      },
      data: {
        commission: updatedCommission
      }
    })
  }
  updateTag(`trades-${userId}`)
  updateTag(`user-data-${userId}`)
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
  await prisma.trade.deleteMany({
    where: {
      id: { in: tradeIds },
      userId
    }
  })
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

    const result = await prisma.payout.upsert({
      where: {
        id: payout.id
      },
      create: {
        id: crypto.randomUUID(),
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
      update: {
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
    updateTag(`user-data-${userId}`)
    return result
  } catch (error) {
    console.error('Error adding payout:', error)
    throw new Error('Failed to add payout')
  }
}

export async function deletePayoutAction(payoutId: string) {
  console.log('deletePayoutAction', payoutId)
  try {
    const userId = await getDatabaseUserId()
    const payout = await prisma.payout.findFirst({
      where: { id: payoutId, account: { userId: userId } },
      include: {
        account: true
      }
    });

    if (!payout) {
      throw new Error('Payout not found');
    }

    // Delete the payout
    await prisma.payout.delete({
      where: { id: payoutId }
    });

    // Decrement the payoutCount on the account
    await prisma.account.update({
      where: {
        id: payout.account.id
      },
      data: {
        payoutCount: {
          decrement: 1
        }
      }
    });

    updateTag(`user-data-${userId}`)
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
    select: {
      accountNumber: true,
      entryDate: true,
      pnl: true,
      commission: true,
    },
  });

  // Delegate to shared utility so both server and client compute identically
  return computeMetricsForAccounts(accounts, trades as Trade[])
}
