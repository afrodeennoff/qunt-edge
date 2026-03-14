# Trading Journal Competitor Intelligence and Upgrade Map (2026-03-14)

## Sources
- https://www.tradezella.com/
- https://www.tradezella.com/pricing
- https://www.tradezella.com/trading-journal
- https://help.tradezella.com/en/articles/5801077-welcome-to-tradezella
- https://tradersync.com/
- https://tradersync.com/features/
- https://tradersync.com/pricing/
- https://tradersync.com/support/do-you-offer-a-free-trial/
- https://tradersync.com/support/do-you-have-a-mobile-app/
- https://edgewonk.com/
- https://edgewonk.com/features
- https://edgewonk.com/pricing
- https://www.tradervue.com/
- https://www.tradervue.com/site/pricing/
- https://trademetria.com/
- https://trademetria.com/trading-journal-features
- https://trademetria.com/status
- https://www.tradesviz.com/
- https://www.tradesviz.com/pricing/
- https://www.tradesviz.com/blog/android-ios-app-v2/
- https://www.trustpilot.com/review/tradersync.com
- https://www.trustpilot.com/review/tradezella.com

## Benchmark Matrix
| Category | Market Leader Patterns | Qunt Edge Current State (Before) | Priority |
|---|---|---|---|
| Product design system | Strong visual hierarchy, modular surfaces, consistent CTA and trust blocks | Strong base style but uneven trust architecture and conversion framing | High |
| CTA/conversion | Repeated free-trial CTA, risk-reversal, pricing offer framing | Good CTA copy, limited explicit risk-reversal framing | High |
| Marketing architecture | Hero -> proof -> trust -> comparison -> pricing -> conversion | Mostly present; trust and social proof were underweighted | High |
| Color strategy | Tight token usage and consistent emotional signaling | Good tokenized monochrome system; needed stronger utility reuse for trust/CTA chips | Medium |
| Feature/UX depth | Ingest speed, behavior loops, coaching, mentor/team flows | Strong analytics and AI posture; onboarding habit loops can be deeper | High |
| Technical quality | Reliability messaging, perceived speed, SEO schema, accessibility hygiene | Good engineering baseline; homepage schema/proof storytelling needed strengthening | Medium |

## Prioritized Gap Analysis
### Critical
- Add explicit trust and reliability architecture to top-level conversion funnel.
- Strengthen offer framing in pricing with value anchoring and savings presentation.

### High
- Increase social proof density near hero and pre-pricing zones.
- Improve conversion messaging continuity from hero through final CTA.
- Expand behavior-loop communication (diagnostics -> interventions -> measurable progress).

### Medium
- Add richer structured data for homepage SEO clarity.
- Continue color-system utility standardization across marketing and dashboard surfaces.

## Upgrade Plan
1. Conversion architecture: add trust/proof section between problem/feature narrative and pricing.
2. Pricing funnel: add annual-vs-monthly value framing and explicit trial/risk-reversal language.
3. Hero/CTA copy: reinforce low-friction start, immediate value, and category positioning.
4. SEO: add SoftwareApplication structured data on home route.
5. QA/verification: run lint, typecheck, build and sanity-check responsive/accessibility/SEO on updated flow.

## Implemented In This Pass
- Added trust/proof conversion section with reliability and social proof messaging.
- Upgraded pricing section with billing mode toggle, savings framing, and clearer trial messaging.
- Enhanced hero and final CTA conversion copy with low-friction trust chips and faster value framing.
- Added home structured data JSON-LD (SoftwareApplication).
- Added explicit onboarding journey section focused on first-insight speed and weekly habit-loop progression.
- Expanded comparison matrix to emphasize time-to-value differentiation.
- Added an above-the-fold proof strip that leads with enforceable boundaries (account scoping, fail-closed guardrails) before testimonials.
- Tightened CTA naming consistency across hero, pricing, and end-cap CTA (audit-first framing).
- Reduced complexity risk in PricingSection by extracting plan URL/price logic into helpers/components (no behavior change).

## Remaining Follow-ups
- Add evidence-backed public customer proof block (real testimonials/logos/metrics from your own user base).
- Add a first-session onboarding wizard for import + first insight generation.
- Add deeper mobile-specific UX test matrix for dashboard journaling/edit/report actions.
- Add explicit accessibility statement page and link from footer.
