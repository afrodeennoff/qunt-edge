"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard";
import { useCurrentLocale } from "@/locales/client";

interface TradingViewChartProps {
  size?: WidgetSize;
}

const SYMBOLS = [
  { value: "CME_MINI:NQ1!", label: "NQ Futures (NQ1!)" },
  { value: "CME_MINI:ES1!", label: "S&P 500 Futures (ES1!)" },
  { value: "NYMEX:CL1!", label: "Crude Oil Futures (CL1!)" },
  { value: "COMEX:GC1!", label: "Gold Futures (GC1!)" },
  { value: "BINANCE:BTCUSDT", label: "Bitcoin (BTCUSDT)" },
] as const;

const INTERVALS = [
  { value: "1", label: "1m" },
  { value: "5", label: "5m" },
  { value: "15", label: "15m" },
  { value: "60", label: "1h" },
  { value: "240", label: "4h" },
  { value: "1D", label: "1D" },
] as const;

export default function TradingViewChart({ size = "large" }: TradingViewChartProps) {
  const locale = useCurrentLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [symbol, setSymbol] = useState<string>(SYMBOLS[0].value);
  const [interval, setInterval] = useState<string>(INTERVALS[2].value);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Etc/UTC";
    } catch {
      return "Etc/UTC";
    }
  }, []);

  const tradingViewLocale = useMemo(() => {
    const supported = new Set(["en", "fr", "de", "es", "it", "pt", "vi", "hi", "ja", "zh"]);
    return supported.has(locale) ? locale : "en";
  }, [locale]);

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = "";

    const widgetHost = document.createElement("div");
    widgetHost.className = "tradingview-widget-container__widget h-full w-full";
    container.appendChild(widgetHost);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.text = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone,
      theme,
      style: "1",
      locale: tradingViewLocale,
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      details: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [interval, symbol, theme, timezone, tradingViewLocale]);

  const compactControls = size === "small-long";

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="gap-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium">TradingView Live Chart</CardTitle>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Symbol" />
            </SelectTrigger>
            <SelectContent>
              {SYMBOLS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {compactControls ? item.value : item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              {INTERVALS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-0">
        <div className="tradingview-widget-container h-full w-full" ref={containerRef} />
      </CardContent>
    </Card>
  );
}
