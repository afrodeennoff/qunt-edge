"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, BrainCircuit, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type TerminalTab = "signals" | "strategies" | "insights";

type SignalCard = {
  id: string;
  pair: string;
  side: "Buy" | "Sell";
  delta: string;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  horizon: string;
};

const SYMBOLS = [
  { value: "CME_MINI:NQ1!", label: "NQ1!" },
  { value: "CME_MINI:ES1!", label: "ES1!" },
  { value: "NYMEX:CL1!", label: "CL1!" },
  { value: "COMEX:GC1!", label: "GC1!" },
  { value: "BINANCE:BTCUSDT", label: "BTCUSDT" },
] as const;
type SymbolValue = (typeof SYMBOLS)[number]["value"];

const TIMEFRAMES = [
  { value: "1", label: "1m" },
  { value: "5", label: "5m" },
  { value: "15", label: "15m" },
  { value: "60", label: "1h" },
  { value: "240", label: "4h" },
  { value: "1D", label: "1D" },
] as const;
type TimeframeValue = (typeof TIMEFRAMES)[number]["value"];

const SIGNALS: SignalCard[] = [
  {
    id: "btc-buy",
    pair: "BTC/USD",
    side: "Buy",
    delta: "+1.57%",
    entry: "$62,800",
    stopLoss: "$61,500",
    takeProfit: "$63,500",
    horizon: "+30m",
  },
  {
    id: "eth-long",
    pair: "ETH/USD",
    side: "Buy",
    delta: "+2.45%",
    entry: "$2,980",
    stopLoss: "$2,920",
    takeProfit: "$3,080",
    horizon: "+1h",
  },
  {
    id: "xrp-sell",
    pair: "XRP/USD",
    side: "Sell",
    delta: "-0.93%",
    entry: "$0.58",
    stopLoss: "$0.61",
    takeProfit: "$0.54",
    horizon: "+45m",
  },
];

const TAB_COPY: Record<TerminalTab, { title: string; items: string[] }> = {
  signals: {
    title: "Today’s AI Calls",
    items: [
      "Momentum acceleration detected with above-average volume.",
      "Order-flow imbalance favors continuation into next session.",
      "Volatility regime stable enough for trend-follow setups.",
    ],
  },
  strategies: {
    title: "AI Strategy Builder",
    items: [
      "Scalping profile with adaptive stop offsets based on ATR.",
      "Swing profile with multi-timeframe confirmation gating.",
      "Auto-sizing model tied to drawdown and confidence score.",
    ],
  },
  insights: {
    title: "AI Insights",
    items: [
      "Portfolio beta concentration is elevated in tech-sensitive symbols.",
      "Best session performance: London open + first US hour overlap.",
      "Recent edge degradation linked to late-session overtrading.",
    ],
  },
};

function TradingViewCanvas({ symbol, interval }: { symbol: string; interval: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Etc/UTC";
    } catch {
      return "Etc/UTC";
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = "";

    const widgetTarget = document.createElement("div");
    widgetTarget.className = "tradingview-widget-container__widget h-full w-full";
    container.appendChild(widgetTarget);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.type = "text/javascript";
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
      allow_symbol_change: true,
      save_image: false,
      details: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol, interval, timezone]);

  return <div ref={containerRef} className="tradingview-widget-container h-full w-full" />;
}

export function ChartTheFuturePanel() {
  const [symbol, setSymbol] = useState<SymbolValue>(SYMBOLS[0].value);
  const [interval, setInterval] = useState<TimeframeValue>(TIMEFRAMES[2].value);
  const [activeTab, setActiveTab] = useState<TerminalTab>("signals");
  const [selectedSignal, setSelectedSignal] = useState(SIGNALS[0]);

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/15 bg-[#060b1f] text-slate-100 shadow-[0_32px_120px_-58px_rgba(34,211,238,0.85)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_-8%,rgba(56,189,248,0.24),transparent_38%),radial-gradient(circle_at_85%_8%,rgba(34,211,238,0.2),transparent_34%),linear-gradient(180deg,#050a1e_0%,#060b1f_60%,#070d23_100%)]" />

      <div className="relative z-10 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-5">
          <h2 className="text-xl font-bold tracking-tight text-white">Dashboard</h2>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <span className="text-cyan-300">Markets</span>
            <span>Portfolio</span>
            <span>News</span>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/35 bg-cyan-400/10 px-2 py-0.5 text-cyan-200">
              <Sparkles className="size-3" /> AI
            </span>
            <span>Live Mode</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid gap-4 p-4 md:p-5 xl:grid-cols-[1.85fr_0.95fr]">
        <section className="space-y-4">
          <article className="overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#070f2b]/85">
            <header className="flex flex-wrap items-center gap-2 border-b border-white/10 p-3">
              <select
                value={symbol}
                onChange={(event) => setSymbol(event.target.value as SymbolValue)}
                className="h-8 rounded-md border border-white/15 bg-black/35 px-2 text-xs text-slate-100 outline-none"
              >
                {SYMBOLS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <div className="inline-flex rounded-md border border-white/10 bg-black/25 p-0.5">
                {TIMEFRAMES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setInterval(item.value)}
                    className={cn(
                      "rounded px-2 py-1 text-[11px] font-semibold transition-colors",
                      interval === item.value ? "bg-cyan-400/20 text-cyan-200" : "text-slate-400 hover:text-slate-200",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2 py-1 text-[11px] text-emerald-200">
                <TrendingUp className="size-3" /> Real-time feed
              </div>
            </header>

            <div className="h-[420px] w-full sm:h-[500px]">
              <TradingViewCanvas symbol={symbol} interval={interval} />
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0a1536]/80 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">Today&apos;s AI Calls</h3>
              <span className="text-xs text-slate-400">Live updates</span>
            </div>

            <div className="space-y-2">
              {SIGNALS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedSignal(item)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-colors",
                    selectedSignal.id === item.id
                      ? "border-cyan-300/45 bg-cyan-400/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-100">
                      {item.side} {item.pair}
                      <span className="ml-2 text-cyan-300">{item.delta}</span>
                    </p>
                    <span className="text-xs text-slate-400">{item.horizon}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Entry {item.entry} · SL {item.stopLoss} · TP {item.takeProfit}
                  </p>
                </button>
              ))}
            </div>
          </article>
        </section>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-white/10 bg-[#0b1538]/85 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-4xl font-light text-white">AI</h3>
              <Bot className="size-4 text-cyan-300" />
            </div>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-white">$62,835</p>
            <p className="text-sm text-emerald-300">+3.57% · Uptrend</p>

            <div className="mt-3 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-3">
              <p className="text-xs uppercase tracking-[0.15em] text-cyan-200">AI Recommendation</p>
              <p className="mt-1 text-base font-semibold text-white">Buy {selectedSignal.pair}</p>
              <p className="mt-1 text-xs text-slate-200">
                Consider entry near {selectedSignal.entry}; set stop-loss at {selectedSignal.stopLoss} and target {selectedSignal.takeProfit}.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0b1434]/85 p-4">
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/20 p-1">
              {(["signals", "strategies", "insights"] as TerminalTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-semibold capitalize transition-colors",
                    activeTab === tab ? "bg-cyan-400/20 text-cyan-200" : "text-slate-400 hover:text-slate-100",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <h4 className="mt-3 text-sm font-semibold text-slate-100">{TAB_COPY[activeTab].title}</h4>
            <ul className="mt-2 space-y-2">
              {TAB_COPY[activeTab].items.map((item) => (
                <li key={item} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-300">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0c1638]/85 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-100">Chat with AI</h4>
              <BrainCircuit className="size-4 text-cyan-300" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
                What&apos;s the market outlook for Bitcoin over the next hour?
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-slate-200">
                Model indicates short-term uptrend continuation with moderate volatility. Keep risk tight and avoid oversized entries.
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-400">
              Type your question...
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}
