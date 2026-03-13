'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type {
  DealItem,
  DrawdownType,
  FaqItem,
  FirmItem,
  MarketType,
  PayoutModel,
  TradingPlatform,
} from '../data/types'

type SortKey =
  | 'name'
  | 'challengeFee'
  | 'profitSplit'
  | 'drawdownType'
  | 'payoutFrequency'
  | 'maxAllocation'
  | 'rating'

type SortDirection = 'asc' | 'desc'

interface Props {
  locale: string
  deals: DealItem[]
  firms: FirmItem[]
  faqs: FaqItem[]
  lastUpdated: string
}

const marketOptions: Array<'All' | MarketType> = ['All', 'Futures', 'Forex', 'Crypto']
const platformOptions: Array<'All' | TradingPlatform> = ['All', 'Tradovate', 'Rithmic', 'MetaTrader 5', 'cTrader', 'DXtrade']
const payoutOptions: Array<'All' | PayoutModel> = ['All', 'Bi-weekly', 'Weekly', 'On-demand', 'Monthly']
const drawdownOptions: Array<'All' | DrawdownType> = ['All', 'Trailing', 'Static', 'End-of-day']

function priceMatch(value: number, range: string): boolean {
  if (range === 'all') return true
  if (range === '0-99') return value <= 99
  if (range === '100-199') return value >= 100 && value <= 199
  return value >= 200
}

function splitToNumber(split: string): number {
  const parsed = Number(split.split('/')[0])
  return Number.isFinite(parsed) ? parsed : 0
}

function allocationToNumber(maxAllocation: string): number {
  const parsed = Number(maxAllocation.replace('$', '').replace('K', '000').replace(/,/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export function PropFirmDealsExperience({ locale, deals, firms, faqs, lastUpdated }: Props) {
  const [search, setSearch] = useState('')
  const [market, setMarket] = useState<'All' | MarketType>('All')
  const [platform, setPlatform] = useState<'All' | TradingPlatform>('All')
  const [payout, setPayout] = useState<'All' | PayoutModel>('All')
  const [drawdown, setDrawdown] = useState<'All' | DrawdownType>('All')
  const [priceRange, setPriceRange] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('rating')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const normalizedSearch = search.trim().toLowerCase()

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const marketOk = market === 'All' || deal.marketType === market
      const platformOk = platform === 'All' || deal.platform === platform
      const payoutOk = payout === 'All' || deal.payoutModel === payout
      const drawdownOk = drawdown === 'All' || deal.drawdownType === drawdown
      const priceOk = priceMatch(deal.challengeFee, priceRange)
      const searchOk = !normalizedSearch || deal.firmName.toLowerCase().includes(normalizedSearch)
      return marketOk && platformOk && payoutOk && drawdownOk && priceOk && searchOk
    })
  }, [deals, market, platform, payout, drawdown, priceRange, normalizedSearch])

  const filteredFirms = useMemo(() => {
    const base = firms.filter((firm) => {
      const marketOk = market === 'All' || firm.marketType === market
      const platformOk = platform === 'All' || firm.platform === platform
      const payoutOk = payout === 'All' || firm.payoutModel === payout
      const drawdownOk = drawdown === 'All' || firm.drawdownType === drawdown
      const priceOk = priceMatch(firm.challengeFee, priceRange)
      const searchOk = !normalizedSearch || firm.name.toLowerCase().includes(normalizedSearch)
      return marketOk && platformOk && payoutOk && drawdownOk && priceOk && searchOk
    })

    return [...base].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name) * dir
        case 'challengeFee':
          return (a.challengeFee - b.challengeFee) * dir
        case 'profitSplit':
          return (splitToNumber(a.profitSplit) - splitToNumber(b.profitSplit)) * dir
        case 'drawdownType':
          return a.drawdownType.localeCompare(b.drawdownType) * dir
        case 'payoutFrequency':
          return a.payoutFrequency.localeCompare(b.payoutFrequency) * dir
        case 'maxAllocation':
          return (allocationToNumber(a.maxAllocation) - allocationToNumber(b.maxAllocation)) * dir
        case 'rating':
        default:
          return (a.rating - b.rating) * dir
      }
    })
  }, [firms, market, platform, payout, drawdown, priceRange, normalizedSearch, sortKey, sortDirection])

  const onSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    setSortDirection('desc')
  }

  const sortLabel = (key: SortKey) => {
    if (sortKey !== key) return ''
    return sortDirection === 'asc' ? ' (ascending)' : ' (descending)'
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Prop Firm Deals & Comparison
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Find verified discounts and compare firms fast
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Explore fresh promo codes, filter by your preferred rule set, and evaluate firm structures before committing.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#deals-grid" className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                Browse Deals
              </a>
              <a href="#comparison-table" className="inline-flex rounded-full border border-border bg-background/70 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                Compare Firms
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <ul className="space-y-3 text-sm">
              <li className="rounded-xl border border-border bg-card px-3 py-2 text-foreground">Tracked Firms: {firms.length}</li>
              <li className="rounded-xl border border-border bg-card px-3 py-2 text-foreground">Live Deals: {deals.length}</li>
              <li className="rounded-xl border border-border bg-card px-3 py-2 text-foreground">Last Updated: {lastUpdated}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground">Filter and Search</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Search firm</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Type firm name"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-foreground/40"
            />
          </label>
          <FilterSelect label="Market Type" value={market} onChange={setMarket} options={marketOptions} />
          <FilterSelect label="Platform" value={platform} onChange={setPlatform} options={platformOptions} />
          <FilterSelect label="Payout Model" value={payout} onChange={setPayout} options={payoutOptions} />
          <FilterSelect label="Drawdown Type" value={drawdown} onChange={setDrawdown} options={drawdownOptions} />
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Price Range</span>
            <select
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-foreground/40"
            >
              <option value="all">All prices</option>
              <option value="0-99">$0 - $99</option>
              <option value="100-199">$100 - $199</option>
              <option value="200+">$200+</option>
            </select>
          </label>
        </div>
      </section>

      <section id="deals-grid" className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured & Latest Deals</h2>
          <p className="text-sm text-muted-foreground">{filteredDeals.length} results</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDeals.map((deal) => (
            <article key={deal.id} className="rounded-2xl border border-border bg-card p-5 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-foreground">
                    {deal.firmName.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{deal.firmName}</p>
                </div>
                {deal.verified && (
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground">
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-4 text-2xl font-black text-foreground">{deal.discountPercent}% OFF</p>
              <p className="mt-2 inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground">
                Code: {deal.couponCode}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Expires: {deal.expiryDate}</p>
              <a
                href={deal.claimUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Claim Deal
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="comparison-table" className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Comparison Table</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sortable columns with mobile card fallback.</p>

        <div className="mt-4 hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead label="Firm" onClick={() => onSort('name')} active={sortKey === 'name'} indicator={sortLabel('name')} />
                <SortableHead label="Challenge Fee" onClick={() => onSort('challengeFee')} active={sortKey === 'challengeFee'} indicator={sortLabel('challengeFee')} />
                <SortableHead label="Profit Split" onClick={() => onSort('profitSplit')} active={sortKey === 'profitSplit'} indicator={sortLabel('profitSplit')} />
                <SortableHead label="Drawdown" onClick={() => onSort('drawdownType')} active={sortKey === 'drawdownType'} indicator={sortLabel('drawdownType')} />
                <SortableHead label="Payout Frequency" onClick={() => onSort('payoutFrequency')} active={sortKey === 'payoutFrequency'} indicator={sortLabel('payoutFrequency')} />
                <SortableHead label="Max Allocation" onClick={() => onSort('maxAllocation')} active={sortKey === 'maxAllocation'} indicator={sortLabel('maxAllocation')} />
                <SortableHead label="Rating" onClick={() => onSort('rating')} active={sortKey === 'rating'} indicator={sortLabel('rating')} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFirms.map((firm) => (
                <TableRow key={firm.id}>
                  <TableCell className="font-semibold text-foreground">{firm.name}</TableCell>
                  <TableCell className="text-muted-foreground">${firm.challengeFee}</TableCell>
                  <TableCell className="text-muted-foreground">{firm.profitSplit}</TableCell>
                  <TableCell className="text-muted-foreground">{firm.drawdownType}</TableCell>
                  <TableCell className="text-muted-foreground">{firm.payoutFrequency}</TableCell>
                  <TableCell className="text-muted-foreground">{firm.maxAllocation}</TableCell>
                  <TableCell className="text-foreground">{firm.rating.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 grid gap-3 md:hidden">
          {filteredFirms.map((firm) => (
            <article key={firm.id} className="rounded-xl border border-border bg-background/60 p-4">
              <h3 className="text-lg font-semibold text-foreground">{firm.name}</h3>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Term label="Challenge Fee" value={`$${firm.challengeFee}`} />
                <Term label="Profit Split" value={firm.profitSplit} />
                <Term label="Drawdown" value={firm.drawdownType} />
                <Term label="Payout" value={firm.payoutFrequency} />
                <Term label="Allocation" value={firm.maxAllocation} />
                <Term label="Rating" value={firm.rating.toFixed(1)} />
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">How trust is built</h2>
        <ol className="mt-3 grid gap-3 md:grid-cols-3">
          <li className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">1. Deal link and code are reviewed.</li>
          <li className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">2. Terms are validated against current checkout rules.</li>
          <li className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">3. Expired offers are removed from the board.</li>
        </ol>
        <p className="mt-4 text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Affiliate disclosure: some claim links may include referral parameters. This does not increase your purchase cost.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-xl font-semibold text-foreground">Join the community</h3>
          <p className="mt-2 text-sm text-muted-foreground">Discuss rule changes, strategy fit, and new offers with other traders.</p>
          <Link href={`/${locale}/community`} className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Open Community
          </Link>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-xl font-semibold text-foreground">Use trader tools</h3>
          <p className="mt-2 text-sm text-muted-foreground">Launch your planner workflow with matchup and cost tools.</p>
          <Link href={`/${locale}/deals/calculator`} className="mt-4 inline-flex rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground">
            Open Tracker / Calculator
          </Link>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">FAQ</h2>
        <Accordion type="single" collapsible className="mt-3">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`} className="rounded-xl border border-border bg-background/60 px-4 mb-2">
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}

function SortableHead({
  label,
  onClick,
  active,
  indicator,
}: {
  label: string
  onClick: () => void
  active: boolean
  indicator: string
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-left font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label={`Sort by ${label}${indicator}`}
      >
        {label}
        <span aria-hidden="true">{active ? (indicator.includes('ascending') ? '↑' : '↓') : '↕'}</span>
      </button>
    </TableHead>
  )
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (value: T) => void
  options: readonly T[]
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-foreground/40"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
