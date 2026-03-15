'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

interface TimelineItem {
  id: string
  title: string
  description: string
  completedDate: string
  status: 'completed' | 'in-progress' | 'upcoming'
  image?: string
  youtubeVideoId?: string
}

export default function CompletedTimeline({ milestones, locale }: { milestones: TimelineItem[], locale: string }) {
  const dateLocale = locale === 'fr' ? fr : enUS

  const completedMilestones = useMemo(() => {
    return milestones
      .filter(milestone => milestone.status === 'completed' && milestone.completedDate)
      .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
  }, [milestones])

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 h-full w-0.5 bg-border/60 dark:bg-border/80" />
      
      <div className="space-y-12 pl-12">
        {completedMilestones.map((milestone) => (
          <div key={milestone.id} className="relative">
            <div className="absolute -left-[44px] flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-card/90 dark:border-border/80 dark:bg-card/95">
              <div className="h-3 w-3 rounded-full bg-muted/40 dark:bg-muted/30" />
            </div>
            
            <Link href={`/${locale}/updates/${milestone.id}`} className="block hover:opacity-90 transition-opacity">
              <time className="mb-2 block text-sm text-muted-foreground/70">
                {format(new Date(milestone.completedDate), 'MMMM d, yyyy', { locale: dateLocale })}
              </time>
              <h3 className="text-lg font-semibold text-foreground">
                {milestone.title}
              </h3>
              <p className="mt-2 text-muted-foreground/70">
                {milestone.description}
              </p>
              
              {/* Display YouTube video for French locale if available */}
              {locale === 'fr' && milestone.youtubeVideoId && (
                <div className="mt-4 rounded-lg overflow-hidden bg-card/70 dark:bg-card/80">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${milestone.youtubeVideoId}`}
                      title={milestone.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
              
              {milestone.image && !milestone.youtubeVideoId && (
                <div className="mt-4 rounded-lg overflow-hidden bg-card/70 dark:bg-card/80">
                  <Image
                    src={milestone.image}
                    alt={milestone.title}
                    width={800}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
