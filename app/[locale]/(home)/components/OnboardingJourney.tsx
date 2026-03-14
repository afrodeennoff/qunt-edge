import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plug, FileDown, ScanSearch, TrendingUp } from 'lucide-react'

const journey = [
  {
    step: 'Step 1',
    title: 'Connect Or Import',
    description: 'Sync broker data or upload CSV to start from real fills instead of manual backfill.',
    icon: Plug,
  },
  {
    step: 'Step 2',
    title: 'Run First Audit',
    description: 'Generate your first execution-quality diagnosis with behavior drift and process score.',
    icon: ScanSearch,
  },
  {
    step: 'Step 3',
    title: 'Ship Weekly Improvement',
    description: 'Turn diagnosis into a weekly intervention plan and measure adherence over time.',
    icon: TrendingUp,
  },
  {
    step: 'Step 4',
    title: 'Review In One Brief',
    description: 'Export a clean performance brief for mentors, teams, or personal review.',
    icon: FileDown,
  },
]

export default function OnboardingJourney() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-14">
          <Badge variant="outline" className="border-[hsl(var(--brand-primary)/0.34)] bg-[hsl(var(--brand-primary)/0.08)] text-[10px] uppercase tracking-[0.2em] [font-family:var(--home-copy)]">
            Onboarding System
          </Badge>
          <h2 className="mt-3 text-[clamp(2rem,4.8vw,3.35rem)] font-semibold leading-[0.92] tracking-[-0.02em] [font-family:var(--home-display)]">
            First value in one session,
            <span className="block text-[hsl(var(--brand-primary))]">then compounding weekly gains</span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {journey.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} variant="glass" className="h-full rounded-2xl border-[hsl(var(--mk-border)/0.3)]">
                <CardHeader>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{item.step}</p>
                  <div className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.78)] text-[hsl(var(--brand-primary))]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg tracking-[-0.01em] [font-family:var(--home-display)]">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
