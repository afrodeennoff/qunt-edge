"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TopNav } from "./top-nav";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
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
    if (!container) return;

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

function ChartPanel() {
  const [symbol, setSymbol] = useState<SymbolValue>(SYMBOLS[0].value);
  const [interval, setInterval] = useState<TimeframeValue>(TIMEFRAMES[2].value);

  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <header className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <select
          value={symbol}
          onChange={(event) => setSymbol(event.target.value as SymbolValue)}
          className="h-8 rounded-md border border-input bg-background px-2 text-[10px] font-bold uppercase tracking-widest text-foreground outline-none hover:bg-muted transition-colors"
        >
          {SYMBOLS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <SegmentedControl
          options={TIMEFRAMES.map((item) => ({ label: item.label, value: item.value }))}
          value={interval}
          onChange={(next) => setInterval(next as TimeframeValue)}
        />
      </header>

      <div className="h-[420px] w-full sm:h-[500px]">
        <TradingViewCanvas symbol={symbol} interval={interval} />
      </div>
    </section>
  );
}

function AssistantPanel() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      role: "assistant",
      text: "Ask me for a quick read on trend, volatility, or key levels for the selected chart.",
    },
  ]);

  const onSend = () => {
    const value = draft.trim();
    if (!value) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: value },
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: "Momentum is mixed short-term. Wait for confirmation above resistance before adding risk.",
      },
    ]);
    setDraft("");
  };

  return (
    <aside className="flex min-h-[500px] flex-col rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">AI Assistant</h3>
        <Bot className="size-4 text-primary" />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs leading-relaxed",
              message.role === "user"
                ? "border-primary/20 bg-primary/10 text-foreground"
                : "border-border bg-muted/40 text-muted-foreground",
            )}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-2 py-1.5 focus-within:border-primary/50 transition-colors">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSend();
            }}
            placeholder="Ask about this chart..."
            className="h-8 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/50"
          />
          <button
            type="button"
            onClick={onSend}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function ChartTheFuturePanel() {
  return (
    <div className="text-foreground">
      <TopNav title="Chart the Future" />

      <div className="grid gap-3 xl:grid-cols-[1.9fr_1fr]">
        <ChartPanel />
        <AssistantPanel />
      </div>
    </div>
  );
}
