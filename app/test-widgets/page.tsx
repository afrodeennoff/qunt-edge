import { CandlestickChart } from "@/components/charts/candlestick-chart"
import { Heatmap } from "@/components/charts/heatmap"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const mockCandleData = Array.from({ length: 30 }, (_, i) => {
    const base = 100 + Math.sin(i * 0.2) * 20;
    const open = base + Math.random() * 5 - 2.5;
    const close = base + Math.random() * 5 - 2.5;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    return {
        date: `2024-01-${String(i+1).padStart(2, '0')}`,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
    }
})

const mockHeatmapData = [
    { x: 'Mon', y: 'Morning', value: 10 },
    { x: 'Mon', y: 'Afternoon', value: -5 },
    { x: 'Tue', y: 'Morning', value: 25 },
    { x: 'Tue', y: 'Afternoon', value: 15 },
    { x: 'Wed', y: 'Morning', value: -10 },
    { x: 'Wed', y: 'Afternoon', value: 5 },
    { x: 'Thu', y: 'Morning', value: 40 },
    { x: 'Thu', y: 'Afternoon', value: 30 },
    { x: 'Fri', y: 'Morning', value: 50 },
    { x: 'Fri', y: 'Afternoon', value: -20 },
]

export default function TestWidgetsPage() {
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Widget System Test</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Charts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CandlestickChart data={mockCandleData} title="ETH/USD Daily" />
            <Heatmap data={mockHeatmapData} title="Performance Heatmap" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Standard Card</CardTitle>
                </CardHeader>
                <CardContent>
                    This is a standard card with surface color.
                </CardContent>
            </Card>

            <Card className="border-accent/50">
                <CardHeader>
                    <CardTitle>Accent Border</CardTitle>
                </CardHeader>
                <CardContent>
                    Card with accent border.
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Buttons</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="ghost">Ghost</Button>
                </CardContent>
            </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Table</h2>
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ticker</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">BTC</TableCell>
                        <TableCell>$42,000.00</TableCell>
                        <TableCell className="text-success">+2.5%</TableCell>
                        <TableCell className="text-right">1.2B</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className="font-medium">ETH</TableCell>
                        <TableCell>$2,200.00</TableCell>
                        <TableCell className="text-destructive">-1.2%</TableCell>
                        <TableCell className="text-right">800M</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Card>
      </section>
    </div>
  )
}
