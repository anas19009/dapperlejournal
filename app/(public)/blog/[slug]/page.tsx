import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import { getPostBySlug, getAllPublishedSlugs } from '@/features/posts/queries'
import { EditorContent } from '@/components/editor/EditorContent'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BackToTopButton } from '@/components/BackToTopButton'
import { CommentSection } from '@/features/comments/components/CommentSection'
import { ShareButton } from '@/components/ShareButton'
import { ChevronLeftIcon } from 'lucide-react'
import { SubscribeForm } from '@/components/newsletter/SubscribeForm'

export const revalidate = 3600

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || '',
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || '',
      images: post.cover_image ? [post.cover_image] : [],
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      authors: post.author?.full_name ? [post.author.full_name] : undefined,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const initials = post.author?.full_name
    ? post.author.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : post.author?.email?.[0]?.toUpperCase() ?? '?'

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? post.seo_description ?? '',
    image: post.cover_image ? [post.cover_image] : [],
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: post.author?.full_name
      ? [{ '@type': 'Person', name: post.author.full_name }]
      : [],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-full bg-background">
        <article className="mx-auto min-h-[calc(100vh-12rem)] max-w-3xl bg-white px-5 py-12 sm:border-x-2 sm:border-black sm:px-10">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 border-2 border-transparent px-2 py-1 text-sm text-muted-foreground hover:border-black hover:bg-white hover:text-foreground"
          >
            <ChevronLeftIcon className="size-3.5" aria-hidden="true" />
            Back to Blog
          </Link>
          {post.category && (
            <Link href={`/blog/category/${post.category.slug}`}>
              <Badge className="px-3 text-xs">{post.category.name}</Badge>
            </Link>
          )}
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight">{post.title}</h1>

        <div className="mb-8 flex items-center gap-3 border-2 border-black bg-white p-3 text-sm text-muted-foreground shadow-[3px_3px_0_0_#000]">
          <Avatar className="h-8 w-8 rounded-none">
            <AvatarFallback className="rounded-none border-2 border-black bg-secondary text-xs font-bold text-white">{initials}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground">{post.author?.full_name ?? post.author?.email}</span>
          {post.published_at && (
            <>
              <span>·</span>
              <time dateTime={post.published_at}>
                {format(new Date(post.published_at), 'MMMM d, yyyy')}
              </time>
            </>
          )}
          <div className="ml-auto">
            <ShareButton
              url={`${baseUrl}/blog/${post.slug}`}
              title={post.title}
            />
          </div>
        </div>

        {post.cover_image && (
          <div className="relative mb-8 h-64 overflow-hidden border-2 border-black shadow-[4px_4px_0_0_#000] sm:h-80 lg:h-96">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {post.excerpt && (
          <p className="mb-8 border-l-4 border-black bg-accent/40 py-3 pl-4 italic text-lg text-foreground">
            {post.excerpt}
          </p>
        )}

        <EditorContent content={post.content ?? ''} />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                <Badge variant="secondary" className="px-3 text-xs">#{tag.name}</Badge>
              </Link>
            ))}
          </div>
        )}

        <SubscribeForm />

        <CommentSection postId={post.id} postSlug={post.slug} />
        </article>
      </div>
      <BackToTopButton />
    </>
  )
}
