import { getPost, getComments } from '@/app/[locale]/(landing)/actions/community'
import { PostCard } from '../../components/post-card'
import { notFound } from 'next/navigation'
import { ExtendedPost } from '../../types'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function PostPage(props: Props) {
  const params = await props.params;
  let postData: Awaited<ReturnType<typeof getPost>>
  let commentsData: Awaited<ReturnType<typeof getComments>>

  try {
    ;[postData, commentsData] = await Promise.all([
      getPost(params.id),
      getComments(params.id),
    ])
  } catch {
    notFound()
  }

  if (!postData) {
    notFound()
  }

  const extendedPost: ExtendedPost = {
    ...postData,
    _count: { comments: commentsData.length }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <PostCard
          post={extendedPost}
          isExpanded={true}
          isAuthor={extendedPost.isAuthor}
        />
      </div>
    </div>
  )
}
