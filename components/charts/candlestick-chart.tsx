"use client"

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts"
import { CHART_COLORS } from "./chart-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CandlestickData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface CandlestickChartProps {
  data: CandlestickData[]
  title?: string
  height?: number
}

const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props
  const { open, close, high, low } = payload

  const isUp = close >= open
  const color = isUp ? CHART_COLORS.up : CHART_COLORS.down
  const bodyHeight = Math.max(Math.abs(open - close), 1) // Min height 1px

  // Scale y values properly. Recharts passes y as the top of the bar (min(open, close))
  // But for the wick, we need to calculate y positions based on the axis scale.
  // This is tricky with custom shapes in Bar.
  // A simpler approach for Recharts is to use ErrorBar for wicks or just draw lines.
  // But accessing the scale is hard inside the shape.

  // Alternative: Use a standard Bar chart where the bar is the body, and use ErrorBar for the wicks.
  // Or simply draw SVG elements if we have the coordinates.
  // Recharts passes calculated coordinates for the bar (x, y, width, height).
  // y is the top coordinate, height is the height.

  // Let's assume the passed y and height correspond to the body (open/close range).
  // We need the y-coordinates for high and low.
  // Unfortunately, standard Bar shape props don't give us the y-coord for high/low directly relative to the axis.

  // So, a common workaround in Recharts for Candlestick is to use a ComposedChart with ErrorBars,
  // OR use a library like lightweight-charts (TradingView).
  // Given the constraints, I will try to implement a simple version or use a different approach.

  // Actually, let's use a simplified approach:
  // We can't easily draw the wicks inside the custom shape without the scale function.
  // However, we can use a ComposedChart with a Bar for the body (bottom: min(O,C), top: max(O,C))
  // and another Bar or Line for the wicks? No.

  // Let's look at the "ErrorBar" approach.
  // Or, better, just use "lightweight-charts" if available? It's not in package.json.
  // Recharts is the only one.

  // Okay, let's try to calculate pixels.
  // This is complex. For V2 MVP, maybe just a simple Line chart for close price + Volume bars is safer if Candlestick is too hard to get right in Recharts quickly.
  // BUT the prompt explicitly asked for "Candlestick chart".

  // Let's try the "Custom Shape" again.
  // We can pass the `yAxis` scale function if we wrap the component? No.

  // Wait, Recharts `Customized` component has access to scales.
  // But that renders on top of everything.

  // Let's try a different strategy:
  // Data processing:
  // bodyBottom = min(open, close)
  // bodyHeight = abs(open - close)
  // wickBottom = low
  // wickHeight = high - low
  // This doesn't work with standard Bar because Bar expects a single value.

  // Correct Recharts approach for Candlestick:
  // Use a Bar chart with `dataKey` as an array `[min, max]`.
  // The Bar will render from min to max.
  // So we pass `[Math.min(open, close), Math.max(open, close)]` as the value for the body.
  // And we can use `ErrorBar` for the wicks? No, ErrorBar is for error margins.

  // Actually, we can use a composite shape.
  // Let's draw the body using the Bar (range).
  // And draw the wicks using lines?

  return (
    <g>
      {/* Wick */}
      {/* We need the Y coordinate of High and Low.
          The shape props only give us the bounding box of the Bar (the Body).
          We can't determine High/Low Y pixels without the scale.
      */}
      <rect x={x} y={y} width={width} height={height} fill={color} />
    </g>
  )
}

// Better Approach:
// Use a Shape that receives the scale.
// Actually, `recharts` allows passing a custom shape component.
// If we use a specific data structure, maybe we can hack it.

// Let's pivot to a standard Line Chart for now to ensure stability,
// AND add a "Note: Candlestick implementation requires complex custom SVG logic in Recharts or a dedicated library"
// OR I can try to implement a basic version where I only show the Close line if I can't do Candles perfectly.

// WAIT! I can use `recharts` `Bar` for the body and `ErrorBar`?
// No.
// Let's look at a known solution:
// Use `Bar` for the body. The value is `[min(open, close), max(open, close)]`.
// Use another `Bar` (width 1px) for the wick? `[low, high]`.
// Yes! Two bars per data point. One wide (Body), one thin (Wick).
// They must share the same XAxis ID.

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const isUp = data.close >= data.open
    return (
      <div className="rounded-lg border border-border bg-card p-2 shadow-sm text-xs">
        <p className="mb-1 font-medium text-foreground">{label}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span className="text-muted-foreground">O:</span>
          <span className={isUp ? "text-success" : "text-destructive"}>{data.open}</span>
          <span className="text-muted-foreground">H:</span>
          <span className={isUp ? "text-success" : "text-destructive"}>{data.high}</span>
          <span className="text-muted-foreground">L:</span>
          <span className={isUp ? "text-success" : "text-destructive"}>{data.low}</span>
          <span className="text-muted-foreground">C:</span>
          <span className={isUp ? "text-success" : "text-destructive"}>{data.close}</span>
        </div>
      </div>
    )
  }
  return null
}

export function CandlestickChart({ data, title, height = 400 }: CandlestickChartProps) {
  // Transform data for the "Two Bar" hack
  const transformedData = data.map(d => {
      const isUp = d.close >= d.open;
      return {
        ...d,
        bodyMin: Math.min(d.open, d.close),
        bodyMax: Math.max(d.open, d.close),
        wickMin: d.low,
        wickMax: d.high,
        color: isUp ? CHART_COLORS.up : CHART_COLORS.down,
        // Make sure the body has at least some height
        bodyHeight: Math.max(Math.abs(d.open - d.close), 0.0001)
      }
  })

  return (
    <Card className="flex flex-col border-none bg-transparent shadow-none" style={{ height }}>
      {title && (
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 p-0 pb-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
                dataKey="date"
                stroke={CHART_COLORS.text}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
            />
            <YAxis
                domain={['auto', 'auto']}
                stroke={CHART_COLORS.text}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.toFixed(2)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: CHART_COLORS.grid, strokeWidth: 1, strokeDasharray: '4 4' }} />

            {/* Wick (Thin Bar) */}
            <Bar
                dataKey={(d) => [d.wickMin, d.wickMax]}
                barSize={1}
                shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    return <rect x={x + width/2 - 0.5} y={y} width={1} height={height} fill={payload.color} />
                }}
            />

            {/* Body (Thick Bar) */}
            <Bar
                dataKey={(d) => [d.bodyMin, d.bodyMax]}
                barSize={8}
                shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    return <rect x={x} y={y} width={width} height={Math.max(height, 1)} fill={payload.color} rx={1} />
                }}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
