import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PostList } from '@/features/posts/components/PostList'
import type { PostWithRelations } from '@/features/posts/types'

export const revalidate = 60

interface TagPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { createStaticClient } = await import('@/lib/supabase/static')
  const supabase = createStaticClient()
  if (!supabase) return []
  const { data } = await supabase.from('tags').select('slug')
  return ((data ?? []) as { slug: string }[]).map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!tag) return {}
  return {
    title: `#${tag.name} - Blog`,
    description: `Posts tagged with ${tag.name}`,
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!tag) notFound()

  const { data: postTagsData } = await supabase
    .from('post_tags')
    .select(`
      post:posts!post_tags_post_id_fkey(
        *,
        author:profiles!posts_author_id_fkey(id, full_name, email, avatar_url),
        category:categories(id, name, slug),
        tags:post_tags(tag:tags(id, name, slug))
      )
    `)
    .eq('tag_id', tag.id)

  type AnyRow = Record<string, unknown>
  const posts = ((postTagsData ?? []) as AnyRow[])
    .map((pt) => pt.post as PostWithRelations)
    .filter(Boolean)
    .filter((p) => p.status === 'published')
    .map((p) => ({
      ...p,
      tags: ((p.tags ?? []) as AnyRow[]).map((pt) => pt.tag).filter(Boolean),
    })) as PostWithRelations[]

  return (
    <div className="container mx-auto max-w-6xl space-y-10 px-4 py-12 animate-page">
      <div className="space-y-2 border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
        <Link
          href="/blog"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          ← Back to Blog
        </Link>
        <p className="inline-block border-2 border-black bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-black">Tag</p>
        <h1 className="text-4xl font-bold tracking-tight">#{tag.name}</h1>
      </div>
      <PostList posts={posts} />
    </div>
  )
}
