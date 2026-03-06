import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function Hero({ locale }: { locale: string }) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-40 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:44px_44px] sm:bg-[size:48px_48px]" />
        <div className="absolute -left-28 top-10 h-56 w-56 rounded-full bg-[hsl(var(--foreground)/0.12)] blur-[120px] sm:h-72 sm:w-72" />
        <div className="absolute -right-24 top-16 h-48 w-48 rounded-full bg-[hsl(var(--foreground)/0.09)] blur-[110px] sm:h-64 sm:w-64" />
        <div className="absolute inset-x-8 top-6 h-px bg-[hsl(var(--foreground)/0.14)] sm:inset-x-12" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 flex justify-center">
          <Badge variant="secondary" className="border-border/70 bg-card/70 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm [font-family:var(--home-copy)]">
            <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
            Live decision telemetry for discretionary traders
          </Badge>
        </div>

        <h1 className="mx-auto max-w-5xl text-center text-[clamp(2.7rem,10.2vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.032em] [font-family:var(--home-display)]">
          Build repeatable edge.
          <span className="mt-2 block bg-[linear-gradient(92deg,hsl(var(--foreground))_0%,hsl(var(--foreground)/0.72)_100%)] bg-clip-text text-transparent">
            Eliminate emotional drift.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-center text-[14px] leading-[1.72] text-muted-foreground sm:text-[18px] sm:leading-[1.8] [font-family:var(--home-copy)]">
          Qunt Edge isolates execution quality, behavioral drift, and risk discipline in one review surface.
          Every session gets a precise diagnosis, so your next session starts with intent, not guesswork.
        </p>

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Button asChild size="lg" className="h-12 w-full max-w-[320px] rounded-2xl text-[10px] font-semibold uppercase tracking-[0.18em] shadow-lg shadow-primary/20 sm:min-w-[220px] sm:w-auto [font-family:var(--home-copy)]">
            <Link href={`/${locale}/authentication?next=dashboard`}>
              Start My Performance Audit
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 w-full max-w-[320px] rounded-2xl border-border/70 bg-card/60 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm hover:bg-card/80 sm:min-w-[220px] sm:w-auto [font-family:var(--home-copy)]">
            <Link href={`/${locale}/#pricing`}>
              Compare Plans
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="mt-16">
          <Card className="overflow-hidden border-border/70 bg-card/75 shadow-xl backdrop-blur-md">
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-background/35 p-4 text-center transition-colors hover:bg-background/55">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">Session Grade Confidence</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">94%</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/35 p-4 text-center transition-colors hover:bg-background/55">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">Rule Adherence Uplift</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-fg-primary [font-family:var(--home-display)]">+37%</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/35 p-4 text-center transition-colors hover:bg-background/55">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">Impulse Trades Reduced</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-primary [font-family:var(--home-display)]">-42%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground [font-family:var(--home-copy)]">
          <span>Tradovate</span>
          <span>Rithmic</span>
          <span>IBKR</span>
          <span>CQG</span>
          <span className="font-medium tracking-[0.15em] text-[#ff4d1a]/70" aria-label="NinjaTrader">
            NINJA<span className="mx-1 align-baseline text-[#ff4d1a]/80">|</span>TRADER
          </span>
          <span>CSV Import</span>
        </div>

        <p className="mt-6 text-center text-xs tracking-[0.08em] text-muted-foreground/60 [font-family:var(--home-copy)]">
          No credit card required. Be review-ready before your next open.
        </p>
      </div>
    </section>
  )
}
