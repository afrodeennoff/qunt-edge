'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useCurrentLocale } from '@/locales/client'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <section id="pricing" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 bg-background">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <Badge variant="outline" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Transparent plans for <br />
            <span className="text-primary">individual and team growth</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Start free, upgrade when you are ready for AI coaching and institutional-grade review workflows.
          </p>
          <p className="mt-4 text-xs font-mono text-muted-foreground">Billed monthly. Cancel anytime.</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex"
            >
              <Card
                className={cn(
                  "flex flex-col w-full transition-all duration-300 hover:shadow-xl hover:border-primary/50",
                  plan.popular && "border-primary shadow-lg shadow-primary/10 relative overflow-hidden"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 p-4">
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4 flex items-baseline text-5xl font-bold tracking-tight">
                    {plan.price}
                    <span className="ml-1 text-sm font-medium text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-sm">{plan.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Check className="h-5 w-5 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button
                    asChild
                    variant={plan.popular ? 'default' : 'outline'}
                    className={cn("w-full h-12 rounded-full", plan.popular && "shadow-md shadow-primary/25")}
                  >
                    <Link href={`/${locale}/authentication?next=dashboard`}>{plan.cta}</Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground font-mono">{plan.note}</p>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
