'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import slugify from 'slugify'
import {
  Loader2, Check, ImageIcon, Tag, Settings2, Upload,
  Search, BarChart3, ChevronLeft, ChevronDown, Globe, Send, BookOpen, ExternalLink, ArrowUp, FolderOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Editor } from '@/components/editor/Editor'
import { createPost, updatePost, publishPost, unpublishPost } from '@/features/posts/actions'
import { uploadPostImage } from '@/features/posts/mediaActions'
import type { PostWithRelations, Category, Tag as TagType } from '@/features/posts/types'

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
  cover_image: z.string(),
  category_id: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
  tag_ids: z.array(z.string()),
})

type PostFormValues = z.infer<typeof postSchema>

interface PostEditorProps {
  readonly post?: PostWithRelations
  readonly categories: Category[]
  readonly tags: TagType[]
}

                                                                   
const TAG_PALETTES = [
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', activeBg: 'bg-rose-500', activeText: 'text-white', activeBorder: 'border-rose-500', dot: 'bg-rose-400' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', activeBg: 'bg-violet-500', activeText: 'text-white', activeBorder: 'border-violet-500', dot: 'bg-violet-400' },
  { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', activeBg: 'bg-sky-500', activeText: 'text-white', activeBorder: 'border-sky-500', dot: 'bg-sky-400' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', activeBg: 'bg-emerald-500', activeText: 'text-white', activeBorder: 'border-emerald-500', dot: 'bg-emerald-400' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', activeBg: 'bg-amber-500', activeText: 'text-white', activeBorder: 'border-amber-500', dot: 'bg-amber-400' },
  { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', activeBg: 'bg-pink-500', activeText: 'text-white', activeBorder: 'border-pink-500', dot: 'bg-pink-400' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', activeBg: 'bg-indigo-500', activeText: 'text-white', activeBorder: 'border-indigo-500', dot: 'bg-indigo-400' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', activeBg: 'bg-teal-500', activeText: 'text-white', activeBorder: 'border-teal-500', dot: 'bg-teal-400' },
]

function getTagPalette(index: number) {
  return TAG_PALETTES[index % TAG_PALETTES.length]
}

function CategoryPicker({
  value,
  onChange,
  categories,
}: {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly categories: Category[]
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = categories.find((cat) => cat.id === value)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function choose(nextValue: string) {
    onChange(nextValue)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="editor-category-trigger"
        aria-label="Select category"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected ? 'truncate text-foreground' : 'truncate text-muted-foreground'}>
          {selected?.name ?? 'Select category…'}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="editor-category-menu absolute left-0 right-0 top-[calc(100%+6px)] z-50" role="listbox">
          <button
            type="button"
            className="editor-category-item"
            data-selected={!value}
            onClick={() => choose('')}
          >
            <span className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">No category</span>
          </button>
          {categories.length === 0 ? (
            <div className="px-2 py-3 text-xs text-muted-foreground">No categories created yet.</div>
          ) : categories.map((cat) => {
            const isActive = cat.id === value
            return (
              <button
                key={cat.id}
                type="button"
                className="editor-category-item"
                data-selected={isActive}
                onClick={() => choose(cat.id)}
              >
                {isActive
                  ? <Check className="icon-on-color h-3.5 w-3.5 shrink-0" />
                  : <FolderOpen className="h-3.5 w-3.5 shrink-0" />}
                <span className="flex-1 truncate text-left">{cat.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function PostEditor({ post, categories, tags }: PostEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    function onScroll() {
      setShowBackToTop(window.scrollY > 300)
    }
    const options: AddEventListenerOptions = { passive: true }
    window.addEventListener('scroll', onScroll, options)
    return () => window.removeEventListener('scroll', onScroll, options)
  }, [])

  const isPublished = post?.status === 'published'

  const { register, handleSubmit, control, setValue, watch, getValues, formState: { errors } } =
    useForm<PostFormValues>({
      resolver: zodResolver(postSchema),
      defaultValues: {
        title: post?.title ?? '',
        slug: post?.slug ?? '',
        excerpt: post?.excerpt ?? '',
        content: post?.content ?? '',
        cover_image: post?.cover_image ?? '',
        category_id: post?.category_id ?? '',
        seo_title: post?.seo_title ?? '',
        seo_description: post?.seo_description ?? '',
        tag_ids: post?.tags?.map((t) => t.id) ?? [],
      },
    })

  const title = watch('title')
  const coverImage = watch('cover_image')
  const selectedTagIds = watch('tag_ids')

  function autoSlug() {
    if (!title) return
    setValue('slug', slugify(title, { lower: true, strict: true }))
  }

  function toggleTag(tagId: string) {
    const current = selectedTagIds ?? []
    if (current.includes(tagId)) {
      setValue('tag_ids', current.filter((id) => id !== tagId))
    } else {
      setValue('tag_ids', [...current, tagId])
    }
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    const formData = new FormData()
    formData.set('image', file)
    const result = await uploadPostImage(formData)
    if (result.error) {
      toast.error(result.error)
    } else if (result.url) {
      setValue('cover_image', result.url, { shouldDirty: true })
      toast.success('Cover image uploaded')
    }
    setUploadingCover(false)
    event.target.value = ''
  }

  async function onSubmit(values: PostFormValues) {
    setSaving(true)
    const result = post
      ? await updatePost(post.id, values)
      : await createPost(values)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(post ? 'Draft saved' : 'Post saved as draft')
      if (!post && result.data) {
        router.push(`/dashboard/posts/${result.data.id}/edit`)
      }
    }
    setSaving(false)
  }

  async function handlePublishToggle() {
    if (!post) return
    setPublishing(true)

    if (isPublished) {
      const result = await unpublishPost(post.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Post unpublished')
        router.refresh()
      }
    } else {
                                                     
      const saveResult = await updatePost(post.id, getValues())
      if (saveResult.error) {
        toast.error(saveResult.error)
        setPublishing(false)
        return
      }
      const publishResult = await publishPost(post.id)
      if (publishResult.error) {
        toast.error(publishResult.error)
      } else {
        toast.success('Post saved and published!')
        router.refresh()
      }
    }

    setPublishing(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        
        <div className="sticky top-0 z-20 -mx-4 px-4 md:-mx-8 md:px-8 py-3 mb-6 bg-background/80 backdrop-blur-md border-y-2 border-black flex items-center justify-between gap-4 flex-wrap overflow-visible">
          <button
            type="button"
            onClick={() => router.push('/dashboard/posts')}
            className="editor-back-link flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            All posts
          </button>

          <div className="flex items-center gap-3 pr-1 pb-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/posts')}
              className="text-muted-foreground"
              disabled={saving || publishing}
            >
              Discard
            </Button>

            
            {post && isPublished && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                disabled={saving || publishing}
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View Post
              </Button>
            )}

            
            {post && (
              <Button
                type="submit"
                disabled={saving || publishing}
                size="sm"
                variant="outline"
                className="editor-action-btn px-4 min-w-[110px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                    {isPublished ? 'Save Changes' : 'Save Draft'}
                  </>
                )}
              </Button>
            )}

            
            {post && (
              <Button
                type="button"
                disabled={saving || publishing}
                size="sm"
                onClick={handlePublishToggle}
                className={
                  isPublished
                    ? 'editor-action-btn editor-action-btn-fill bg-primary text-white px-5 min-w-[130px]'
                    : 'editor-action-btn editor-action-btn-fill bg-secondary text-white px-5 min-w-[130px]'
                }
              >
                {publishing ? (
                  <>
                    <Loader2 className="icon-on-color mr-1.5 h-3.5 w-3.5 animate-spin text-white" />
                    {isPublished ? 'Unpublishing…' : 'Publishing…'}
                  </>
                ) : (
                  <>
                    <Send className="icon-on-color mr-1.5 h-3.5 w-3.5 text-white" />
                    {isPublished ? 'Unpublish' : 'Publish'}
                  </>
                )}
              </Button>
            )}

            
            {!post && (
              <Button
                type="submit"
                disabled={saving}
                size="sm"
                className="editor-action-btn editor-action-btn-fill bg-secondary text-white px-5 min-w-[130px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="icon-on-color mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Send className="icon-on-color mr-1.5 h-3.5 w-3.5 text-white" />
                    Create Post
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        
        <div className="grid gap-8 lg:grid-cols-[1fr_292px]">

          
          <div className="space-y-5 min-w-0">

            
            <div className="editor-identity-card">
              <input
                {...register('title')}
                onBlur={autoSlug}
                placeholder="Post title…"
                className="editor-title-field !mt-0 w-full border-0 bg-transparent text-3xl font-bold leading-tight tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40"
              />
              <div className="editor-slug-row">
                <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground shrink-0">slug /</span>
                <input
                  {...register('slug')}
                  placeholder="auto-generated-from-title"
                  className="editor-slug-field !mt-0 flex-1 border-0 bg-transparent font-mono text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/40"
                  onChange={(e) => {
                    const formatted = slugify(e.target.value, { lower: true, strict: true })
                    setValue('slug', formatted)
                  }}
                />
              </div>
            </div>
            {errors.title && (
              <p className="text-xs text-destructive pl-0.5">{errors.title.message}</p>
            )}

            
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Excerpt
              </Label>
              <div className="editor-section-card">
                <Textarea
                  {...register('excerpt')}
                  placeholder="A short summary displayed in post listings and meta descriptions…"
                  rows={3}
                  className="resize-none border-0 !shadow-none text-sm leading-relaxed placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Content
              </Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Editor value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </div>

          
          <div className="space-y-4">

            
            <SidebarCard icon={Settings2} title="Settings">
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Cover Image</Label>
                {coverImage && (
                  <div className="relative rounded-lg overflow-hidden aspect-video bg-muted mb-2">
                    
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                )}
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <Input
                    {...register('cover_image')}
                    placeholder="https://…"
                    className="editor-field pl-9 text-sm h-9"
                  />
                </div>
                <label className="editor-upload-image-btn inline-flex w-full cursor-pointer items-center justify-center gap-2 border-2 border-black bg-secondary px-3 py-2 text-xs font-semibold text-white shadow-[3px_3px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                  {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {uploadingCover ? 'Uploading…' : 'Upload to Cloudinary'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                  />
                </label>
              </div>

              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <CategoryPicker
                      value={field.value}
                      onChange={field.onChange}
                      categories={categories}
                    />
                  )}
                />
              </div>
            </SidebarCard>

            
            <SidebarCard icon={Tag} title="Tags">
              {tags.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 italic">No tags created yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => {
                    const palette = getTagPalette(i)
                    const isSelected = selectedTagIds?.includes(tag.id)

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={[
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 select-none cursor-pointer',
                          isSelected
                            ? 'border-2 border-black bg-secondary text-white shadow-[2px_2px_0_0_#000] scale-[1.03]'
                            : 'border-2 border-black bg-accent text-black hover:scale-[1.03] hover:shadow-[2px_2px_0_0_#000]',
                        ].join(' ')}
                      >
                        {isSelected
                          ? <Check className="h-3 w-3 shrink-0" />
                          : <span className="h-1.5 w-1.5 shrink-0 bg-black" />
                        }
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              )}

              {selectedTagIds && selectedTagIds.length > 0 && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {selectedTagIds.length} tag{selectedTagIds.length === 1 ? '' : 's'} selected
                </p>
              )}
            </SidebarCard>

            
            <SidebarCard icon={BarChart3} title="SEO">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Meta Title</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                  <Input
                    {...register('seo_title')}
                    placeholder="Overrides post title in search…"
                    className="editor-field pl-9 text-sm h-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Meta Description</Label>
                <Textarea
                  {...register('seo_description')}
                  placeholder="Concise summary for search results…"
                  rows={3}
                  className="editor-field resize-none text-sm leading-relaxed placeholder:text-muted-foreground/40"
                />
              </div>
            </SidebarCard>
          </div>
        </div>
      </form>
      {showBackToTop && (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="fixed bottom-6 right-6 z-50 shadow-shadow"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </>
  )
}

                                                                                  
function SidebarCard({
  icon: Icon,
  title,
  children,
}: {
  readonly icon: React.ElementType
  readonly title: string
  readonly children: React.ReactNode
}) {
  return (
    <div className="editor-sidebar-card bg-white">
      <div className="flex items-center gap-2 border-b-2 border-black bg-muted/20 px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center border-2 border-black bg-secondary shadow-[2px_2px_0_0_#000]">
          <Icon className="icon-on-color h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          {title}
        </span>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  )
}
