                                               
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DeleteCommentButton } from './DeleteCommentButton'
import type { CommentWithAuthor } from '../types'
import type { Role } from '@/lib/permissions'

interface CommentCardProps {
  comment: CommentWithAuthor
  currentProfileId: string | null
  currentProfileRole: Role | null
  postSlug: string
}

export function CommentCard({ comment, currentProfileId, currentProfileRole, postSlug }: CommentCardProps) {
  const initials = comment.author?.full_name
    ? comment.author.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const canDelete =
    currentProfileRole === 'admin' ||
    (currentProfileId != null && currentProfileId === comment.author_id)
  return (
    <div className="flex gap-3 border-b-2 border-black py-5 last:border-0">
      <Avatar className="h-9 w-9 shrink-0 rounded-none">
        {comment.author?.avatar_url && <AvatarImage src={comment.author.avatar_url} alt={`${comment.author.full_name ?? 'Author'} avatar`} className="rounded-none object-cover" />}
        <AvatarFallback className="rounded-none border-2 border-black bg-secondary text-xs font-bold text-white">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-sm text-foreground">
            {comment.author?.full_name ?? 'Unknown'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
          {canDelete && (
            <div className="ml-auto">
              <DeleteCommentButton commentId={comment.id} postSlug={postSlug} />
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
      </div>
    </div>
  )
}
