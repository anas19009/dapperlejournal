import Link from 'next/link'
import { Instagram, Mail } from 'lucide-react'
import { PublicNavbar } from '@/components/PublicNavbar'
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
      <PublicNavbar categories={categories ?? []} />
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
