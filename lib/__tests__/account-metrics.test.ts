/**
 * Financial Calculations Test Suite
 * 
 * CRITICAL: These tests verify money calculations accuracy
 * Any bugs here affect user's profit/loss reporting
 * 
 * Coverage target: 90%+
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { computeAccountMetrics, type Account, type Trade } from '@/lib/account-metrics'
import Decimal from 'decimal.js'

describe('Account Metrics - Financial Calculations', () => {
    let testAccount: Account
    let testTrades: Trade[]

    beforeEach(() => {
        // Reset test data before each test
        testAccount = {
            id: 'test-account-1',
            number: 'ACC001',
            userId: 'test-user',
            name: 'Test Trading Account',
            startingBalance: 10000,
            profitTarget: 1000,
            drawdownThreshold: 500,
            consistencyPercentage: 30,
            buffer: 0,
            considerBuffer: true,
            resetDate: null,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date(),
            payouts: [],
            metrics: null,
            dailyMetrics: null,
        }

        testTrades = []
    })

    describe('Basic PnL Calculations', () => {
        it('should calculate correct net PnL with commission', () => {
            testTrades = [
                createTrade({ pnl: 500, commission: 5 }),
                createTrade({ pnl: 600, commission: 10 }),
                createTrade({ pnl: -200, commission: 3 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Net PnL = (500 - 5) + (600 - 10) + (-200 - 3) = 882
            expect(result.metrics.totalProfit).toBe(882)
        })

        it('should handle zero commission correctly', () => {
            testTrades = [
                createTrade({ pnl: 100, commission: 0 }),
                createTrade({ pnl: 50, commission: 0 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            expect(result.metrics.totalProfit).toBe(150)
        })

        it('should calculate correct balance from starting balance', () => {
            testAccount.startingBalance = 10000
            testTrades = [
                createTrade({ pnl: 500, commission: 5 }),
                createTrade({ pnl: 600, commission: 10 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Balance = 10000 + (500-5) + (600-10) = 11085
            expect(result.balanceToDate).toBe(11085)
        })

        it('should handle negative PnL correctly', () => {
            testTrades = [
                createTrade({ pnl: -300, commission: 5 }),
                createTrade({ pnl: -200, commission: 3 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Net PnL = (-300 - 5) + (-200 - 3) = -508
            expect(result.metrics.totalProfit).toBe(-508)
        })

        it('should handle decimal precision correctly', () => {
            testTrades = [
                createTrade({ pnl: 10.5, commission: 0.3 }),
                createTrade({ pnl: 20.7, commission: 0.5 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Net PnL = (10.5 - 0.3) + (20.7 - 0.5) = 30.4
            expect(result.metrics.totalProfit).toBe(30.4)
        })
    })

    describe('Trailing Drawdown Calculation', () => {
        it('should calculate maximum drawdown from peak', () => {
            testAccount.startingBalance = 10000
            testTrades = [
                createTrade({ pnl: 1000, date: '2024-01-01' }), // Balance: 11000 (new peak)
                createTrade({ pnl: -300, date: '2024-01-02' }), // Balance: 10700
                createTrade({ pnl: -400, date: '2024-01-03' }), // Balance: 10300 (drawdown: 700)
                createTrade({ pnl: 500, date: '2024-01-04' }),  // Balance: 10800 (recovering)
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Max drawdown from peak (11000) to lowest (10300) = 700
            expect(result.metrics.maxDrawdown).toBe(700)
        })

        it('should track current drawdown from highest balance', () => {
            testAccount.startingBalance = 10000
            testTrades = [
                createTrade({ pnl: 2000, date: '2024-01-01' }), // Peak: 12000
                createTrade({ pnl: -500, date: '2024-01-02' }), // Current: 11500
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Current drawdown = 12000 - 11500 = 500
            expect(result.metrics.currentDrawdown).toBe(500)
        })

        it('should reset drawdown when new peak is reached', () => {
            testAccount.startingBalance = 10000
            testTrades = [
                createTrade({ pnl: 1000, date: '2024-01-01' }), // Peak: 11000
                createTrade({ pnl: -300, date: '2024-01-02' }), // Drawdown: 300
                createTrade({ pnl: 500, date: '2024-01-03' }),  // New peak: 11200
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Current drawdown should be 0 (new peak reached)
            expect(result.metrics.currentDrawdown).toBe(0)
        })

        it('should not have drawdown with only profitable trades', () => {
            testAccount.startingBalance = 10000
            testTrades = [
                createTrade({ pnl: 100 }),
                createTrade({ pnl: 200 }),
                createTrade({ pnl: 150 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            expect(result.metrics.maxDrawdown).toBe(0)
            expect(result.metrics.currentDrawdown).toBe(0)
        })
    })

    describe('Buffer Filtering', () => {
        it('should exclude trades before buffer threshold is reached', () => {
            testAccount.buffer = 500
            testAccount.considerBuffer = true

            testTrades = [
                createTrade({ pnl: 100, date: '2024-01-01' }), // Cumulative: 100
                createTrade({ pnl: 200, date: '2024-01-02' }), // Cumulative: 300
                createTrade({ pnl: 250, date: '2024-01-03' }), // Cumulative: 550 (crosses buffer!)
                createTrade({ pnl: 150, date: '2024-01-04' }), // Cumulative: 700 (above buffer)
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Only last 2 trades count (after crossing buffer threshold)
            expect(result.trades.length).toBe(2)
            expect(result.aboveBuffer).toBe(200) // 700 - 500
        })

        it('should not filter trades when buffer is 0', () => {
            testAccount.buffer = 0
            testAccount.considerBuffer = true

            testTrades = [
                createTrade({ pnl: 100 }),
                createTrade({ pnl: 200 }),
                createTrade({ pnl: 300 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // All trades should count
            expect(result.trades.length).toBe(3)
        })

        it('should not filter trades when considerBuffer is false', () => {
            testAccount.buffer = 500
            testAccount.considerBuffer = false

            testTrades = [
                createTrade({ pnl: 100 }),
                createTrade({ pnl: 200 }),
                createTrade({ pnl: 300 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // All trades should count (buffer disabled)
            expect(result.trades.length).toBe(3)
        })

        it('should handle payouts in buffer calculation', () => {
            testAccount.buffer = 1000
            testAccount.considerBuffer = true
            testAccount.payouts = [
                {
                    id: 'payout-1',
                    amount: 500,
                    date: new Date('2024-01-02'),
                    status: 'PAID',
                    accountId: testAccount.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]

            testTrades = [
                createTrade({ pnl: 800, date: '2024-01-01' }),  // Before payout
                createTrade({ pnl: 500, date: '2024-01-03' }),  // After payout, cumulative: 300
                createTrade({ pnl: 800, date: '2024-01-04' }),  // Cumulative: 1100 (crosses buffer!)
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Should only count last trade (after buffer crossed)
            expect(result.trades.length).toBe(1)
        })
    })

    describe('Consistency Rules', () => {
        it('should identify consistent trading within limit', () => {
            testAccount.profitTarget = 1000
            testAccount.consistencyPercentage = 30 // Max 30% of target per day

            testTrades = [
                createTrade({ pnl: 250, date: '2024-01-01' }), // 25% of target
                createTrade({ pnl: 200, date: '2024-01-02' }), // 20% of target
                createTrade({ pnl: 280, date: '2024-01-03' }), // 28% of target
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Max daily profit = 30% of 1000 = 300
            expect(result.metrics.maxAllowedDailyProfit).toBe(300)
            expect(result.metrics.isConsistent).toBe(true)
            expect(result.metrics.highestProfitDay).toBe(280)
        })

        it('should identify inconsistent trading (exceeds limit)', () => {
            testAccount.profitTarget = 1000
            testAccount.consistencyPercentage = 30

            testTrades = [
                createTrade({ pnl: 250, date: '2024-01-01' }),
                createTrade({ pnl: 400, date: '2024-01-02' }), // 40% - violates 30% rule!
                createTrade({ pnl: 200, date: '2024-01-03' }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            expect(result.metrics.isConsistent).toBe(false)
            expect(result.metrics.highestProfitDay).toBe(400)
        })

        it('should aggregate daily PnL correctly for consistency check', () => {
            testAccount.profitTarget = 1000
            testAccount.consistencyPercentage = 30

            testTrades = [
                // Multiple trades on same day
                createTrade({ pnl: 150, date: '2024-01-01T10:00:00Z' }),
                createTrade({ pnl: 100, date: '2024-01-01T14:00:00Z' }),
                createTrade({ pnl: 80, date: '2024-01-01T16:00:00Z' }),
                // Total for 2024-01-01 = 330 (exceeds 300 limit)
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            expect(result.metrics.highestProfitDay).toBe(330)
            expect(result.metrics.isConsistent).toBe(false)
        })
    })

    describe('Reset Date Handling', () => {
        it('should only include trades after reset date', () => {
            testAccount.resetDate = new Date('2024-02-01')

            testTrades = [
                createTrade({ pnl: 100, date: '2024-01-15' }), // Before reset
                createTrade({ pnl: 200, date: '2024-01-25' }), // Before reset
                createTrade({ pnl: 300, date: '2024-02-01' }), // On reset date
                createTrade({ pnl: 150, date: '2024-02-05' }), // After reset
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Should only count last 2 trades
            expect(result.trades.length).toBe(2)
            expect(result.metrics.totalProfit).toBe(450) // 300 + 150
        })

        it('should include all trades when resetDate is null', () => {
            testAccount.resetDate = null

            testTrades = [
                createTrade({ pnl: 100, date: '2024-01-01' }),
                createTrade({ pnl: 200, date: '2024-02-01' }),
                createTrade({ pnl: 300, date: '2024-03-01' }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            expect(result.trades.length).toBe(3)
        })
    })

    describe('Trading Days Calculation', () => {
        it('should count unique trading days', () => {
            testTrades = [
                createTrade({ date: '2024-01-01T10:00:00Z' }),
                createTrade({ date: '2024-01-01T14:00:00Z' }), // Same day
                createTrade({ date: '2024-01-02T10:00:00Z' }),
                createTrade({ date: '2024-01-03T10:00:00Z' }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            expect(result.dailyMetrics.tradingDays).toBe(3)
        })

        it('should handle empty trades array', () => {
            testTrades = []

            const result = computeAccountMetrics(testAccount, testTrades)

            expect(result.dailyMetrics.tradingDays).toBe(0)
            expect(result.metrics.totalProfit).toBe(0)
            expect(result.balanceToDate).toBe(testAccount.startingBalance)
        })
    })

    describe('Edge Cases', () => {
        it('should handle very small decimal values', () => {
            testTrades = [
                createTrade({ pnl: 0.01, commission: 0.001 }),
                createTrade({ pnl: 0.02, commission: 0.002 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // (0.01 - 0.001) + (0.02 - 0.002) = 0.027
            expect(result.metrics.totalProfit).toBe(0.027)
        })

        it('should handle very large numbers', () => {
            testTrades = [
                createTrade({ pnl: 1000000, commission: 50 }),
                createTrade({ pnl: 2000000, commission: 100 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            expect(result.metrics.totalProfit).toBe(2999850)
        })

        it('should handle account with no profit target or drawdown threshold', () => {
            testAccount.profitTarget = 0
            testAccount.drawdownThreshold = 0

            testTrades = [
                createTrade({ pnl: 500 }),
                createTrade({ pnl: 300 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // Should still calculate totals
            expect(result.metrics.totalProfit).toBe(800)
            expect(result.metrics.isConsistent).toBe(false) // Not configured
        })
    })

    describe('Profit Target Progress', () => {
        it('should calculate profit target percentage', () => {
            testAccount.profitTarget = 1000
            testAccount.startingBalance = 10000

            testTrades = [
                createTrade({ pnl: 500 }),
                createTrade({ pnl: 250 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            // 750 / 1000 = 75%
            const progress = (result.metrics.totalProfit / testAccount.profitTarget!) * 100
            expect(progress).toBe(75)
        })

        it('should handle profit exceeding target', () => {
            testAccount.profitTarget = 1000

            testTrades = [
                createTrade({ pnl: 1200 }),
            ]

            const result = computeAccountMetrics(testAccount, testTrades)

            const progress = (result.metrics.totalProfit / testAccount.profitTarget!) * 100
            expect(progress).toBeGreaterThan(100)
        })
    })
})

// Helper function to create test trades
function createTrade(overrides: Partial<Trade> = {}): Trade {
    return {
        id: `trade-${Math.random()}`,
        accountNumber: 'ACC001',
        userId: 'test-user',
        instrument: 'ES',
        side: 'LONG',
        quantity: 1,
        entryPrice: 4500,
        closePrice: 4510,
        pnl: overrides.pnl ?? 100,
        commission: overrides.commission ?? 2,
        entryDate: new Date(overrides.date || '2024-01-01'),
        closeDate: new Date(overrides.date || '2024-01-01'),
        timeInPosition: 300,
        tags: [],
        groupId: null,
        comment: null,
        imageBase64: null,
        imageBase64Second: null,
        entryId: null,
        closeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
}
