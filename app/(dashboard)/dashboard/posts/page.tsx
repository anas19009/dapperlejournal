import Link from 'next/link'
import { PenLine } from 'lucide-react'
import type { Metadata } from 'next'
import { getAllPostsForDashboard } from '@/features/posts/queries'
import { PostTable } from '@/components/dashboard/PostTable'
import { getProfile } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Posts' }

export default async function PostsPage() {
  const profile = await getProfile()
  const posts = await getAllPostsForDashboard(
    profile?.role === 'admin' ? undefined : profile?.id
  )

  return (
    <div className="posts-settings min-h-full space-y-6 bg-white/70 p-4 md:p-8 animate-page">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {posts.length} post{posts.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="posts-new-btn inline-flex h-10 items-center gap-2 px-4 text-sm font-bold transition-all duration-200"
        >
          <PenLine className="icon-on-color h-4 w-4" />
          New Post
        </Link>
      </div>
      <PostTable posts={posts} />
    </div>
  )
}
