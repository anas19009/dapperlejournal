import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/service'
import { TagsManager } from './TagsManager'
import { requirePermission } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Tags' }

export default async function TagsPage() {
  await requirePermission('tags:write')

  const supabase = createServiceClient()
  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  return (
    <div className="tags-settings p-4 md:p-8 space-y-6 animate-page">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Label your posts with keywords</p>
      </div>
      <TagsManager tags={tags ?? []} />
    </div>
  )
}
