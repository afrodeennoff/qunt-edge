"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CandlestickChart } from "@/components/charts/candlestick-chart"
import { Heatmap } from "@/components/charts/heatmap"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity, BarChart2, PieChart, Sparkles } from "lucide-react"

// Mock Data
const candleData = Array.from({ length: 60 }, (_, i) => {
    const base = 2000 + Math.sin(i * 0.1) * 100
    const open = base + Math.random() * 20 - 10
    const close = base + Math.random() * 20 - 10
    return {
        date: new Date(Date.now() - (60 - i) * 86400000).toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        high: Number((Math.max(open, close) + Math.random() * 10).toFixed(2)),
        low: Number((Math.min(open, close) - Math.random() * 10).toFixed(2)),
        close: Number(close.toFixed(2)),
    }
})

const heatmapData = [
    { x: 'Mon', y: '00-04', value: 5 }, { x: 'Tue', y: '00-04', value: -2 }, { x: 'Wed', y: '00-04', value: 8 }, { x: 'Thu', y: '00-04', value: 3 }, { x: 'Fri', y: '00-04', value: -1 },
    { x: 'Mon', y: '04-08', value: 12 }, { x: 'Tue', y: '04-08', value: 15 }, { x: 'Wed', y: '04-08', value: -5 }, { x: 'Thu', y: '04-08', value: 20 }, { x: 'Fri', y: '04-08', value: 10 },
    { x: 'Mon', y: '08-12', value: -8 }, { x: 'Tue', y: '08-12', value: 5 }, { x: 'Wed', y: '08-12', value: 12 }, { x: 'Thu', y: '08-12', value: -15 }, { x: 'Fri', y: '08-12', value: 25 },
    { x: 'Mon', y: '12-16', value: 20 }, { x: 'Tue', y: '12-16', value: -10 }, { x: 'Wed', y: '12-16', value: 15 }, { x: 'Thu', y: '12-16', value: 8 }, { x: 'Fri', y: '12-16', value: -5 },
    { x: 'Mon', y: '16-20', value: 5 }, { x: 'Tue', y: '16-20', value: 2 }, { x: 'Wed', y: '16-20', value: -3 }, { x: 'Thu', y: '16-20', value: 6 }, { x: 'Fri', y: '16-20', value: 4 },
]

export default function TerminalPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 lg:flex-row lg:overflow-hidden">
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto lg:overflow-hidden">

        {/* Top Bar: Ticker & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">ES</h1>
                    <span className="text-xs text-muted-foreground">E-Mini S&P 500</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-lg font-mono font-medium text-success">4,124.50</span>
                    <div className="flex items-center text-xs text-success">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        +12.25 (0.3%)
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Tabs defaultValue="1D" className="w-[300px]">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="1D">1D</TabsTrigger>
                        <TabsTrigger value="7D">7D</TabsTrigger>
                        <TabsTrigger value="1M">1M</TabsTrigger>
                        <TabsTrigger value="1Y">1Y</TabsTrigger>
                        <TabsTrigger value="ALL">All</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="outline" size="sm">Indicators</Button>
            </div>
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 min-h-[400px] rounded-xl border border-border bg-card p-4 shadow-sm">
            <CandlestickChart data={candleData} height={500} />
        </div>

        {/* Bottom Widgets Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 min-h-[250px]">
            {/* Heatmap */}
            <Card className="col-span-1 border-border shadow-sm">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-accent" />
                        Transaction Heatmap
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <Heatmap data={heatmapData} height={200} />
                </CardContent>
            </Card>

            {/* Volume Analysis */}
            <Card className="col-span-1 border-border shadow-sm">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-accent" />
                        Volume Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col justify-center h-[220px]">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>Buy Volume</span>
                                <span className="font-mono">1.2M</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                <div className="h-full bg-success w-[65%]" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>Sell Volume</span>
                                <span className="font-mono">850K</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                <div className="h-full bg-destructive w-[35%]" />
                            </div>
                        </div>
                         <div className="pt-4 border-t border-border">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Delta</span>
                                <span className="text-sm font-mono text-success">+350K</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Long/Short Ratio */}
            <Card className="col-span-1 border-border shadow-sm">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-accent" />
                        Long/Short Ratio
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex items-center justify-center h-[220px]">
                     <div className="relative h-32 w-32 rounded-full border-8 border-secondary flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-8 border-success border-r-transparent border-b-transparent rotate-45" />
                        <div className="text-center">
                            <div className="text-xl font-bold">62%</div>
                            <div className="text-[10px] text-muted-foreground uppercase">Longs</div>
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Right Sidebar: Portfolio & AI */}
      <div className="flex w-full flex-col gap-4 lg:w-[320px] h-full overflow-hidden">

        {/* Unlocks Progress Widget */}
        <Card className="border-border bg-gradient-to-br from-card to-accent/5">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium">Daily Goal Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16">
                         <svg className="h-full w-full" viewBox="0 0 36 36">
                            <path
                                className="text-secondary"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            <path
                                className="text-accent"
                                strokeDasharray="75, 100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">75%</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold font-mono">$1,240</div>
                        <div className="text-xs text-muted-foreground">/ $1,650 Target</div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Portfolio Panel */}
        <Card className="flex-1 flex flex-col border-border overflow-hidden">
            <CardHeader className="p-4 border-b border-border">
                <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {['Apex Funding', 'Topstep', 'MyFundedFX'].map((firm, i) => (
                        <div key={firm} className="flex justify-between items-center p-3 rounded-lg bg-secondary/30 border border-border/50">
                            <div>
                                <div className="text-sm font-medium">{firm}</div>
                                <div className="text-xs text-muted-foreground">Account #{1000 + i}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-mono">$52,{(i+1)*100}.00</div>
                                <div className="text-xs text-success">+{(i+1)*0.5}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </Card>

        {/* AI Assistant (Collapsible) */}
        <Card className="h-[300px] border-border flex flex-col">
            <CardHeader className="p-4 border-b border-border bg-accent/5">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    AI Assistant
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-3 text-sm">
                    <div className="bg-secondary/50 p-3 rounded-lg rounded-tl-none">
                        <p className="text-muted-foreground text-xs mb-1">AI Assistant</p>
                        High probability setup detected on ES. Divergence on 15m timeframe matches your A+ setup criteria.
                    </div>
                    <div className="bg-accent/10 p-3 rounded-lg rounded-tr-none ml-auto max-w-[90%]">
                         <p className="text-accent text-xs mb-1 text-right">You</p>
                        Show me the risk metrics.
                    </div>
                </div>
            </CardContent>
            <div className="p-3 border-t border-border">
                <input
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Ask AI..."
                />
            </div>
        </Card>

      </div>
    </div>
  )
}
