import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Lock, Server, LifeBuoy, MessageSquareQuote, Check } from 'lucide-react'

const trustPillars = [
  {
    title: 'Security By Design',
    body: 'Account-scoped reads and writes with ownership checks across imports, layouts, optimized updates, and uploads.',
    icon: Lock,
  },
  {
    title: 'Reliable Operations',
    body: 'Fail-closed budget enforcement, explicit error contracts, and hardened routes that don’t silently fall back.',
    icon: Server,
  },
  {
    title: 'Data You Control',
    body: 'Bring your existing workflow, export review briefs, and keep your performance loop portable.',
    icon: ShieldCheck,
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
  {
    quote: 'The weekly brief made coaching conversations faster because the data is already organized.',
    role: 'Mentor / Coach',
  },
]

const enforcement = [
  'Ownership guards across imports, layouts, batch updates, and media deletion paths.',
  'Clear error envelopes (no mixed formats) so clients can handle failures predictably.',
  'Budget and routing guardrails designed to fail closed when dependencies are unavailable.',
  'Isolation regression tests to prevent cross-user data bleed as the product evolves.',
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
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[1.78] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
            Trust is not a slogan. It is enforced boundaries, predictable failure modes, and a review loop you can audit week after week.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          {testimonials.map((item) => (
            <article key={item.role} className="marketing-panel rounded-2xl p-6">
              <MessageSquareQuote className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
              <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--mk-text))] [font-family:var(--home-copy)]">“{item.quote}”</p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">{item.role}</p>
            </article>
          ))}

          <article className="marketing-panel rounded-2xl p-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
              What We Enforce
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.01em] [font-family:var(--home-display)]">
              Hard boundaries, not hope.
            </h3>
            <ul className="mt-4 space-y-3">
              {enforcement.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--mk-border)/0.32)] bg-[hsl(var(--mk-surface-muted)/0.7)] text-[hsl(var(--brand-primary))]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[hsl(var(--mk-text-muted))] [font-family:var(--home-copy)]">
          <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
          <span>Transparent quality bar: secure data boundaries, disciplined review loops, and production-grade reliability.</span>
        </div>
      </div>
    </section>
  )
}
