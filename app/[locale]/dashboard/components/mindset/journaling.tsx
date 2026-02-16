"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/locales/client"
import { EmotionSelector } from "./emotion-selector"
import { DayTagSelector } from "./day-tag-selector"
import { FinancialEvent } from "@/prisma/generated/prisma"
import { Trade } from "@/lib/data-types"
import { TiptapEditor } from "@/components/tiptap-editor"

interface JournalingProps {
  content: string
  onChange: (content: string) => void
  onSave: () => void
  emotionValue: number
  onEmotionChange: (value: number) => void
  date: Date
  events: FinancialEvent[]
  selectedNews: string[]
  onNewsSelection: (newsIds: string[]) => void
  trades: Trade[]
  onApplyTagToAll: (tag: string) => Promise<void>
}

export function Journaling({
  content,
  onChange,
  onSave,
  emotionValue,
  onEmotionChange,
  date,
  events,
  selectedNews,
  onNewsSelection,
  trades,
  onApplyTagToAll,
}: JournalingProps) {
  const t = useI18n()

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/55">{t("mindset.emotion.title")}</h3>
          <EmotionSelector
            value={emotionValue}
            onChange={onEmotionChange}
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="mb-3 text-[11px] uppercase tracking-[0.2em] text-white/55">Day Tags</h3>
          <DayTagSelector
            trades={trades}
            date={date}
            onApplyTagToAll={onApplyTagToAll}
          />
        </section>
      </div>

      <div className="min-h-0 flex-1 rounded-2xl border border-white/10 bg-black/35 p-3 sm:p-4">
        <TiptapEditor
          content={content}
          onChange={onChange}
          placeholder={t('mindset.journaling.placeholder')}
          width="100%"
          height="100%"
          events={events}
          selectedNews={selectedNews}
          onNewsSelection={onNewsSelection}
          date={date}
        />
      </div>

      <div className="flex-none">
        <Button
          onClick={onSave}
          className="w-full border border-white/20 bg-white text-black transition hover:bg-white/90"
        >
          {t('mindset.journaling.save')}
        </Button>
      </div>
    </div>
  )
} 
