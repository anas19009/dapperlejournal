'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { publishPost, unpublishPost, deletePost } from '@/features/posts/actions'
import type { PostWithRelations } from '@/features/posts/types'
import { filterAndSort, getCategories, type SortField, type SortDir } from './utils'
import { PostEmptyState } from './EmptyState'
import { PostTableToolbar } from './Toolbar'
import { PostRow } from './PostRow'
import { PostTablePagination } from './Pagination'

interface PostTableProps {
  posts: PostWithRelations[]
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="ml-1 h-3 w-3 text-muted-foreground" />
  return sortDir === 'asc'
    ? <ChevronUp className="ml-1 h-3 w-3 text-primary" />
    : <ChevronDown className="ml-1 h-3 w-3 text-primary" />
}

export function PostTable({ posts }: PostTableProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('updated_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const categories = useMemo(() => getCategories(posts), [posts])
  const filtered = useMemo(
    () => filterAndSort(posts, search, categoryFilter, sortField, sortDir),
    [posts, search, categoryFilter, sortField, sortDir]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const hasFilters = search.trim() !== '' || categoryFilter !== null

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  function handleSearch(val: string) { setSearch(val); setPage(1) }
  function handleCategoryFilter(id: string | null) { setCategoryFilter(id); setPage(1) }
  function handleClearFilters() { setSearch(''); setCategoryFilter(null); setPage(1) }
  function handlePageSizeChange(size: number) { setPageSize(size); setPage(1) }

  async function handlePublish(id: string) {
    const result = await publishPost(id)
    result.error ? toast.error(result.error) : toast.success('Post published')
  }

  async function handleUnpublish(id: string) {
    const result = await unpublishPost(id)
    result.error ? toast.error(result.error) : toast.success('Post unpublished')
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      const result = await deletePost(id)
      if (result?.error) {
        toast.error(result.error)
      }
    } catch {
    }
  }

  if (posts.length === 0) return <PostEmptyState />

  const thClass = 'table-sort-button inline-flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground'

  return (
    <div className="space-y-3">
      <PostTableToolbar
        search={search}
        onSearch={handleSearch}
        categories={categories}
        categoryFilter={categoryFilter}
        onCategoryFilter={handleCategoryFilter}
        hasFilters={hasFilters}
        onClearFilters={handleClearFilters}
      />

      <div className="posts-table-card post-table-card overflow-hidden border-2 border-black bg-card shadow-[4px_4px_0_0_#000]">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No posts found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="post-table w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black bg-muted/50">
                  <th className="px-6 py-3.5 text-left">
                    <button className={thClass} onClick={() => handleSort('title')}>
                      Title <SortIcon field="title" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="hidden px-6 py-3.5 text-left md:table-cell">
                    <button className={thClass} onClick={() => handleSort('author')}>
                      Author <SortIcon field="author" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="hidden px-6 py-3.5 text-left sm:table-cell">
                    <button className={thClass} onClick={() => handleSort('status')}>
                      Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="hidden px-6 py-3.5 text-left lg:table-cell">
                    <button className={thClass} onClick={() => handleSort('updated_at')}>
                      Updated <SortIcon field="updated_at" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(post => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onPublish={handlePublish}
                    onUnpublish={handleUnpublish}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PostTablePagination
        totalFiltered={filtered.length}
        currentPage={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
