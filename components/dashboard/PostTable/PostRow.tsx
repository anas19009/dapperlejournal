'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { PostWithRelations } from '@/features/posts/types'

interface PostRowProps {
  post: PostWithRelations
  onPublish: (id: string) => void
  onUnpublish: (id: string) => void
  onDelete: (id: string, title: string) => void
}

export function PostRow({ post, onPublish, onUnpublish, onDelete }: PostRowProps) {
  const router = useRouter()
  const authorName = post.author?.full_name ?? post.author?.email ?? '—'
  const authorInitial = authorName[0]?.toUpperCase() ?? '?'

  return (
    <tr className="posts-table-row group transition-colors duration-150 hover:bg-accent/20">
      <td className="px-7 py-5">
        <div className="pl-2">
          <div className="flex items-center flex-wrap gap-1.5">
            <Link
              href={`/dashboard/posts/${post.id}/edit`}
              className="block max-w-[38rem] pr-6 font-semibold leading-6 text-foreground transition-colors hover:text-primary"
            >
              {post.title}
            </Link>
            {post.category && (
                <span className="inline-flex items-center border-2 border-black bg-accent px-1.5 py-0.5 text-[10px] font-bold text-black shadow-[2px_2px_0_0_#000]">
                {post.category.name}
              </span>
            )}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {post.tags.map(tag => (
                <span key={tag.id} className="inline-flex items-center border-2 border-black bg-white px-1.5 py-0.5 text-[10px] font-medium text-black">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          {post.excerpt && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{post.excerpt}</p>
          )}
        </div>
      </td>

      <td className="hidden px-7 py-5 md:table-cell">
        <div className="flex items-center gap-2">
          {post.author?.avatar_url ? (
                                                                 
            <img
              src={post.author.avatar_url}
              alt={`${authorName} avatar`}
              className="h-7 w-7 shrink-0 rounded-none border-2 border-black object-cover shadow-[2px_2px_0_0_#000]"
            />
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-black bg-secondary text-[10px] font-bold text-white shadow-[2px_2px_0_0_#000]">
              {authorInitial}
            </div>
          )}
          <span className="text-sm text-muted-foreground">{authorName}</span>
        </div>
      </td>

      <td className="hidden px-7 py-5 sm:table-cell">
        {post.status === 'published' ? (
          <span className="inline-flex items-center gap-1.5 border-2 border-black bg-secondary px-2.5 py-1 text-xs font-bold text-white shadow-[2px_2px_0_0_#000]">
            <span className="h-1.5 w-1.5 border border-black bg-white" />
            Published
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 border-2 border-black bg-accent px-2.5 py-1 text-xs font-bold text-black">
            <span className="h-1.5 w-1.5 bg-black" />
            Draft
          </span>
        )}
      </td>

      <td className="hidden px-7 py-5 text-sm text-muted-foreground lg:table-cell">
        {post.updated_at ? format(new Date(post.updated_at), 'MMM d, yyyy') : '—'}
      </td>

      <td className="px-7 py-5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Post actions" className="posts-actions-trigger inline-flex h-8 w-8 items-center justify-center border-2 border-transparent opacity-60 transition-colors hover:border-black hover:bg-white group-hover:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="posts-menu w-44 border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
            <DropdownMenuItem className="text-black hover:bg-accent focus:bg-accent" onClick={() => router.push(`/dashboard/posts/${post.id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit post
            </DropdownMenuItem>
            {post.status === 'draft' ? (
              <DropdownMenuItem className="text-black hover:bg-accent focus:bg-accent" onClick={() => onPublish(post.id)}>
                <Eye className="h-4 w-4 mr-2" /> Publish
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-black hover:bg-accent focus:bg-accent" onClick={() => onUnpublish(post.id)}>
                <EyeOff className="h-4 w-4 mr-2" /> Unpublish
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="border-2 border-black bg-accent font-bold text-black hover:bg-primary hover:text-white focus:bg-primary focus:text-white"
              onClick={() => onDelete(post.id, post.title)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
