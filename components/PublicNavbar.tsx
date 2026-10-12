'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { NavAuthButton } from '@/components/NavAuthButton'
import { HeaderSearch } from '@/components/HeaderSearch'

type Category = { name: string; slug: string }

export function PublicNavbar({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-background">
      <div className="public-main-header container relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:gap-4">
        <Link href="/" className="public-header-mark group flex min-w-0 items-center gap-2.5">
          <div className="relative h-10 w-10 overflow-hidden border-2 border-black bg-white shadow-[2px_2px_0_0_#000]">
            <Image src="/logo.png" alt="Moroccan Dapper logo" width={40} height={40} className="h-full w-full object-contain p-1" />
          </div>
          <span className="public-header-brand brand-name text-base text-foreground sm:text-lg">Moroccan Dapper</span>
        </Link>

        <nav className="public-desktop-nav ml-auto hidden items-center gap-2 sm:gap-3 lg:flex">
          <Link
            href="/blog"
            className="inline-flex border-2 border-transparent px-3 py-1.5 text-sm font-semibold text-foreground hover:border-black hover:bg-white"
          >
            Articles
          </Link>
          <HeaderSearch />
          <NavAuthButton />
        </nav>

        <button
          type="button"
          className="public-nav-toggle ml-auto inline-flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-foreground shadow-[2px_2px_0_0_#000] lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="public-mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="public-mobile-nav"
          className="public-mobile-nav border-t-2 border-black bg-background lg:hidden"
        >
          <div className="container mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
            <Link
              href="/blog"
              className="inline-flex w-full items-center justify-center border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-foreground shadow-[2px_2px_0_0_#000]"
            >
              Articles
            </Link>
            <HeaderSearch />
            <NavAuthButton />
          </div>
        </div>
      )}

      <nav className="public-category-nav border-t border-black/10" aria-label="Blog categories">
        <div className="container mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2.5 sm:justify-center sm:gap-2">
          <Link href="/blog" className="public-category-link public-category-all shrink-0">Latest</Link>
          {categories.filter((category) => category.slug !== 'latest').map((category) => (
            <Link
              key={category.slug}
              href={`/blog/category/${category.slug}`}
              className="public-category-link shrink-0"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
