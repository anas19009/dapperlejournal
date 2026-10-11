import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/service'
import { getPostById } from '@/features/posts/queries'
import { PostEditor } from '@/components/dashboard/PostEditor'
import { PostStatusBadge } from '@/features/posts/components/PostStatusBadge'

export const metadata: Metadata = { title: 'Edit Post' }

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const supabase = createServiceClient()
  const [post, { data: categories }, { data: tags }] = await Promise.all([
    getPostById(id),
    supabase.from('categories').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
  ])

  if (!post) notFound()

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
        <PostStatusBadge status={post.status} />
      </div>
      <PostEditor post={post} categories={categories ?? []} tags={tags ?? []} />
    </div>
  )
}
