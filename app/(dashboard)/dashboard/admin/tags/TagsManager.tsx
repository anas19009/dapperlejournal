'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { X, Tag, Plus, Loader2, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTag, deleteTag } from '@/features/users/categoryActions'
import { useTaxonomyStore } from '@/lib/store/taxonomy'
import type { Tag as TagType } from '@/lib/supabase/types'

interface TagsManagerProps {
  tags: TagType[]
}

export function TagsManager({ tags: initial }: TagsManagerProps) {
  const { tags, setTags, addTagOptimistic, commitTag, rollbackTag, removeTagOptimistic } =
    useTaxonomyStore()

                             
  const seeded = useRef(false)
  useEffect(() => {
    if (!seeded.current) {
      setTags(initial)
      seeded.current = true
    }
  }, [initial, setTags])

  const formRef = useRef<HTMLFormElement>(null)

  async function handleCreate(formData: FormData) {
    const name = (formData.get('name') as string).trim()
    if (!name) return

    const tempId = `optimistic-${crypto.randomUUID()}`
    addTagOptimistic(tempId, name)
    formRef.current?.reset()

    const result = await createTag(formData)

    if (result.error) {
      rollbackTag(tempId)
      toast.error(result.error)
    } else {
      commitTag(tempId, result.tag!)
      toast.success('Tag created')
    }
  }

  async function handleDelete(id: string, name: string) {
    const rollback = removeTagOptimistic(id)
    const result = await deleteTag(id)
    if (result.error) {
      rollback()
      toast.error(result.error)
    } else {
      toast.success(`Tag "${name}" deleted`)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr] items-start">
      
      <div className="tags-panel border-2 border-black bg-white p-5 shadow-shadow">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-secondary shadow-[3px_3px_0_0_#000]">
            <Plus className="icon-on-color h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">New Tag</h2>
            <p className="text-xs text-muted-foreground">Label posts with topics or keywords</p>
          </div>
        </div>
        <form ref={formRef} action={handleCreate} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-medium">
              Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <Input id="name" name="name" required placeholder="e.g. JavaScript" className="pl-8 h-8 text-sm" />
            </div>
          </div>
          <Button type="submit" size="sm" variant="secondary" className="tags-primary-btn w-full">
            <Plus className="h-3.5 w-3.5 mr-1.5" />Add Tag
          </Button>
        </form>
      </div>

      
      <div className="tags-panel border-2 border-black bg-white p-5 shadow-shadow">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-primary shadow-[3px_3px_0_0_#000]">
            <Tag className="icon-on-color h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Existing Tags</h2>
            <p className="text-xs text-muted-foreground">{tags.length} tag{tags.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Tag className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm text-muted-foreground">No tags yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isOptimistic = tag.id.startsWith('optimistic-')
              return (
                <span
                  key={tag.id}
                  className={`group inline-flex items-center gap-1.5 border-2 border-black bg-accent px-3 py-1.5 text-xs font-bold text-black shadow-[2px_2px_0_0_#000] transition-colors duration-150 ${
                    isOptimistic
                      ? 'opacity-70'
                      : 'hover:bg-secondary hover:text-white'
                  }`}
                >
                  {isOptimistic ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Hash className="h-3 w-3 text-black" />
                  )}
                  {tag.name}
                  {!isOptimistic && (
                    <button
                      onClick={() => handleDelete(tag.id, tag.name)}
                      aria-label={`Delete tag ${tag.name}`}
                      className="ml-0.5 flex h-4 w-4 items-center justify-center border border-black bg-white text-black transition-colors duration-150 hover:bg-primary hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
