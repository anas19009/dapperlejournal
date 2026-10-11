import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/service'
import { PostEditor } from '@/components/dashboard/PostEditor'

export const metadata: Metadata = { title: 'Create Post' }

export default async function NewPostPage() {
  const supabase = createServiceClient()
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
  ])

  return (
    <div className="p-4 md:p-8 pb-16 animate-page space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Post</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Write a new article and save it as a draft
        </p>
      </div>
      <PostEditor categories={categories ?? []} tags={tags ?? []} />
    </div>
  )
}
