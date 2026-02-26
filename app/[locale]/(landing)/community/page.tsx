import { getPosts } from '@/app/[locale]/(landing)/actions/community'
import { PostList } from './components/post-list'
import { CreatePost } from './components/create-post'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getI18n } from '@/locales/server'
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'

export const metadata = {
  title: 'Community | Qunt Edge',
  description: 'Join the Qunt Edge community of traders.',
}

export default async function CommunityPage() {
  const t = await getI18n()
  const posts = await getPosts()
  return (
    <UnifiedPageShell widthClassName="max-w-none" className="py-8">
      <UnifiedSurface>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-fg-primary">{t('community.title')}</h1>
            <p className="mt-1 text-fg-muted">{t('community.description')}</p>
          </div>
          <CreatePost>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('community.newPost')}
            </Button>
          </CreatePost>
        </div>
        <PostList initialPosts={posts} />
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
