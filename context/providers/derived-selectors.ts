import { endOfDay, isValid, startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { calculateStatistics } from '@/lib/utils'
import type {
  Account,
  DateRange,
  HourFilter,
  PnlRange,
  TagFilter,
  TickFilter,
  TimeRange,
  Trade,
  WeekdayFilter,
} from '@/lib/data-types'

type TickDetailsMap = Record<string, { tickValue?: number | string } | undefined>

export function getTimeRangeKey(timeInPosition: number): string {
  const minutes = timeInPosition / 60
  if (minutes < 1) return 'under1min'
  if (minutes < 5) return '1to5min'
  if (minutes < 10) return '5to10min'
  if (minutes < 15) return '10to15min'
  if (minutes < 30) return '15to30min'
  if (minutes < 60) return '30to60min'
  if (minutes < 120) return '1to2hours'
  if (minutes < 300) return '2to5hours'
  return 'over5hours'
}

export function getSortedTrades(trades: Trade[]): Trade[] {
  if (!Array.isArray(trades) || trades.length === 0) {
    return []
  }

  return trades
    .filter((trade) => isValid(new Date(trade.entryDate)))
    .sort(
      (first, second) =>
        new Date(first.entryDate).getTime() - new Date(second.entryDate).getTime()
    )
}

interface FormatTradesOptions {
  sortedTrades: Trade[]
  groups: Array<{ id: string; name: string }>
  accounts: Account[]
  instruments: string[]
  accountNumbers: string[]
  dateRange?: DateRange
  pnlRange: PnlRange
  tickFilter: TickFilter
  tickDetails: TickDetailsMap
  timeRange: TimeRange
  weekdayFilter: WeekdayFilter
  hourFilter: HourFilter
  tagFilter: TagFilter
  timezone?: string
}

export function getFormattedTrades(options: FormatTradesOptions): Trade[] {
  const {
    sortedTrades,
    groups,
    accounts,
    instruments,
    accountNumbers,
    dateRange,
    pnlRange,
    tickFilter,
    tickDetails,
    timeRange,
    weekdayFilter,
    hourFilter,
    tagFilter,
    timezone,
  } = options

  if (!Array.isArray(sortedTrades) || sortedTrades.length === 0) {
    return []
  }

  const hiddenGroupId = groups.find((group) => group.name === 'Hidden Accounts')?.id
  const hiddenAccountNumbers = hiddenGroupId
    ? new Set(
        accounts
          .filter((account) => account.groupId === hiddenGroupId)
          .map((account) => account.number)
      )
    : null

  const instrumentFilterSet = instruments.length > 0 ? new Set(instruments) : null
  const accountFilterSet = accountNumbers.length > 0 ? new Set(accountNumbers) : null
  const tagFilterSet = tagFilter.tags.length > 0 ? new Set(tagFilter.tags) : null

  const fromDate = dateRange?.from ? startOfDay(dateRange.from) : null
  const toDate = dateRange?.to ? endOfDay(dateRange.to) : null
  const singleDayTimestamp =
    fromDate && toDate && fromDate.getTime() === startOfDay(toDate).getTime()
      ? fromDate.getTime()
      : null

  const fromTime = fromDate?.getTime() ?? null
  const toTime = toDate?.getTime() ?? null

  const accountResetTimes = new Map<string, number>()
  for (const account of accounts) {
    if (account.resetDate && account.shouldConsiderTradesBeforeReset === false) {
      accountResetTimes.set(account.number, startOfDay(new Date(account.resetDate)).getTime())
    }
  }

  const tickFilterValue = tickFilter?.value
    ? Number(tickFilter.value.replace('+', ''))
    : null
  const sortedTickers =
    tickFilterValue !== null
      ? Object.keys(tickDetails).sort((first, second) => second.length - first.length)
      : []

  const timezoneName = timezone || 'UTC'

  const hasFilters =
    Boolean(hiddenAccountNumbers) ||
    instrumentFilterSet !== null ||
    accountFilterSet !== null ||
    fromTime !== null ||
    toTime !== null ||
    singleDayTimestamp !== null ||
    pnlRange.min !== undefined ||
    pnlRange.max !== undefined ||
    tickFilterValue !== null ||
    Boolean(timeRange.range) ||
    weekdayFilter.days.length > 0 ||
    hourFilter.hour !== null ||
    tagFilterSet !== null ||
    accountResetTimes.size > 0

  if (!hasFilters) {
    return sortedTrades
  }

  const requiresDate =
    fromTime !== null ||
    toTime !== null ||
    singleDayTimestamp !== null ||
    weekdayFilter.days.length > 0 ||
    hourFilter.hour !== null ||
    accountResetTimes.size > 0

  return sortedTrades.filter((trade) => {
    if (hiddenAccountNumbers?.has(trade.accountNumber)) return false

    const rawDate = new Date(trade.entryDate)
    if (!isValid(rawDate)) return false

    let entryDate = rawDate
    if (requiresDate) {
      try {
        entryDate = toZonedTime(rawDate, timezoneName)
      } catch {
        entryDate = rawDate
      }

      if (!isValid(entryDate)) return false
    }

    if (requiresDate) {
      const resetTime = accountResetTimes.get(trade.accountNumber)
      if (resetTime !== undefined && startOfDay(entryDate).getTime() < resetTime) {
        return false
      }
    }

    if (instrumentFilterSet && !instrumentFilterSet.has(trade.instrument)) return false
    if (accountFilterSet && !accountFilterSet.has(trade.accountNumber)) return false

    if (requiresDate) {
      const entryTime = entryDate.getTime()
      if (fromTime !== null && entryTime < fromTime) return false
      if (toTime !== null && entryTime > toTime) return false
      if (singleDayTimestamp !== null && startOfDay(entryDate).getTime() !== singleDayTimestamp) {
        return false
      }
    }

    const tradePnl = Number(trade.pnl)
    if (pnlRange.min !== undefined && tradePnl < pnlRange.min) return false
    if (pnlRange.max !== undefined && tradePnl > pnlRange.max) return false

    if (tickFilterValue !== null) {
      const matchingTicker = sortedTickers.find((ticker) => trade.instrument.includes(ticker))
      const rawTickValue = matchingTicker ? Number(tickDetails[matchingTicker]?.tickValue) : 1
      const tickValue = Number.isFinite(rawTickValue) && rawTickValue !== 0 ? rawTickValue : 1

      const quantity = Number(trade.quantity)
      if (!Number.isFinite(quantity) || quantity === 0) return false

      const tradeTicks = Math.round((tradePnl / quantity) / tickValue)
      if (tradeTicks !== tickFilterValue) return false
    }

    if (timeRange.range && getTimeRangeKey(Number(trade.timeInPosition)) !== timeRange.range) {
      return false
    }

    if (requiresDate) {
      if (weekdayFilter.days.length > 0 && !weekdayFilter.days.includes(entryDate.getDay())) {
        return false
      }

      if (hourFilter.hour !== null && entryDate.getHours() !== hourFilter.hour) {
        return false
      }
    }

    if (tagFilterSet) {
      if (!Array.isArray(trade.tags)) return false
      if (!trade.tags.some((tag) => tagFilterSet.has(tag))) return false
    }

    return true
  })
}

export function getStatisticsWithProfitFactor(formattedTrades: Trade[], accounts: Account[]) {
  const stats = calculateStatistics(formattedTrades, accounts)

  const grossProfits = formattedTrades.reduce((sum, trade) => {
    const totalPnL = (trade.pnl || 0) - (trade.commission || 0)
    return totalPnL > 0 ? sum + totalPnL : sum
  }, 0)

  const grossLosses = Math.abs(
    formattedTrades.reduce((sum, trade) => {
      const totalPnL = (trade.pnl || 0) - (trade.commission || 0)
      return totalPnL < 0 ? sum + totalPnL : sum
    }, 0)
  )

  const profitFactor =
    grossLosses === 0
      ? grossProfits > 0
        ? Number.POSITIVE_INFINITY
        : 1
      : grossProfits / grossLosses

  return {
    ...stats,
    profitFactor,
  }
}
