import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function Hero({ locale }: { locale: string }) {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8 lg:pb-28 lg:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_-8%,hsl(var(--foreground)/0.16)_0%,transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.04)_1px,transparent_1px)] bg-[size:44px_44px] sm:bg-[size:52px_52px]" />
        <div className="absolute inset-x-10 top-8 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--foreground)/0.25),transparent)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 flex justify-center">
          <Badge variant="secondary" className="border-border/70 bg-card/70 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm [font-family:var(--home-copy)]">
            <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
            Live decision telemetry for discretionary traders
          </Badge>
        </div>

        <h1 className="mx-auto max-w-5xl text-center text-[clamp(3rem,10vw,7.1rem)] font-semibold leading-[0.88] tracking-[-0.04em] [font-family:var(--home-display)]">
          Build repeatable edge.
          <span className="mt-2 block bg-[linear-gradient(95deg,hsl(var(--foreground))_0%,hsl(var(--foreground)/0.62)_100%)] bg-clip-text text-transparent">
            Eliminate emotional drift.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-center text-[14px] leading-[1.72] text-muted-foreground sm:text-[18px] sm:leading-[1.8] [font-family:var(--home-copy)]">
          Qunt Edge isolates execution quality, behavioral drift, and risk discipline in one review surface.
          Every session gets a precise diagnosis, so your next session starts with intent, not guesswork.
        </p>

        <div className="mt-12 flex w-full flex-col items-center justify-center gap-3 sm:mt-14 sm:w-auto sm:flex-row sm:gap-5">
          <Button asChild size="lg" className="h-12 w-full max-w-[320px] rounded-2xl text-[11px] font-semibold uppercase tracking-[0.14em] shadow-lg shadow-primary/20 sm:min-w-[220px] sm:w-auto [font-family:var(--home-copy)]">
            <Link href={`/${locale}/authentication?next=dashboard`}>
              Start My Performance Audit
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 w-full max-w-[320px] rounded-2xl border-border/70 bg-card/60 text-[11px] font-medium uppercase tracking-[0.14em] backdrop-blur-sm hover:bg-card/80 sm:min-w-[220px] sm:w-auto [font-family:var(--home-copy)]">
            <Link href={`/${locale}/#pricing`}>
              See Pricing
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
          <span className="marketing-badge rounded-full px-3 py-1">No credit card required</span>
          <span className="marketing-badge rounded-full px-3 py-1">First audit in minutes</span>
          <span className="marketing-badge rounded-full px-3 py-1">Built for discretionary futures traders</span>
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
          <span className="font-medium tracking-[0.15em] text-primary/80" aria-label="NinjaTrader">
            NINJA<span className="mx-1 align-baseline text-primary">|</span>TRADER
          </span>
          <span>CSV Import</span>
        </div>

        <p className="mt-6 text-center text-xs tracking-[0.08em] text-muted-foreground/70 [font-family:var(--home-copy)]">
          Join free. Import your first session. Get a ranked diagnostic before your next open.
        </p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,transparent,hsl(var(--background)))]" />
    </section>
  )
}
