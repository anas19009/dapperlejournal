'use client'

import { Search, X, ChevronDown, FolderOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  search: string
  onSearch: (val: string) => void
  categories: { id: string; name: string }[]
  categoryFilter: string | null
  onCategoryFilter: (id: string | null) => void
  hasFilters: boolean
  onClearFilters: () => void
}

export function PostTableToolbar({
  search,
  onSearch,
  categories,
  categoryFilter,
  onCategoryFilter,
  hasFilters,
  onClearFilters,
}: ToolbarProps) {
  const selectedCategoryName = categories.find(c => c.id === categoryFilter)?.name

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[180px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search posts..."
          className="posts-search pl-9 h-9 text-sm"
        />
        {search && (
          <button
            onClick={() => onSearch('')}
            aria-label="Clear search"
            className="posts-clear-search absolute right-2 top-1/2 -translate-y-1/2 border-2 border-transparent p-0.5 text-muted-foreground hover:border-black hover:bg-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            'posts-category-trigger inline-flex h-9 cursor-pointer items-center gap-1.5 border-2 px-3 text-sm transition-colors',
            categoryFilter
              ? 'border-black bg-accent text-black shadow-[2px_2px_0_0_#000]'
              : 'border-black bg-white text-foreground shadow-[3px_3px_0_0_#000] hover:bg-muted'
          )}>
            <FolderOpen className="h-3.5 w-3.5" />
            {selectedCategoryName ?? 'Category'}
            <ChevronDown className="h-3.5 w-3.5 ml-0.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="posts-menu w-44">
            <DropdownMenuItem onClick={() => onCategoryFilter(null)}>
              All categories
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {categories.map(cat => (
              <DropdownMenuItem
                key={cat.id}
                onClick={() => onCategoryFilter(cat.id)}
                className={cn(categoryFilter === cat.id && 'font-bold text-primary')}
              >
                {cat.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="posts-clear-filters inline-flex h-9 items-center gap-1.5 border-2 border-black bg-white px-3 text-sm text-foreground transition-colors hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  )
}
