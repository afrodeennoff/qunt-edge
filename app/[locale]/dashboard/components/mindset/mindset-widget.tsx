"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Journaling } from "./journaling"
import { Timeline } from "./timeline"
import { MindsetSummary } from "./mindset-summary"
import { useI18n } from "@/locales/client"
import { Info, ChevronLeft, ChevronRight, Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard"
import type { EmblaCarouselType as CarouselApi } from "embla-carousel"
import { toast } from "sonner"
import { saveMindset, deleteMindset } from "@/server/journal"
import { addTagsToTradesForDay } from "@/server/trades"
import { isToday, format } from "date-fns"
import { useMoodStore } from "@/store/mood-store"
import { useFinancialEventsStore } from "@/store/financial-events-store"
import { useTradesStore } from "@/store/trades-store"
import { useCurrentLocale } from "@/locales/client"
import { FinancialEvent } from "@/prisma/generated/prisma"
import { Trade } from "@/lib/data-types"

interface MindsetWidgetProps {
  size: WidgetSize
}

export function MindsetWidget({ size }: MindsetWidgetProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [emotionValue, setEmotionValue] = useState(0)
  const [selectedNews, setSelectedNews] = useState<string[]>([])
  const [journalContent, setJournalContent] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isEditing, setIsEditing] = useState(true)
  const [isTimelineVisible, setIsTimelineVisible] = useState(true)
  const moods = useMoodStore(state => state.moods)
  const setMoods = useMoodStore(state => state.setMoods)
  const financialEvents = useFinancialEventsStore(state => state.events)
  const trades = useTradesStore(state => state.trades)
  const setTrades = useTradesStore(state => state.setTrades)
  const locale = useCurrentLocale()
  const t = useI18n()

  // Consolidated effect for carousel and mood data handling
  useEffect(() => {
    if (!api) return

    // Handle carousel selection
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })

    // Handle initial load and mood data
    if (moods) {
      const today = new Date()
      const hasTodayData = moods.some(mood => {
        if (!mood?.day) return false
        const moodDate = mood.day instanceof Date ? mood.day : new Date(mood.day)
        return format(moodDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      })

      // Handle selected date mood data
      const mood = moods.find(mood => {
        if (!mood?.day) return false
        const moodDate = mood.day instanceof Date ? mood.day : new Date(mood.day)
        return format(moodDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      })

      // If it's today and we have data, show summary
      if (isToday(selectedDate) && hasTodayData) {
        // Set data to today's data
        setEmotionValue(mood?.emotionValue ?? 50)
        setSelectedNews(mood?.selectedNews ?? [])
        setJournalContent(mood?.journalContent ?? "")
        setIsEditing(true)
        api.scrollTo(1) // Summary is now index 1
        return
      }

      if (mood) {
        setEmotionValue(mood.emotionValue ?? 50)
        setSelectedNews(mood.selectedNews ?? [])
        setJournalContent(mood.journalContent ?? "")
        api.scrollTo(1) // Summary is now index 1
      } else {
        // Reset all values if no mood data exists for the selected date
        setEmotionValue(0)
        setSelectedNews([])
        setJournalContent("")
      }
    }
  }, [api, selectedDate, moods])

  const handleEmotionChange = (value: number) => {
    setEmotionValue(value)
  }

  const handleNewsSelection = (newsIds: string[]) => {
    setSelectedNews(newsIds)
  }

  const handleJournalChange = (content: string) => {
    setJournalContent(content)
  }

  const handleApplyTagToAll = async (tag: string) => {
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd')

      // Find all trades for this day
      const tradesForDay = trades.filter(trade => {
        const entryDate = trade.entryDate
        const closeDate = trade.closeDate
        const entryMatches = entryDate && format(new Date(entryDate), 'yyyy-MM-dd') === dateKey
        const closeMatches = closeDate && format(new Date(closeDate), 'yyyy-MM-dd') === dateKey
        return entryMatches || closeMatches
      })

      const tradeIds = tradesForDay.map(trade => trade.id)

      // Update local state immediately for instant feedback
      const updatedTrades = trades.map(trade => {
        if (tradeIds.includes(trade.id)) {
          return {
            ...trade,
            tags: Array.from(new Set([...trade.tags, tag]))
          }
        }
        return trade
      })
      setTrades(updatedTrades)

      // Then update on server
      await addTagsToTradesForDay(dateKey, [tag])

      toast.success(t('mindset.tags.tagApplied'), {
        description: t('mindset.tags.tagAppliedDescription', { tag }),
      })
    } catch (error) {
      toast.error(t('mindset.tags.tagApplyError'), {
        description: t('mindset.tags.tagApplyErrorDescription'),
      })
    }
  }

  const handleSave = async () => {
    // Scroll to summary view after saving
    api?.scrollTo(1)
    try {
      const dateKey = format(selectedDate, 'yyyy-MM-dd')
      const savedMood = await saveMindset({
        emotionValue,
        selectedNews,
        journalContent,
      }, dateKey)

      // Update the moodHistory in context
      const updatedMoodHistory = moods?.filter(mood => {
        if (!mood?.day) return true
        const moodDate = mood.day instanceof Date ? mood.day : new Date(mood.day)
        const selectedDateKey = format(selectedDate, 'yyyy-MM-dd')
        const moodDateKey = format(moodDate, 'yyyy-MM-dd')
        return moodDateKey !== selectedDateKey
      }) || []
      setMoods([...updatedMoodHistory, savedMood])

      toast.success(t('mindset.saveSuccess'), {
        description: t('mindset.saveSuccessDescription'),
      })

    } catch (error) {
      toast.error(t('mindset.saveError'), {
        description: t('mindset.saveErrorDescription'),
      })
    }
  }

  const handleDeleteEntry = async (date: Date) => {
    try {
      const dateKey = format(date, 'yyyy-MM-dd')
      await deleteMindset(dateKey)

      // Update the moodHistory in context
      const updatedMoodHistory = moods?.filter(mood => {
        if (!mood?.day) return true
        const moodDate = mood.day instanceof Date ? mood.day : new Date(mood.day)
        return format(moodDate, 'yyyy-MM-dd') !== dateKey
      }) || []
      setMoods(updatedMoodHistory)

      // If the deleted entry was the selected date, reset the form
      if (dateKey === format(selectedDate, 'yyyy-MM-dd')) {
        setEmotionValue(50)
        setSelectedNews([])
        setJournalContent("")
        setIsEditing(true)
        api?.scrollTo(0)
      }
    } catch (error) {
      throw error // Let the Timeline component handle the error toast
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)

    // Find if we have data for the selected date
    const moodForDate = moods?.find(mood => {
      if (!mood?.day) return false
      const moodDate = mood.day instanceof Date ? mood.day : new Date(mood.day)
      return format(moodDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    })

    if (moodForDate) {
      // If we have data, update all the state values
      console.warn("We have data for the selected date")
      setEmotionValue(moodForDate.emotionValue ?? 50)
      setSelectedNews(moodForDate.selectedNews ?? [])
      setJournalContent(moodForDate.journalContent ?? " ")
      setIsEditing(true)
      api?.scrollTo(1) // Summary is now index 1
    } else {
      // If no data exists, reset the form
      setEmotionValue(50)
      setSelectedNews([])
      setJournalContent("")
      setIsEditing(true)
      api?.scrollTo(0) // Journaling is index 0
    }
  }

  const getEventsForDate = (date: Date): FinancialEvent[] => {
    return financialEvents.filter(event => {
      if (!event.date) return false;
      try {
        const eventDate = new Date(event.date)
        const compareDate = new Date(date)

        // Set hours to start of day for comparison
        eventDate.setHours(0, 0, 0, 0)
        compareDate.setHours(0, 0, 0, 0)

        return eventDate.getTime() === compareDate.getTime() && event.lang === locale
      } catch (error) {
        console.error('Error parsing event date:', error)
        return false
      }
    })
  }

  const handleEdit = (section?: 'emotion' | 'journal' | 'news') => {
    setIsEditing(true)

    // Navigate to the appropriate section
    switch (section) {
      case 'news':
        api?.scrollTo(0) // News is now part of journaling
        break
      case 'journal':
        api?.scrollTo(0)
        break
      case 'emotion':
        api?.scrollTo(0)
        break
      default:
        api?.scrollTo(0)
    }
  }

  const toggleTimeline = () => {
    setIsTimelineVisible(!isTimelineVisible)
  }

  const steps = [
    {
      title: t('mindset.journaling.title'),
      component: <Journaling
        content={journalContent}
        onChange={handleJournalChange}
        onSave={handleSave}
        emotionValue={emotionValue}
        onEmotionChange={handleEmotionChange}
        date={selectedDate}
        events={getEventsForDate(selectedDate)}
        selectedNews={selectedNews}
        onNewsSelection={handleNewsSelection}
        trades={trades}
        onApplyTagToAll={handleApplyTagToAll}
      />
    },
    {
      title: t('mindset.title'),
      component: <MindsetSummary
        date={selectedDate}
        emotionValue={emotionValue}
        selectedNews={selectedNews}
        journalContent={journalContent}
        onEdit={handleEdit}
      />
    }
  ]

  return (
    <Card className="relative flex h-full w-full flex-col overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(9,9,11,0.97)_44%,rgba(9,9,11,1)_100%)] p-0 shadow-[0_32px_90px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-6 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
      </div>

      <CardHeader
        className={cn(
          "relative z-10 flex shrink-0 flex-row items-center justify-between space-y-0 border-b border-white/10",
          size === "small" ? "h-11 px-3" : "h-16 px-4 sm:px-5"
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-4 w-4 text-white/70" />
          <CardTitle className={cn("line-clamp-1 text-white", size === "small" ? "text-sm" : "text-base")}>
            {t("mindset.title")}
          </CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className={cn(
                  "cursor-help text-white/45 transition-colors hover:text-white/80",
                  size === "small" ? "h-3.5 w-3.5" : "h-4 w-4"
                )} />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t("mindset.description")}</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:flex">
            {steps.map((step, index) => (
              <span
                key={step.title}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  current === index ? "w-5 bg-white" : "w-1.5 bg-white/35"
                )}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => api?.scrollPrev()}
            disabled={current === 0}
            className="h-7 w-7 border-white/15 bg-white/5 hover:bg-white/10"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => api?.scrollNext()}
            disabled={current === steps.length - 1}
            className="h-7 w-7 border-white/15 bg-white/5 hover:bg-white/10"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 flex min-h-0 flex-1 flex-row overflow-hidden p-0">
        <div
          className={cn(
            "relative border-r border-white/10 bg-black/25 transition-all duration-300",
            isTimelineVisible ? "w-[220px] min-w-[220px]" : "w-0 min-w-0 overflow-hidden"
          )}
        >
          <Timeline
            className="h-full"
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
            moodHistory={moods}
            onDeleteEntry={handleDeleteEntry}
          />
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleTimeline}
            className="absolute -right-3 top-4 h-6 w-6 rounded-full border border-white/10 bg-black/80"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </Button>
        </div>

        {!isTimelineVisible && (
          <div className="absolute left-3 top-3 z-20">
            <Button
              variant="secondary"
              size="icon"
              onClick={toggleTimeline}
              className="h-7 w-7 rounded-full border border-white/10 bg-black/80"
            >
              <PanelLeftOpen className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <Carousel
          opts={{
            loop: false,
            watchDrag: () => window.innerWidth < 768
          }}
          setApi={setApi}
          className="flex h-full min-w-0 flex-1 flex-col"
        >
          <CarouselContent className="h-full flex-1 pl-0">
            {steps.map((step) => (
              <CarouselItem key={step.title} className="h-full p-3 sm:p-4">
                <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-3 sm:p-4">
                  {step.component}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </CardContent>
    </Card>
  )
}
