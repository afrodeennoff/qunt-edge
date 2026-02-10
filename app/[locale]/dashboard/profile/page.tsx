"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
  Share2,
  Settings,
  Trophy,
  History,
  TrendingUp
} from "lucide-react"

// Mock Data
const assets = [
  { symbol: "USDT", name: "Tether", balance: "42,500.00", value: "$42,500.00", allocation: 45, change: "+0.01%" },
  { symbol: "BTC", name: "Bitcoin", balance: "0.45", value: "$18,900.00", allocation: 20, change: "+2.4%" },
  { symbol: "ETH", name: "Ethereum", balance: "4.2", value: "$9,240.00", allocation: 10, change: "-1.2%" },
  { symbol: "SOL", name: "Solana", balance: "150", value: "$14,250.00", allocation: 15, change: "+5.8%" },
]

const recentActivity = [
  { type: "Deposit", asset: "USDT", amount: "+5,000.00", date: "2h ago", status: "Completed" },
  { type: "Trade", asset: "BTC/USDT", amount: "-0.1 BTC", date: "5h ago", status: "Filled" },
  { type: "Withdrawal", asset: "ETH", amount: "-2.0 ETH", date: "1d ago", status: "Processing" },
]

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 p-6 min-h-[calc(100vh-4rem)]">

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-accent">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Alex Trader</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="font-mono text-xs">PRO TIER</Badge>
              <span className="text-sm text-muted-foreground">Member since 2023</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share Profile
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column: Stats & Allocation */}
        <div className="flex flex-col gap-6 md:col-span-2">

            {/* Net Worth Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
                        <Wallet className="h-4 w-4 text-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$84,890.00</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <ArrowUpRight className="h-3 w-3 text-success mr-1" />
                            +12.5% this month
                        </p>
                    </CardContent>
                </Card>
                 <Card className="border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">PnL (30d)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-success">+$4,250.00</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            vs -$1,200 last month
                        </p>
                    </CardContent>
                </Card>
                 <Card className="border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Best Day</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">+$1,850.00</div>
                        <p className="text-xs text-muted-foreground mt-1">
                           Oct 14, 2023
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Asset Allocation */}
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Allocation</TableHead>
                                <TableHead className="text-right">24h Change</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.map((asset) => (
                                <TableRow key={asset.symbol}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                                {asset.symbol[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold">{asset.symbol}</div>
                                                <div className="text-xs text-muted-foreground">{asset.name}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono">{asset.balance}</TableCell>
                                    <TableCell className="font-mono">{asset.value}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-24 rounded-full bg-secondary overflow-hidden">
                                                <div className="h-full bg-accent" style={{ width: `${asset.allocation}%` }} />
                                            </div>
                                            <span className="text-xs text-muted-foreground">{asset.allocation}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={`text-right font-mono ${asset.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                                        {asset.change}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>

        {/* Right Column: Recent Activity & Heatmap */}
        <div className="flex flex-col gap-6">

            {/* Recent Activity */}
            <Card className="border-border shadow-sm h-full">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {recentActivity.map((activity, i) => (
                            <div key={i} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                                <div>
                                    <p className="text-sm font-medium">{activity.type}</p>
                                    <p className="text-xs text-muted-foreground">{activity.date} • {activity.status}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-mono ${activity.amount.startsWith('+') ? 'text-success' : ''}`}>
                                        {activity.amount}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{activity.asset}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-4 text-xs">View All Activity</Button>
                </CardContent>
            </Card>

            {/* Small Heatmap Widget */}
            <Card className="border-border shadow-sm">
                 <CardHeader>
                    <CardTitle className="text-sm font-medium">Activity Heatmap</CardTitle>
                </CardHeader>
                <CardContent className="h-[150px] flex items-center justify-center">
                    <div className="grid grid-cols-10 gap-1">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 w-2 rounded-sm ${Math.random() > 0.7 ? 'bg-accent' : 'bg-muted/20'}`}
                                title={`Day ${i}`}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  )
}
