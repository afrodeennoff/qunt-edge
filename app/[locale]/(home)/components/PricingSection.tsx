'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useCurrentLocale } from '@/locales/client'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildWhopCheckoutUrl } from '@/lib/whop-checkout'
import { useCurrency } from '@/hooks/use-currency'

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    subtitle: 'For traders building foundational review discipline',
    features: ['Manual journaling', 'Core trade analytics', 'Weekly process snapshot'],
    cta: 'Start Free',
    note: 'No card required',
    popular: false,
  },
  {
    name: 'Pro AI',
    monthlyPrice: 29,
    yearlyPrice: 24,
    subtitle: 'For serious traders optimizing execution quality',
    features: [
      'AI session debriefs',
      'Behavior drift detection',
      'Execution quality scoring',
      'Advanced dashboards',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    note: 'Best for active discretionary traders',
    popular: true,
  },
  {
    name: 'Desk',
    monthlyPrice: 99,
    yearlyPrice: 84,
    subtitle: 'For prop teams, mentors, and performance managers',
    features: ['Team analytics workspace', 'Role-based reporting', 'Coaching intervention feed', 'Shared playbooks'],
    cta: 'Talk To Sales',
    note: 'Volume pricing for larger desks',
    popular: false,
  },
]

export default function PricingSection() {
  const locale = useCurrentLocale()
  const { currency } = useCurrency()
  const [billingMode, setBillingMode] = useState<'monthly' | 'annual'>('annual')

  const periodLabel = useMemo(() => (billingMode === 'annual' ? '/month, billed yearly' : '/month'), [billingMode])

  return (
    <section id="pricing" className="relative border-y border-[hsl(var(--mk-border)/0.24)] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-[hsl(var(--brand-primary)/0.32)] bg-[hsl(var(--brand-primary)/0.08)] text-[10px] uppercase tracking-[0.2em] [font-family:var(--home-copy)]">
            Pricing
          </Badge>
          <h2 className="text-[clamp(2rem,4.8vw,3.35rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
            Choose your
            <span className="block text-[hsl(var(--brand-primary))]">performance operating system</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-[1.78] text-muted-foreground sm:text-[18px] [font-family:var(--home-copy)]">
            Start free. Upgrade when you want deeper diagnostics, tighter coaching loops, and desk-grade review workflows.
          </p>
          <div className="mx-auto mt-6 inline-flex rounded-xl border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.58)] p-1">
            <button
              type="button"
              onClick={() => setBillingMode('monthly')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.13em] transition-colors [font-family:var(--home-copy)]',
                billingMode === 'monthly' ? 'bg-[hsl(var(--mk-surface))] text-[hsl(var(--mk-text))]' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={billingMode === 'monthly'}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingMode('annual')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.13em] transition-colors [font-family:var(--home-copy)]',
                billingMode === 'annual' ? 'bg-[hsl(var(--mk-surface))] text-[hsl(var(--mk-text))]' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={billingMode === 'annual'}
            >
              Annual (Best Value)
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground [font-family:var(--home-copy)]">7-day free trial on Pro AI. Cancel anytime.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="flex">
              <Card
                className={cn(
                  "marketing-panel flex w-full flex-col rounded-3xl border-[hsl(var(--mk-border)/0.32)] transition-all duration-300 hover:border-[hsl(var(--brand-primary)/0.35)]",
                  plan.popular && "relative overflow-hidden border-[hsl(var(--brand-primary)/0.45)]"
                )}
              >
                {plan.popular && (
                  <div className="absolute right-4 top-4">
                    <Badge variant="default" className="bg-[hsl(var(--brand-primary))] text-[hsl(var(--brand-ink))]">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-[1.35rem] font-semibold tracking-[-0.015em] [font-family:var(--home-display)]">{plan.name}</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-semibold tracking-[-0.025em] [font-family:var(--home-display)]">
                    {plan.monthlyPrice === 0 ? '$0' : `$${billingMode === 'annual' ? plan.yearlyPrice : plan.monthlyPrice}`}
                    <span className="ml-1 text-sm font-medium text-muted-foreground [font-family:var(--home-copy)]">{periodLabel}</span>
                  </div>
                  <CardDescription className="mt-2 text-sm leading-relaxed [font-family:var(--home-copy)]">{plan.subtitle}</CardDescription>
                  {billingMode === 'annual' && plan.monthlyPrice > 0 && (
                    <p className="mt-2 text-xs text-[hsl(var(--brand-primary))] [font-family:var(--home-copy)]">
                      Save ${plan.monthlyPrice - plan.yearlyPrice}/month with annual billing
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground [font-family:var(--home-copy)]">
                        <Check className="h-5 w-5 shrink-0 text-[hsl(var(--brand-primary))]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button
                    asChild
                    variant={plan.popular ? 'default' : 'outline'}
                    className={cn(
                      "h-12 w-full rounded-2xl text-[10px] font-semibold uppercase tracking-[0.18em] [font-family:var(--home-copy)]",
                      !plan.popular && "border-white/12 bg-black/35 hover:bg-black/55",
                      plan.popular && "shadow-md shadow-primary/20",
                    )}
                  >
                    <Link
                      href={
                        plan.name === 'Pro AI'
                          ? buildWhopCheckoutUrl({
                              lookupKey: `plus_monthly_${currency.toLowerCase()}`,
                              locale,
                            })
                          : plan.name === 'Desk'
                            ? `/${locale}/support`
                            : `/${locale}/authentication?next=dashboard`
                      }
                    >
                      {plan.cta}
                    </Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground [font-family:var(--home-copy)]">{plan.note}</p>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
          Transparent pricing. No hidden data limits. Upgrade only when your review process needs more depth.
        </p>
      </div>
    </section>
  )
}
