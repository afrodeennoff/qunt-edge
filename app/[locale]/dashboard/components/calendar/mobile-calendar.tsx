'use client'

import React, { useMemo, useState } from "react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, addDays } from "date-fns"
import { formatInTimeZone, toDate } from 'date-fns-tz'
import { fr, enUS } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CalendarModal } from "./daily-modal"
import { CalendarData } from "@/app/[locale]/dashboard/types/calendar"
import { Card, CardTitle } from "@/components/ui/card"
import { useI18n, useCurrentLocale } from "@/locales/client"
import { useUserStore } from "../../../../../store/user-store"

function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

// Generates an array of 42 YYYY-MM-DD date strings for the calendar grid,
// ensuring calculations respect the target timezone.
function getCalendarDayStrings(currentMonthDate: Date, timezone: string, weekStartsOnMonday: boolean = false): string[] {
  // 1. Get the start of the month in the target timezone string format (YYYY-MM-01)
  const monthStartString = formatInTimeZone(currentMonthDate, timezone, 'yyyy-MM-01');
  // 2. Convert this string to a Date object representing midnight *in the target timezone*.
  const firstDayOfMonthInTZ = toDate(monthStartString, { timeZone: timezone });
  // 3. Get the day of the week (0=Sunday, 6=Saturday) for this first day *in the target timezone*.
  const startDayOfWeek = getDay(firstDayOfMonthInTZ); // getDay uses the locale's start of week, but the Date object is timezone-correct

  // 4. Calculate the actual start date of the grid (Sunday or Monday) by subtracting days from the first day.
  // `addDays` operates on the underlying timestamp but starts from a timezone-aware Date.
  // If week starts on Monday, adjust: Monday=1, so subtract (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1)
  const daysToSubtract = weekStartsOnMonday
    ? (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1)
    : startDayOfWeek;
  let currentGridDate = addDays(firstDayOfMonthInTZ, -daysToSubtract);

  const dayStrings: string[] = [];
  for (let i = 0; i < 42; i++) {
    // Format the current grid date *in the target timezone* for the array
    dayStrings.push(formatInTimeZone(currentGridDate, timezone, 'yyyy-MM-dd'));
    // Increment the date for the next iteration
    currentGridDate = addDays(currentGridDate, 1);
  }

  // Ensure we always return exactly 42 days. Should be guaranteed by the loop.
  return dayStrings;
}

// Checks if a given YYYY-MM-DD date string matches today's date in the target timezone.
function isDateStringToday(dateString: string, timezone: string): boolean {
  const todayString = formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
  return dateString === todayString;
}

export default function MobileCalendarPnl({ calendarData }: { calendarData: CalendarData }) {
  const t = useI18n()
  const locale = useCurrentLocale()
  const timezone = useUserStore(state => state.timezone)
  const dateLocale = locale === 'fr' ? fr : enUS
  const weekStartsOnMonday = locale === 'fr'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Generate calendar date strings based on the current date and timezone
  const calendarDayStrings = getCalendarDayStrings(currentDate, timezone, weekStartsOnMonday)

  // Get the current month and year based on the state date *in the target timezone*
  // Use a reference date (start of the month) in the target timezone for reliable comparison.
  const currentMonthReferenceDate = toDate(formatInTimeZone(currentDate, timezone, 'yyyy-MM-01'), { timeZone: timezone });
  const currentMonth = currentMonthReferenceDate.getMonth()
  const currentYear = currentMonthReferenceDate.getFullYear()

  // Define weekday headers (Monday start for French locale, Sunday start otherwise)
  const weekdayHeaders = weekStartsOnMonday
    ? [
      { key: 'monday', label: t('calendar.weekdays.mon') },
      { key: 'tuesday', label: t('calendar.weekdays.tue') },
      { key: 'wednesday', label: t('calendar.weekdays.wed') },
      { key: 'thursday', label: t('calendar.weekdays.thu') },
      { key: 'friday', label: t('calendar.weekdays.fri') },
      { key: 'saturday', label: t('calendar.weekdays.sat') },
      { key: 'sunday', label: t('calendar.weekdays.sun') }
    ]
    : [
      { key: 'sunday', label: t('calendar.weekdays.sun') },
      { key: 'monday', label: t('calendar.weekdays.mon') },
      { key: 'tuesday', label: t('calendar.weekdays.tue') },
      { key: 'wednesday', label: t('calendar.weekdays.wed') },
      { key: 'thursday', label: t('calendar.weekdays.thu') },
      { key: 'friday', label: t('calendar.weekdays.fri') },
      { key: 'saturday', label: t('calendar.weekdays.sat') }
    ]

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const calculateMonthlyTotal = () => {
    // This calculation correctly uses dateString keys which are already YYYY-MM-DD
    return Object.entries(calendarData).reduce((total, [dateString, dayData]) => {
      // Parse the date string to compare month and year
      try {
        // Use UTC for parsing the key to avoid local shifts, then compare components
        const date = toDate(dateString + 'T00:00:00Z')
        if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
          return total + dayData.pnl
        }
      } catch (e) {
        console.error("Error parsing date string in calculateMonthlyTotal:", dateString, e)
      }
      return total
    }, 0)
  }

  const monthlyTotal = calculateMonthlyTotal()

  const getMaxPnl = () => {
    // This calculation correctly uses dateString keys which are already YYYY-MM-DD
    return Math.max(0, ...Object.entries(calendarData)
      .filter(([dateString]) => {
        try {
          // Use UTC for parsing the key to avoid local shifts, then compare components
          const date = toDate(dateString + 'T00:00:00Z')
          return date.getFullYear() === currentYear && date.getMonth() === currentMonth
        } catch (e) {
          console.error("Error parsing date string in getMaxPnl:", dateString, e)
          return false
        }
      })
      .map(([_, data]) => Math.abs(data.pnl)))
  }

  const maxPnl = getMaxPnl()
  const monthStats = useMemo(() => {
    let activeDays = 0
    let wins = 0
    let losses = 0
    Object.values(calendarData).forEach((dayData) => {
      if (!dayData) return
      if (dayData.tradeNumber > 0) activeDays += 1
      if (dayData.pnl > 0) wins += 1
      if (dayData.pnl < 0) losses += 1
    })
    return { activeDays, wins, losses }
  }, [calendarData])

  return (
    <Card className="h-full flex flex-col overflow-hidden border-border/60 bg-card/95 backdrop-blur-xl">
      <div className="shrink-0 border-b border-border/60 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-base font-semibold capitalize">
              {formatInTimeZone(currentDate, timezone, 'MMMM yyyy', { locale: dateLocale })}
            </CardTitle>
            <div className={cn(
              "mt-1 text-lg font-black tracking-tight",
              monthlyTotal >= 0 ? "text-semantic-success" : "text-semantic-error"
            )}>
              {formatCurrency(monthlyTotal)}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8 border-border/60 bg-card/92">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8 border-border/60 bg-card/92">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="rounded-md border border-border/55 bg-card/92 px-1.5 py-0.5">Days {monthStats.activeDays}</span>
          <span className="rounded-md border border-semantic-success-border/40 bg-semantic-success-bg/10 px-1.5 py-0.5 text-semantic-success">W {monthStats.wins}</span>
          <span className="rounded-md border border-semantic-error-border/40 bg-semantic-error-bg/10 px-1.5 py-0.5 text-semantic-error">L {monthStats.losses}</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 p-2">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekdayHeaders.map((day) => (
            <div key={day.key} className="rounded-md border border-border/55 bg-secondary/30 py-1 text-center text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              {day.label}
            </div>
          ))}
        </div>
        <div className="grid h-[calc(100%-30px)] grid-cols-7 auto-rows-fr gap-1">
          {calendarDayStrings.map((dateString) => { // Iterate over date strings
            const dayData = calendarData[dateString] // Direct lookup using the string key

            // Parse the date string *in the target timezone* to get a Date object
            // for reliable month/year checks and display formatting.
            let dateInTZ: Date;
            try {
              dateInTZ = toDate(dateString, { timeZone: timezone });
            } catch (e) {
              console.error("Error parsing date string for display:", dateString, e);
              // Render a placeholder or skip if parsing fails
              return <div key={dateString} className="text-muted-foreground/70 text-[10px] uppercase font-bold">Error</div>;
            }

            // Determine if the date belongs to the currently displayed month
            const isCurrentMonthDay =
              dateInTZ.getMonth() === currentMonth &&
              dateInTZ.getFullYear() === currentYear

            const intensity = maxPnl > 0 ? Math.min(Math.abs(dayData?.pnl ?? 0) / maxPnl, 1) : 0
            const dayPnl = dayData?.pnl ?? 0

            return (
              <div
                key={dateString} // Key is the timezone-correct date string
                className={cn(
                  "relative flex cursor-pointer flex-col justify-between rounded-lg border p-1 transition-all",
                  dayData ? "border-border/55" : "border-border/55 bg-card/92",
                  dayPnl > 0 && "border-semantic-success-border/40",
                  dayPnl < 0 && "border-semantic-error-border/40",
                  isDateStringToday(dateString, timezone) && "border-primary/70 bg-primary/10",
                  !isCurrentMonthDay && "opacity-45"
                )}
                onClick={() => setSelectedDate(dateInTZ)} // Pass the Date object parsed in the target timezone
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-lg",
                    dayPnl > 0 && "bg-semantic-success/20",
                    dayPnl < 0 && "bg-semantic-error/20"
                  )}
                  style={{ opacity: intensity * 0.8 }}
                />
                <div className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/55 bg-card/92 text-xs font-semibold",
                  dayPnl > 0 && "text-semantic-success",
                  dayPnl < 0 && "text-semantic-error"
                )}>
                  <span>
                    {/* Display the day number from the date parsed in the target timezone */}
                    {format(dateInTZ, 'd')}
                  </span>
                </div>
                <div className="mt-1 text-center">
                  {dayData ? (
                    <>
                      <div
                        className={cn(
                          "truncate text-[10px] font-bold",
                          dayPnl >= 0 ? "text-semantic-success" : "text-semantic-error"
                        )}
                      >
                        {formatCurrency(dayPnl)}
                      </div>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted/40">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            dayPnl >= 0 ? "bg-semantic-success/80" : "bg-semantic-error/80"
                          )}
                          style={{ width: `${Math.max(8, Math.round(intensity * 100))}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="truncate text-[10px] text-muted-foreground/70">-</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <CalendarModal
        isOpen={selectedDate !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDate(null)
        }}
        selectedDate={selectedDate}
        // Look up dayData using the selectedDate formatted back into a YYYY-MM-DD string *in the target timezone*
        dayData={selectedDate ? calendarData[formatInTimeZone(selectedDate, timezone, 'yyyy-MM-dd')] : undefined}
        isLoading={isLoading}
      />
    </Card>
  )
}
