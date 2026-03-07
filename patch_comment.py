import re

filepath = 'app/[locale]/(landing)/community/components/comment-section.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Refactor CommentComponent to reduce cyclomatic complexity
comment_orig = '''function CommentComponent({
  comment,
  currentUserId,
  onUpvote,
  onReply,
  onDelete,
  depth = 0
}: {
  comment: CommentWithUser
  currentUserId: string | null
  onUpvote: (commentId: string) => Promise<void>
  onReply: (parentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  depth?: number
}) {
  const t = useI18n()
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const hasUpvoted = currentUserId ? comment.upvotes.some((u: any) => u.userId === currentUserId) : false
  const isAuthor = currentUserId === comment.userId

  const handleUpvote = async () => {
    if (!currentUserId) {
      toast.error(t('community.signInToUpvote'))
      return
    }

    setIsUpvoting(true)
    try {
      await onUpvote(comment.id)
    } finally {
      setIsUpvoting(false)
    }
  }

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return

    try {
      await onReply(comment.id, replyContent)
      setIsReplying(false)
      setReplyContent("")
      setShowReplies(true)
      toast.success(t('community.replyAdded'))
    } catch (error) {
      toast.error(t('community.replyError'))
    }
  }

  const handleDelete = async () => {
    if (!isAuthor) return

    setIsDeleting(true)
    try {
      await onDelete(comment.id)
      toast.success(t('community.commentDeleted'))
    } catch (error) {
      toast.error(t('community.deleteError'))
      setIsDeleting(false)
    }
  }'''

comment_new = '''function CommentActions({
  comment,
  currentUserId,
  hasUpvoted,
  isUpvoting,
  handleUpvote,
  isAuthor,
  isDeleting,
  handleDelete,
  isReplying,
  setIsReplying,
  depth
}: any) {
  const t = useI18n()
  return (
    <div className="flex items-center gap-4 mt-2">
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-6 w-6 rounded-full",
            hasUpvoted ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={handleUpvote}
          disabled={isUpvoting || !currentUserId}
        >
          <ArrowBigUp className={cn("w-4 h-4", hasUpvoted && "fill-current")} />
        </Button>
        <span className={cn("text-xs font-medium tabular-nums", hasUpvoted && "text-primary")}>
          {comment._count.upvotes}
        </span>
      </div>

      {depth < 3 && currentUserId && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setIsReplying(!isReplying)}
        >
          <MessageSquare className="w-3 h-3 mr-1.5" />
          {t('community.reply')}
        </Button>
      )}

      {isAuthor && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isDeleting}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('community.deleteCommentConfirm')}</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

function CommentComponent({
  comment,
  currentUserId,
  onUpvote,
  onReply,
  onDelete,
  depth = 0
}: {
  comment: CommentWithUser
  currentUserId: string | null
  onUpvote: (commentId: string) => Promise<void>
  onReply: (parentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  depth?: number
}) {
  const t = useI18n()
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const hasUpvoted = currentUserId ? comment.upvotes.some((u: any) => u.userId === currentUserId) : false
  const isAuthor = currentUserId === comment.userId

  const handleUpvote = async () => {
    if (!currentUserId) {
      toast.error(t('community.signInToUpvote'))
      return
    }

    setIsUpvoting(true)
    try {
      await onUpvote(comment.id)
    } finally {
      setIsUpvoting(false)
    }
  }

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return

    try {
      await onReply(comment.id, replyContent)
      setIsReplying(false)
      setReplyContent("")
      setShowReplies(true)
      toast.success(t('community.replyAdded'))
    } catch (error) {
      toast.error(t('community.replyError'))
    }
  }

  const handleDelete = async () => {
    if (!isAuthor) return

    setIsDeleting(true)
    try {
      await onDelete(comment.id)
      toast.success(t('community.commentDeleted'))
    } catch (error) {
      toast.error(t('community.deleteError'))
      setIsDeleting(false)
    }
  }'''

content = content.replace(comment_orig, comment_new)

render_actions_orig = '''<div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 rounded-full",
                    hasUpvoted ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={handleUpvote}
                  disabled={isUpvoting || !currentUserId}
                >
                  <ArrowBigUp className={cn("w-4 h-4", hasUpvoted && "fill-current")} />
                </Button>
                <span className={cn("text-xs font-medium tabular-nums", hasUpvoted && "text-primary")}>
                  {comment._count.upvotes}
                </span>
              </div>

              {depth < 3 && currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <MessageSquare className="w-3 h-3 mr-1.5" />
                  {t('community.reply')}
                </Button>
              )}

              {isAuthor && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('community.deleteCommentConfirm')}</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {t('common.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>'''

render_actions_new = '''<CommentActions
              comment={comment}
              currentUserId={currentUserId}
              hasUpvoted={hasUpvoted}
              isUpvoting={isUpvoting}
              handleUpvote={handleUpvote}
              isAuthor={isAuthor}
              isDeleting={isDeleting}
              handleDelete={handleDelete}
              isReplying={isReplying}
              setIsReplying={setIsReplying}
              depth={depth}
            />'''

content = content.replace(render_actions_orig, render_actions_new)

with open(filepath, 'w') as f:
    f.write(content)
