"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { SegmentedControl } from "@/components/ui/segmented-control"

type SymbolOption = { label: string; value: string }

const SYMBOLS: SymbolOption[] = [
  { label: "SUI", value: "BINANCE:SUIUSDT" },
  { label: "BTC", value: "BINANCE:BTCUSDT" },
  { label: "ETH", value: "BINANCE:ETHUSDT" },
  { label: "SOL", value: "BINANCE:SOLUSDT" },
]

const TIMEFRAMES = [
  { label: "1D", value: "60" },
  { label: "7D", value: "240" },
  { label: "1M", value: "1D" },
  { label: "1Y", value: "1W" },
  { label: "All", value: "1M" },
]

function TradingViewCanvas({ symbol, interval }: { symbol: string; interval: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Etc/UTC"
    } catch {
      return "Etc/UTC"
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ""

    const widgetTarget = document.createElement("div")
    widgetTarget.className = "tradingview-widget-container__widget h-full w-full"
    container.appendChild(widgetTarget)

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.async = true
    script.type = "text/javascript"
    script.text = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone,
      theme: "dark",
      style: "1",
      locale: "en",
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      details: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    })

    container.appendChild(script)

    return () => {
      container.innerHTML = ""
    }
  }, [symbol, interval, timezone])

  return <div ref={containerRef} className="tradingview-widget-container h-full w-full" />
}

export function ChartPanel() {
  const [symbol, setSymbol] = useState(SYMBOLS[0].value)
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[2].value)

  return (
    <Card className="h-full border border-border/80 bg-[hsl(var(--qe-panel))]/95 p-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-3 py-2.5">
        <div className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background/40 px-2.5 py-1.5">
          <span className="text-ui-body font-semibold text-foreground">Token</span>
          <select
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
            className="bg-transparent text-ui-body text-muted-foreground outline-none"
          >
            {SYMBOLS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          <SegmentedControl options={TIMEFRAMES} value={timeframe} onChange={setTimeframe} />
        </div>

        <div className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--chart-win))/0.35] bg-[hsl(var(--chart-win))/0.12] px-2.5 py-1 text-ui-micro text-[hsl(var(--chart-win))]">
          <TrendingUp className="size-3.5" /> Live
        </div>
      </div>

      <div className="h-[440px] w-full md:h-[560px]">
        <TradingViewCanvas symbol={symbol} interval={timeframe} />
      </div>
    </Card>
  )
}
