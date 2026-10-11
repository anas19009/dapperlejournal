import Link from 'next/link'
import { FileText, Plus } from 'lucide-react'

export function PostEmptyState() {
  return (
    <div className="posts-empty-state flex flex-col items-center justify-center border-2 border-black bg-white py-20 text-center shadow-shadow">
      <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-black bg-accent">
        <FileText className="h-8 w-8 text-black" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">No posts yet</h3>
      <p className="text-sm text-muted-foreground mb-6">Create your first post to get started.</p>
      <Link
        href="/dashboard/posts/new"
        className="posts-new-btn inline-flex h-9 items-center gap-2 border-2 border-black bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
      >
        <Plus className="h-4 w-4" />
        Create Post
      </Link>
    </div>
  )
}
