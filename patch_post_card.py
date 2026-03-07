import re

filepath = 'app/[locale]/(landing)/community/components/post-card.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Refactor PostCard to reduce complexity
post_orig = '''export function PostCard({ post, currentUserId, onUpvote, onDelete }: PostCardProps) {
  const t = useI18n()
  const locale = useCurrentLocale()
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const hasUpvoted = currentUserId ? post.upvotes.some(u => u.userId === currentUserId) : false
  const isAuthor = currentUserId === post.userId
  const isAnnouncement = post.category === 'ANNOUNCEMENT'

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUserId) {
      toast.error(t('community.signInToUpvote'))
      return
    }

    setIsUpvoting(true)
    try {
      await onUpvote(post.id)
    } finally {
      setIsUpvoting(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthor) return

    setIsDeleting(true)
    try {
      await onDelete?.(post.id)
      toast.success(t('community.postDeleted'))
    } catch (error) {
      toast.error(t('community.deleteError'))
      setIsDeleting(false)
    }
  }'''

post_new = '''function PostActions({ post, hasUpvoted, isUpvoting, handleUpvote, isAuthor, isDeleting, handleDelete }: any) {
  const t = useI18n()
  return (
    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 rounded-full transition-colors",
            hasUpvoted
              ? "text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          )}
          onClick={handleUpvote}
          disabled={isUpvoting}
        >
          <ArrowBigUp className={cn("w-4 h-4 mr-1.5", hasUpvoted && "fill-current")} />
          <span className="font-medium">{post._count.upvotes}</span>
        </Button>
      </div>

      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full pointer-events-none">
          <MessageSquare className="w-4 h-4 mr-1.5" />
          <span className="font-medium">{post._count.comments}</span>
        </Button>
      </div>

      {isAuthor && onDelete && (
        <div className="ml-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isDeleting}
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('community.deletePostConfirm')}</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}

export function PostCard({ post, currentUserId, onUpvote, onDelete }: PostCardProps) {
  const t = useI18n()
  const locale = useCurrentLocale()
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const hasUpvoted = currentUserId ? post.upvotes.some(u => u.userId === currentUserId) : false
  const isAuthor = currentUserId === post.userId
  const isAnnouncement = post.category === 'ANNOUNCEMENT'

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUserId) {
      toast.error(t('community.signInToUpvote'))
      return
    }

    setIsUpvoting(true)
    try {
      await onUpvote(post.id)
    } finally {
      setIsUpvoting(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthor) return

    setIsDeleting(true)
    try {
      await onDelete?.(post.id)
      toast.success(t('community.postDeleted'))
    } catch (error) {
      toast.error(t('community.deleteError'))
      setIsDeleting(false)
    }
  }'''

content = content.replace(post_orig, post_new)

render_actions_orig = '''<div className="flex items-center gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 rounded-full transition-colors",
                  hasUpvoted
                    ? "text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
                onClick={handleUpvote}
                disabled={isUpvoting}
              >
                <ArrowBigUp className={cn("w-4 h-4 mr-1.5", hasUpvoted && "fill-current")} />
                <span className="font-medium">{post._count.upvotes}</span>
              </Button>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full pointer-events-none">
                <MessageSquare className="w-4 h-4 mr-1.5" />
                <span className="font-medium">{post._count.comments}</span>
              </Button>
            </div>

            {isAuthor && onDelete && (
              <div className="ml-auto">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isDeleting}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('community.deletePostConfirm')}</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('common.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>'''

render_actions_new = '''<PostActions
            post={post}
            hasUpvoted={hasUpvoted}
            isUpvoting={isUpvoting}
            handleUpvote={handleUpvote}
            isAuthor={isAuthor}
            isDeleting={isDeleting}
            handleDelete={handleDelete}
          />'''

content = content.replace(render_actions_orig, render_actions_new)

with open(filepath, 'w') as f:
    f.write(content)
