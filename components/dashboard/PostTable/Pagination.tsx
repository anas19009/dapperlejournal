'use client'

import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { PAGE_SIZE_OPTIONS, buildPageNumbers } from './utils'

interface PaginationProps {
  totalFiltered: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function PostTablePagination({
  totalFiltered,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const pageNumbers = buildPageNumbers(totalPages, currentPage)

  const rangeStart = (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, totalFiltered)
  const countLabel = totalFiltered === 0
    ? 'No posts'
    : `Showing ${rangeStart}–${rangeEnd} of ${totalFiltered} post${totalFiltered !== 1 ? 's' : ''}`

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
      <p className="text-xs text-muted-foreground">{countLabel}</p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center border-2 border-black bg-white transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageNumbers.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="text-xs text-muted-foreground px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center border-2 text-xs font-bold transition-colors',
                currentPage === p
                  ? 'border-black bg-primary text-primary-foreground shadow-[2px_2px_0_0_#000]'
                  : 'border-black bg-white text-foreground hover:bg-muted'
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center border-2 border-black bg-white transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 cursor-pointer items-center gap-1.5 border-2 border-black bg-white px-2.5 text-xs text-foreground transition-colors hover:bg-muted">
          {pageSize} / page
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuSeparator />
          {PAGE_SIZE_OPTIONS.map(size => (
            <DropdownMenuItem
              key={size}
              onClick={() => onPageSizeChange(size)}
              className={cn(pageSize === size && 'font-bold text-primary')}
            >
              {size} per page
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
