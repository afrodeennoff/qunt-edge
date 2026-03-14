import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Lock, Server, LifeBuoy, MessageSquareQuote } from 'lucide-react'

const trustPillars = [
  {
    title: 'Security By Design',
    body: 'Protected account boundaries and scoped data access across trade imports, layouts, and analytics.',
    icon: Lock,
  },
  {
    title: 'Reliable Operations',
    body: 'Fail-closed AI budget controls, explicit error contracts, and hardened route behavior.',
    icon: Server,
  },
  {
    title: 'Support You Can Reach',
    body: 'Product support, in-app guidance, and direct escalation paths for active traders and teams.',
    icon: LifeBuoy,
  },
]

const testimonials = [
  {
    quote: 'The review cadence finally made my discipline measurable instead of subjective.',
    role: 'Futures Trader',
  },
  {
    quote: 'Our team moved from PnL storytelling to process accountability in one dashboard.',
    role: 'Desk Manager',
  },
]

export default function TrustAndProof() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-14">
          <Badge variant="outline" className="border-[hsl(var(--brand-primary)/0.34)] bg-[hsl(var(--brand-primary)/0.08)] text-[10px] uppercase tracking-[0.2em] [font-family:var(--home-copy)]">
            Trust Architecture
          </Badge>
          <h2 className="mt-3 text-[clamp(2rem,4.8vw,3.4rem)] font-semibold leading-[0.92] tracking-[-0.02em] [font-family:var(--home-display)]">
            Built like a trading system:
            <span className="block text-[hsl(var(--brand-primary))]">secure, observable, and review-ready</span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {trustPillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <article key={pillar.title} className="marketing-panel rounded-2xl p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--mk-border)/0.3)] bg-[hsl(var(--mk-surface-muted)/0.8)] text-[hsl(var(--brand-primary))]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{pillar.body}</p>
              </article>
            )
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {testimonials.map((item) => (
            <article key={item.role} className="marketing-panel rounded-2xl p-6">
              <MessageSquareQuote className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
              <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--mk-text))] [font-family:var(--home-copy)]">“{item.quote}”</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{item.role}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
          <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
          <span>Transparent quality bar: secure data boundaries, disciplined review loops, and production-grade reliability.</span>
        </div>
      </div>
    </section>
  )
}
