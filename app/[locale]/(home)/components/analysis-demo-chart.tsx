'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

type ChartPoint = {
  time: string
  price: number
  ema: number
  volume: number
}

interface AnalysisDemoChartProps {
  data: ChartPoint[]
}

export default function AnalysisDemoChart({ data }: AnalysisDemoChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--brand-primary))" stopOpacity={0.28} />
            <stop offset="95%" stopColor="hsl(var(--brand-primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="hsl(var(--mk-border)/0.22)" strokeDasharray="3 3" />
        <XAxis dataKey="time" axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--mk-text-muted))" />
        <YAxis yAxisId="price" axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--mk-text-muted))" />
        <YAxis yAxisId="volume" hide />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--mk-border)/0.45)' }}
          contentStyle={{
            background: 'hsl(var(--mk-surface))',
            border: '1px solid hsl(var(--mk-border)/0.45)',
            borderRadius: '10px',
            color: 'hsl(var(--mk-text))',
          }}
        />
        <Bar yAxisId="volume" dataKey="volume" fill="hsl(var(--brand-secondary))" opacity={0.16} barSize={8} />
        <Area yAxisId="price" dataKey="price" stroke="none" fill="url(#chartArea)" />
        <Line yAxisId="price" dataKey="price" dot={false} stroke="hsl(var(--brand-primary))" strokeWidth={2} />
        <Line yAxisId="price" dataKey="ema" dot={false} stroke="hsl(var(--mk-text-muted))" strokeDasharray="6 4" strokeWidth={1.5} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
