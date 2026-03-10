import { BarChart3, Brain, CalendarCheck2, Database, LayoutDashboard, ShieldCheck } from 'lucide-react'

const items = [
  {
    title: 'One Truth Timeline',
    desc: 'Unify fills, notes, and context into one performance record across brokers and imports.',
    icon: BarChart3,
  },
  {
    title: 'Execution Grade Engine',
    desc: 'Score every trade against your ruleset so discipline becomes measurable, not assumed.',
    icon: Database,
  },
  {
    title: 'AI Session Debriefs',
    desc: 'Get blunt post-session diagnostics with root causes and the next priorities to fix.',
    icon: Brain,
  },
  {
    title: 'Drift Alerts',
    desc: 'Detect emotional, sizing, and frequency drift before it compounds into drawdown.',
    icon: LayoutDashboard,
  },
  {
    title: 'Correction Loop',
    desc: 'Convert weak patterns into concrete interventions and track adherence week over week.',
    icon: CalendarCheck2,
  },
  {
    title: 'Desk-Level Oversight',
    desc: 'Give managers and mentors a clean, auditable view of process quality by trader.',
    icon: ShieldCheck,
  },
]

export default function Features() {
  return (
    <section id="features" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-14">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">Platform Weapons</p>
          <h2 className="mt-2 text-[clamp(1.95rem,4.9vw,3.4rem)] font-semibold leading-[0.94] tracking-[-0.02em] [font-family:var(--home-display)]">
            Built for traders who
            <span className="block text-[hsl(var(--brand-primary))]">want standards, not excuses</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const Icon = item.icon

            return (
              <article
                key={item.title}
                className="marketing-panel rounded-2xl p-6"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--mk-border)/0.28)] bg-[hsl(var(--mk-surface-muted)/0.8)] text-[hsl(var(--brand-primary))]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{item.desc}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
