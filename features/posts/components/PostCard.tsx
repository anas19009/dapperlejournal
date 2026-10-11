import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PostWithRelations } from '../types'

interface PostCardProps {
  post: PostWithRelations
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="public-post-card overflow-hidden border-2 border-black bg-card shadow-shadow transition-transform duration-200 hover:-translate-y-1 flex flex-col">
      {post.cover_image && (
        <div className="relative h-48 w-full overflow-hidden border-b-2 border-black bg-muted">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover grayscale-[20%] transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        {post.category && (
          <Link href={`/blog/category/${post.category.slug}`}>
            <Badge className="mb-2 w-fit border-2 border-black bg-[hsl(var(--accent))] px-3 text-xs text-black shadow-[2px_2px_0_0_#000]">{post.category.name}</Badge>
          </Link>
        )}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-lg font-semibold leading-snug line-clamp-2 transition-colors hover:text-primary">
            {post.title}
          </h2>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-between gap-4">
        {post.excerpt && (
          <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between border-t-2 border-black pt-3 text-xs text-muted-foreground">
          <span className="font-medium">{post.author?.full_name ?? post.author?.email ?? 'Unknown'}</span>
          {post.published_at && (
            <time dateTime={post.published_at}>
              {format(new Date(post.published_at), 'MMM d, yyyy')}
            </time>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
