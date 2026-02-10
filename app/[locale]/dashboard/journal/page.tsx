"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Filter, Download, Plus, TrendingUp, Target, BarChart2, Activity } from "lucide-react"

// Mock Data
const trades = Array.from({ length: 15 }, (_, i) => {
    const isWin = Math.random() > 0.4
    const pnl = isWin ? Math.random() * 500 : Math.random() * -300
    const entry = 4100 + Math.random() * 100

    return {
        id: `TRD-${1000 + i}`,
        ticker: "ES",
        date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
        entry: entry.toFixed(2),
        exit: (entry + (isWin ? 5 : -5)).toFixed(2),
        pnl: pnl.toFixed(2),
        risk: "1.0%",
        rr: isWin ? "2.5" : "-1.0",
        status: isWin ? "WIN" : "LOSS",
    }
})

export default function JournalPage() {
  return (
    <div className="flex flex-col gap-6 p-6 h-[calc(100vh-4rem)] overflow-hidden">

        {/* Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
                <p className="text-muted-foreground">Analyze your execution and refine your edge.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Trade
                </Button>
            </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net P&L</CardTitle>
                    <TrendingUp className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-success">+$2,450.00</div>
                    <p className="text-xs text-muted-foreground">+12.5% from last month</p>
                </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                    <Target className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">68%</div>
                    <p className="text-xs text-muted-foreground">+2.1% improvement</p>
                </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Win / Loss</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$420 / $180</div>
                    <p className="text-xs text-muted-foreground">2.33 Profit Factor</p>
                </CardContent>
            </Card>
             <Card className="bg-card border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">142</div>
                    <p className="text-xs text-muted-foreground">34 this month</p>
                </CardContent>
            </Card>
        </div>

        {/* Main Content Area: Table & Detailed Analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 flex-1 min-h-0">

            {/* Trade List Table */}
            <Card className="lg:col-span-2 border-border shadow-sm flex flex-col overflow-hidden">
                <CardHeader className="p-4 border-b border-border">
                    <CardTitle className="text-lg font-medium">Recent Trades</CardTitle>
                </CardHeader>
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/30 sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="w-[100px]">Ticker</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Entry</TableHead>
                                <TableHead>Exit</TableHead>
                                <TableHead>P&L</TableHead>
                                <TableHead>Risk</TableHead>
                                <TableHead>R/R</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trades.map((trade) => (
                                <TableRow key={trade.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-mono">{trade.ticker}</Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{trade.date}</TableCell>
                                    <TableCell className="font-mono text-xs">{trade.entry}</TableCell>
                                    <TableCell className="font-mono text-xs">{trade.exit}</TableCell>
                                    <TableCell className={`font-mono font-medium ${Number(trade.pnl) > 0 ? 'text-success' : 'text-destructive'}`}>
                                        {Number(trade.pnl) > 0 ? '+' : ''}{trade.pnl}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{trade.risk}</TableCell>
                                    <TableCell className="text-xs font-mono">{trade.rr}R</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Right Sidebar: Analytics Deep Dive */}
            <div className="flex flex-col gap-6 overflow-y-auto">
                <Card className="border-border shadow-sm">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Performance Radar</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-center p-4">
                        {/* Placeholder for Radar Chart */}
                         <div className="relative h-48 w-48 rounded-full border border-dashed border-border flex items-center justify-center">
                            <div className="absolute inset-4 rounded-full border border-border opacity-50" />
                            <div className="absolute inset-8 rounded-full border border-border opacity-30" />
                            <div className="text-xs text-muted-foreground text-center">
                                Win Rate<br/><span className="font-bold text-foreground">A+</span>
                            </div>
                            {/* Simple SVG Polygon for Radar */}
                            <svg className="absolute inset-0 h-full w-full text-accent/20" viewBox="0 0 100 100">
                                <polygon points="50,10 90,40 80,80 20,80 10,40" fill="currentColor" stroke="hsl(var(--accent))" strokeWidth="2" />
                            </svg>
                         </div>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm flex-1">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => (
                             <div key={week} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>{week}</span>
                                    <span className={i % 2 === 0 ? "text-success" : "text-destructive"}>
                                        {i % 2 === 0 ? "+$840" : "-$120"}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className={`h-full ${i % 2 === 0 ? "bg-success" : "bg-destructive"}`}
                                        style={{ width: `${Math.random() * 80 + 10}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

        </div>
    </div>
  )
}
