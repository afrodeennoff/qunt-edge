import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, ShieldCheck, FileDown, Workflow } from 'lucide-react'

const proofItems = [
  {
    title: 'Account-Scoped By Default',
    description: 'Imports, layouts, and uploads are enforced under your authenticated identity.',
    icon: Lock,
  },
  {
    title: 'Fail-Closed Guardrails',
    description: 'Budgets, routing, and critical checks are designed to error loudly instead of silently drifting.',
    icon: ShieldCheck,
  },
  {
    title: 'Coach-Ready Exports',
    description: 'Turn weekly review into a clean brief you can share with a mentor or desk lead.',
    icon: FileDown,
  },
  {
    title: 'Fits Your Stack',
    description: 'Connect, import, or upload CSVs without rebuilding your execution workflow.',
    icon: Workflow,
  },
]

export default function ProofStrip() {
  return (
    <section className="relative px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-center sm:text-left">
            <Badge
              variant="secondary"
              className="border-border/70 bg-card/70 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm [font-family:var(--home-copy)]"
            >
              Trust and Proof
            </Badge>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground [font-family:var(--home-copy)]">
              Social proof should be earned. Until then, we lead with enforceable constraints and an observable review loop.
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground [font-family:var(--home-copy)]">Start in minutes</p>
            <p className="mt-1 text-sm text-foreground/80 [font-family:var(--home-copy)]">No credit card required on Starter.</p>
          </div>
        </div>

        <Card className="overflow-hidden border-border/70 bg-card/75 shadow-xl backdrop-blur-md">
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {proofItems.map((item) => {
                const Icon = item.icon
                return (
                  <article
                    key={item.title}
                    className="rounded-xl border border-border/70 bg-background/35 p-4 transition-colors hover:bg-background/55"
                  >
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background/45 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground [font-family:var(--home-copy)]">
                      {item.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
