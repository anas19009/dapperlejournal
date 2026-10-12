import Image from 'next/image'
import Link from 'next/link'
import { Instagram, Mail } from 'lucide-react'
import { NavAuthButton } from '@/components/NavAuthButton'
import { HeaderSearch } from '@/components/HeaderSearch'
import { Toaster } from 'sonner'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name')

  return (
    <div className="public-shell min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b-2 border-black bg-background">
        <div className="public-main-header container relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:gap-4">
          <Link href="/" className="public-header-mark group flex min-w-0 items-center gap-2.5">
            <div className="relative h-10 w-10 overflow-hidden border-2 border-black bg-white shadow-[2px_2px_0_0_#000]">
              <Image src="/logo.png" alt="Moroccan Dapper logo" width={40} height={40} className="h-full w-full object-contain p-1" />
            </div>
            <span className="public-header-brand brand-name text-base text-foreground sm:text-lg">Moroccan Dapper</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/blog"
              className="hidden border-2 border-transparent px-3 py-1.5 text-sm font-semibold text-foreground hover:border-black hover:bg-white md:inline-flex"
            >
              Articles
            </Link>
            <HeaderSearch />
            <NavAuthButton />
          </nav>
        </div>
        <nav className="public-category-nav border-t border-black/10" aria-label="Blog categories">
          <div className="container mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2.5 sm:justify-center sm:gap-2">
            <Link href="/blog" className="public-category-link public-category-all shrink-0">Latest</Link>
            {(categories ?? []).filter((category) => category.slug !== 'latest').map((category) => (
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
      <main className="flex-1">{children}</main>
      <Toaster richColors />
      <footer className="border-t-2 border-black bg-white">
        <div className="container mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="brand-name text-base text-foreground">Moroccan Dapper</p>
            <p className="mt-1 text-xs text-muted-foreground">Style notes, culture, and dispatches.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
            <Link href="/" className="border-2 border-black bg-white px-3 py-1 shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Home</Link>
            <Link href="/blog" className="border-2 border-black bg-accent px-3 py-1 shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">Articles</Link>
            <Link href="https://www.instagram.com/moroccandapper" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
              <Instagram className="h-4 w-4" />
              Instagram
            </Link>
            <a href="mailto:moroccandapper@gmail.com" className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
              <Mail className="h-4 w-4" />
              moroccandapper@gmail.com
            </a>
          </div>
        </div>
        <div className="border-t-2 border-black bg-muted/40 py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Moroccan Dapper. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
