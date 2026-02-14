'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentLocale } from '@/locales/client'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    subtitle: 'For traders starting process discipline',
    features: ['Manual journaling', 'Basic trade analytics', 'Weekly summary snapshot'],
    cta: 'Start Free',
    note: 'No card required',
    popular: false,
  },
  {
    name: 'Pro AI',
    price: '$29',
    period: '/month',
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
    price: '$99',
    period: '/month',
    subtitle: 'For prop teams, mentors, and performance managers',
    features: ['Team analytics workspace', 'Role-based reporting', 'Coaching intervention feed', 'Shared playbooks'],
    cta: 'Talk To Sales',
    note: 'Volume pricing for larger desks',
    popular: false,
  },
]

export default function PricingSection() {
  const locale = useCurrentLocale()

  return (
    <section id="pricing" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center sm:mb-12"
        >
          <Badge variant="outline" className="px-3 py-1 text-[10px] uppercase tracking-[0.16em]">
            Pricing
          </Badge>
          <h2 className="mt-3 text-[clamp(1.9rem,4.6vw,3.15rem)] font-semibold leading-[0.95] tracking-[-0.03em] [font-family:var(--home-display)]">
            Transparent plans for
            <span className="block text-[hsl(var(--brand-primary))]">individual and team growth</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.7] text-[hsl(var(--mk-text-muted))] sm:text-base [font-family:var(--home-copy)]">
            Start free, upgrade when you are ready for AI coaching and institutional-grade review workflows.
          </p>
          <p className="mx-auto mt-2 text-xs text-[hsl(var(--mk-text-muted))] [font-family:var(--home-mono)]">Billed monthly. Cancel anytime.</p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
            >
                <Card
                  variant="glass"
                  className={`h-full rounded-2xl border-[hsl(var(--mk-border)/0.35)] ${plan.popular ? 'ring-2 ring-[hsl(var(--brand-primary)/0.45)] shadow-[0_28px_60px_-36px_hsl(var(--brand-primary)/0.55)]' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-xl tracking-[-0.01em] [font-family:var(--home-display)]">{plan.name}</CardTitle>
                    {plan.popular ? (
                      <Badge className="bg-[hsl(var(--brand-primary))] text-[hsl(var(--brand-ink))]">Most Popular</Badge>
                    ) : null}
                  </div>
                  <p className="mt-3 text-[2rem] font-semibold tracking-[-0.02em] [font-family:var(--home-display)]">
                    {plan.price}
                    <span className="ml-1 text-sm font-medium text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{plan.period}</span>
                  </p>
                  <p className="text-sm text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{plan.subtitle}</p>
                  <p className="mt-1 text-xs text-[hsl(var(--mk-text-muted))] [font-family:var(--home-mono)]">{plan.note}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-primary))]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className={`h-11 w-full rounded-full ${plan.popular ? 'bg-[hsl(var(--brand-primary))] text-[hsl(var(--brand-ink))]' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    <Link href={`/${locale}/authentication?next=dashboard`}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
