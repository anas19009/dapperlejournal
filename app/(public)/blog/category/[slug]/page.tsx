import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPostsByCategory } from '@/features/posts/queries'
import { PostList } from '@/features/posts/components/PostList'

export const revalidate = 60

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { createStaticClient } = await import('@/lib/supabase/static')
  const supabase = createStaticClient()
  if (!supabase) return []
  const { data } = await supabase.from('categories').select('slug')
  return ((data ?? []) as { slug: string }[]).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) return {}
  return {
    title: `${category.name} - Blog`,
    description: category.description ?? `Posts in ${category.name}`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { posts } = await getPostsByCategory(slug, 1, 100)

  return (
    <div className="public-page container mx-auto max-w-6xl space-y-10 px-4 py-12 animate-page">
      <div className="public-page-header space-y-2 border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
        <Link
          href="/blog"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          ← Back to Blog
        </Link>
        <p className="inline-block border-2 ml-2 border-black bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-black">Category</p>
        <h1 className="text-4xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="max-w-xl text-base text-muted-foreground">{category.description}</p>
        )}
      </div>
      <PostList posts={posts} />
    </div>
  )
}
