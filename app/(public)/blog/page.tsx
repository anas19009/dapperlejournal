import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedPosts } from '@/features/posts/queries'
import { PostList } from '@/features/posts/components/PostList'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Essays on Moroccan menswear: tailoring, craft, culture and the ideas behind how men dress. Sourced, and never a styling tip.',
}

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1
  const limit = 12
  const { posts, total } = await getPublishedPosts(page, limit)

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="public-page container mx-auto max-w-6xl space-y-10 px-4 py-12 animate-page">
      
      <div className="public-page-header space-y-3 border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000] md:p-8">
        <p className="inline-block border-2 border-black bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-[0.25em] text-black">Moroccan Dapper / Dispatches</p>
        <h1 className="text-4xl font-bold tracking-tight">All Articles</h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Essays on style, craft and culture, written from Morocco. No trends, no how-to-wear.
        </p>
      </div>

      <PostList posts={posts} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          {page > 1 && (
            <Link
              href={`/blog?page=${page - 1}`}
              className="px-5 py-2 border-2 border-black bg-white text-sm font-medium hover:bg-black hover:text-white transition-colors shadow-[3px_3px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
            >
              ← Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/blog?page=${page + 1}`}
              className="px-5 py-2 border-2 border-black bg-white text-sm font-medium hover:bg-black hover:text-white transition-colors shadow-[3px_3px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
