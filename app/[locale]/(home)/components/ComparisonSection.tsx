'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X } from 'lucide-react'

const comparisonRows = [
  {
    item: 'Behavior drift detection',
    qunt: 'In-session alerts with root-cause hints',
    others: 'Post-session static reports',
  },
  {
    item: 'AI coaching output',
    qunt: 'Actionable playbook for next session',
    others: 'Generic observations without priorities',
  },
  {
    item: 'Journal + execution sync',
    qunt: 'Unified timeline with note anchors',
    others: 'Separate tools and manual matching',
  },
  {
    item: 'Manager visibility',
    qunt: 'Desk-level process consistency analytics',
    others: 'Limited to individual account stats',
  },
]

export default function ComparisonSection() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center sm:mb-12"
        >
          <Badge variant="outline" className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] [font-family:var(--home-mono)]">
            Difference From Others
          </Badge>
          <h2 className="mt-3 text-[clamp(2rem,4.7vw,3.35rem)] font-semibold leading-[0.92] tracking-[-0.028em] [font-family:var(--home-display)]">
            Why Qunt Edge is not
            <span className="block text-[hsl(var(--brand-primary))]">just another trading dashboard</span>
          </h2>
        </motion.div>

        <Card variant="glass" className="overflow-hidden rounded-3xl border-[hsl(var(--mk-border)/0.35)]">
          <CardHeader className="border-b border-[hsl(var(--mk-border)/0.2)] bg-[hsl(var(--mk-surface-muted)/0.5)]">
            <CardTitle className="text-lg tracking-[-0.01em] sm:text-xl [font-family:var(--home-display)]">Head-to-head comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--mk-border)/0.2)]">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-mono)]">Capability</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-mono)]">Qunt Edge</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[hsl(var(--mk-text-muted))] [font-family:var(--home-mono)]">Most Alternatives</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <motion.tr
                      key={row.item}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: idx * 0.05 }}
                      className="border-b border-[hsl(var(--mk-border)/0.14)]"
                    >
                      <td className="px-4 py-4 text-sm font-medium [font-family:var(--home-display)]">{row.item}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-[hsl(var(--mk-text))]">
                          <Check className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
                          <span className="[font-family:var(--home-copy)]">{row.qunt}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-[hsl(var(--mk-text-muted))]">
                          <X className="h-4 w-4" />
                          <span className="[font-family:var(--home-copy)]">{row.others}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
