import React from 'react'
import { getI18n } from '@/locales/server'
import CompletedTimeline from '../components/completed-timeline'
import { getAllPosts } from '@/lib/posts'
import { getLatestVideoFromPlaylist } from '@/app/[locale]/admin/actions/youtube'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export const revalidate = 1800;

export default async function UpdatesPage(props: PageProps) {
  const params = await props.params;

  const {
    locale
  } = params;

  const t = await getI18n()
  const posts = await getAllPosts(locale)

  // Only show completed posts as per requirement
  const completedPosts = posts.filter(post => post.meta.status === 'completed')

  // Get the latest video for French locale
  let latestVideoId: string | null = null
  if (locale === 'fr') {
    latestVideoId = await getLatestVideoFromPlaylist()
  }

  return (
    <UnifiedPageShell widthClassName="max-w-5xl" className="py-8">
      {/* Display latest weekly video for French locale */}
      {locale === 'fr' && latestVideoId && (
        <UnifiedSurface className="mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-fg-primary">
              {t('updates.weeklyVideo')}
          </h2>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute left-0 top-0 h-full w-full"
                src={`https://www.youtube.com/embed/${latestVideoId}`}
                title="Dernière vidéo de la semaine"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </UnifiedSurface>
      )}

      <UnifiedSurface>
        <h2 className="mb-6 text-2xl font-semibold text-fg-primary">{t('updates.completed')}</h2>
        <CompletedTimeline milestones={completedPosts.map(post => ({
          id: post.meta.slug,
          title: post.meta.title,
          description: post.meta.description,
          status: 'completed',
          completedDate: post.meta.completedDate || post.meta.date,
          image: post.meta.image,
          youtubeVideoId: post.meta.youtubeVideoId
        }))} locale={locale} />
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
