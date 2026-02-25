import { Metadata } from 'next'
import { getPosts } from '@/app/[locale]/(landing)/actions/community'
import { PostList } from './components/post-list'
import { CreatePost } from './components/create-post'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getI18n } from '@/locales/server'
import { UnifiedPageHeader, UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell'

export const metadata = {
  title: 'Community | Qunt Edge',
  description: 'Join the Qunt Edge community of traders.',
}

export default async function CommunityPage() {
  const t = await getI18n()
  const posts = await getPosts()
  return (
    <UnifiedPageShell widthClassName="max-w-5xl" className="py-8">
      <UnifiedPageHeader
        eyebrow="Community"
        title={t('community.title')}
        description={t('community.description')}
        actions={
          <CreatePost>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('community.newPost')}
            </Button>
          </CreatePost>
        }
      />
      <UnifiedSurface>
        <PostList initialPosts={posts} />
      </UnifiedSurface>
    </UnifiedPageShell>
  )
}
