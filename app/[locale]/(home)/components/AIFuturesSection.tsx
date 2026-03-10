"use client"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Bot, Radar, ShieldAlert, Sparkles } from 'lucide-react'

const intelligenceFeatures = [
  {
    title: 'Behavior Drift Radar',
    description: 'Flags subtle shifts in risk behavior and setup quality before they become drawdowns.',
    icon: Radar,
  },
  {
    title: 'AI Session Debrief',
    description: 'Creates concise recaps of what worked, what broke, and what to adjust next session.',
    icon: Bot,
  },
  {
    title: 'Execution Quality Score',
    description: 'Scores trades against your ruleset so process wins are visible, even on flat PnL days.',
    icon: Brain,
  },
]

const automationFeatures = [
  {
    title: 'Playbook Auto-Builder',
    description: 'Converts your best sessions into reusable setup templates and checklist-ready plans.',
    icon: Sparkles,
  },
  {
    title: 'Risk Intervention Alerts',
    description: 'Escalates coaching prompts when sizing, frequency, or emotional variance crosses limits.',
    icon: ShieldAlert,
  },
  {
    title: 'Weekly Performance Briefs',
    description: 'Auto-compiles concise weekly reports for self-review, mentors, or desk standups.',
    icon: Bot,
  },
]

function FeatureGrid({ items }: { items: typeof intelligenceFeatures }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.title}>
            <Card variant="glass" className="h-full rounded-2xl border-[hsl(var(--mk-border)/0.3)]">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.75)] text-[hsl(var(--brand-primary))]">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg tracking-[-0.01em] [font-family:var(--home-display)]">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )
      })}
    </div>
  )
}

export default function AIFuturesSection() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:mb-12">
          <Badge variant="outline" className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] [font-family:var(--home-copy)]">
            Must-Have AI Features
          </Badge>
          <h2 className="mt-3 text-[clamp(2rem,4.8vw,3.35rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
            AI that improves
            <span className="block text-[hsl(var(--brand-primary))]">decision quality, not just reporting</span>
          </h2>
        </div>

        <Tabs defaultValue="intelligence" className="w-full">
          <TabsList className="h-auto w-full justify-start rounded-xl border border-[hsl(var(--mk-border)/0.25)] bg-[hsl(var(--mk-surface-muted)/0.55)] p-1">
            <TabsTrigger value="intelligence" className="rounded-lg px-4 py-2 text-xs uppercase tracking-[0.12em] [font-family:var(--home-copy)]">
              Intelligence
            </TabsTrigger>
            <TabsTrigger value="automation" className="rounded-lg px-4 py-2 text-xs uppercase tracking-[0.12em] [font-family:var(--home-copy)]">
              Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intelligence" className="mt-5">
            <FeatureGrid items={intelligenceFeatures} />
          </TabsContent>
          <TabsContent value="automation" className="mt-5">
            <FeatureGrid items={automationFeatures} />
          </TabsContent>
        </Tabs>

        <Card variant="glass" className="mt-6 rounded-2xl border-[hsl(var(--mk-border)/0.3)]">
          <CardContent className="flex flex-col gap-2 p-5 text-sm text-[hsl(var(--mk-text-muted))] sm:flex-row sm:items-center sm:justify-between [font-family:var(--home-copy)]">
            <p>
              AI decisions stay auditable with a transparent reason trail, so every recommendation can be reviewed.
            </p>
            <Badge variant="outline" className="w-fit border-[hsl(var(--brand-primary)/0.35)] bg-[hsl(var(--brand-primary)/0.08)]">
              Explainable AI
            </Badge>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
