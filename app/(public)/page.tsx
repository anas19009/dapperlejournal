import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { getPublishedPosts, getPopularTags } from '@/features/posts/queries'
import { PostList } from '@/features/posts/components/PostList'
import { SubscribeBlock } from './SubscribeBlock'
import { readTime } from '@/lib/utils'
import type { PostWithRelations } from '@/features/posts/types'
import type { TagWithCount } from '@/features/posts/queries'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Moroccan Dapper is an independent journal on Moroccan menswear: tailoring, craft, culture and the people behind the clothes.',
}

export const revalidate = 60

interface HomePageProps {
  searchParams: Promise<{ code?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  if (params.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}`)
  }

  let posts: PostWithRelations[] = []
  let popularTags: TagWithCount[] = []
  try {
    const [postsResult, tagsResult] = await Promise.all([
      getPublishedPosts(1, 7),
      getPopularTags(10),
    ])
    posts = postsResult.posts
    popularTags = tagsResult
  } catch (error) {
    console.error('[home] Failed to load posts', error)
  }

  const featured = posts[0]
  const latest = posts.slice(1, 7)

  return (
    <div className="public-page animate-page">
      <section className="border-b-2 border-black bg-white">
        <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:items-end md:py-16">
          <div>
            <p className="mb-3 inline-block border-2 border-black bg-accent px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-black shadow-[3px_3px_0_0_#000]">
              Moroccan Dapper
            </p>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Cut. Cloth. Culture.
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground">
              Sharp writing on style, craft, and the Moroccan eye — published with a hard black frame and no fluff.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex h-11 items-center gap-2 border-2 border-black bg-primary px-5 text-sm font-bold text-white shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <BookOpen className="h-4 w-4" />
                Read articles
              </Link>
              <Link
                href="/register"
                className="inline-flex h-11 items-center gap-2 border-2 border-black bg-white px-5 text-sm font-bold shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                Join the desk
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="public-feature-card border-2 border-black bg-secondary p-5 text-white shadow-[6px_6px_0_0_#000]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">This week</p>
            <p className="mt-3 text-2xl font-bold leading-tight">
              {featured ? featured.title : 'New dispatches are on the way.'}
            </p>
            <p className="mt-2 text-sm text-white/80">
              {featured
                ? `${readTime(featured.content ?? '')} min read · ${featured.author?.full_name ?? 'Editorial'}`
                : 'Check back soon for the next piece.'}
            </p>
          </div>
        </div>
      </section>

      {featured && (
        <section className="container mx-auto max-w-6xl px-4 py-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight">Featured</h2>
            <Link href="/blog" className="text-sm font-semibold underline underline-offset-4">
              All articles
            </Link>
          </div>
          <Link
            href={`/blog/${featured.slug}`}
            className="public-featured-article group grid overflow-hidden border-2 border-black bg-white shadow-[6px_6px_0_0_#000] md:grid-cols-[1.3fr_1fr]"
          >
            {featured.cover_image ? (
              <div className="relative min-h-56 border-b-2 border-black md:min-h-80 md:border-b-0 md:border-r-2">
                <Image src={featured.cover_image} alt={featured.title} fill className="object-cover" priority />
              </div>
            ) : (
              <div className="flex min-h-56 items-center justify-center border-b-2 border-black bg-accent md:min-h-80 md:border-b-0 md:border-r-2">
                <Sparkles className="h-10 w-10 text-black" />
              </div>
            )}
            <div className="flex flex-col justify-between p-6 md:p-8">
              {featured.category && (
                <span className="mb-3 w-fit border-2 border-black bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest">
                  {featured.category.name}
                </span>
              )}
              <h3 className="text-2xl font-bold leading-tight group-hover:text-primary md:text-3xl">
                {featured.title}
              </h3>
              {featured.excerpt && (
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{featured.excerpt}</p>
              )}
              <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {featured.published_at ? format(new Date(featured.published_at), 'MMM d, yyyy') : 'New'}
                {' · '}
                {readTime(featured.content ?? '')} min read
              </p>
            </div>
          </Link>
        </section>
      )}

      {popularTags.length > 0 && (
        <section className="border-y-2 border-black bg-white">
          <div className="container mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-5">
            <span className="mr-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Topics</span>
            {popularTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className="border-2 border-black bg-white px-3 py-1 text-xs font-bold shadow-[2px_2px_0_0_#000] hover:bg-secondary hover:text-white"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-6 text-xl font-bold tracking-tight">Latest articles</h2>
        <PostList posts={latest} />
      </section>

      <section className="border-t-2 border-black bg-white px-4 py-4">
        <SubscribeBlock />
      </section>
    </div>
  )
}
