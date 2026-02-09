'use client'

import { Card } from "@/components/ui/card"
import { useEffect, useState } from 'react'
import { getUserStats } from '../../actions/stats'
import { Badge } from "@/components/ui/badge"
import { UserGrowthChart } from './user-growth-chart'
import { FreeUsersTable } from './free-users-table'

interface User {
  id: string
  email: string
  created_at: string
}

function valueFormatter(number: number) {
  return `${Intl.NumberFormat('us').format(number).toString()}`
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionsTable } from "@/app/[locale]/admin/components/payments/transactions-table"
import { SubscriptionsTable } from "@/app/[locale]/admin/components/payments/subscriptions-table"
import { getTransactionsAction, getSubscriptionsAction } from "@/app/[locale]/admin/actions/payment-actions"

export function AdminDashboard() {
  const [userStats, setUserStats] = useState<{
    totalUsers: number
    dailyData: { date: string, users: number }[]
    allUsers: User[]
  }>({ totalUsers: 0, dailyData: [], allUsers: [] })

  const [paymentData, setPaymentData] = useState<{
    transactions: any[]
    subscriptions: any[]
  }>({ transactions: [], subscriptions: [] })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getUserStats()
        setUserStats({
          totalUsers: userData.totalUsers,
          dailyData: userData.dailyData.map(item => ({
            date: item.date,
            users: Number(item.users)
          })),
          allUsers: userData.allUsers
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    async function fetchPaymentData() {
      const [txnRes, subRes] = await Promise.all([
        getTransactionsAction({ limit: 20 }),
        getSubscriptionsAction()
      ])

      setPaymentData({
        transactions: txnRes.success ? txnRes.transactions || [] : [],
        subscriptions: subRes.success ? subRes.subscriptions || [] : []
      })
    }

    fetchData()
    fetchPaymentData()
  }, [])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }


  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Total Users</h3>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="text-3xl font-bold">{valueFormatter(userStats.totalUsers)}</div>
            </Card>
          </div>

          <UserGrowthChart
            dailyData={userStats.dailyData}
            allUsers={userStats.allUsers}
          />
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Free Users</h3>
              <Badge variant="secondary">Active</Badge>
            </div>
            <FreeUsersTable />
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
            </div>
            <TransactionsTable transactions={paymentData.transactions} />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Subscriptions</h3>
            </div>
            <SubscriptionsTable subscriptions={paymentData.subscriptions} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 