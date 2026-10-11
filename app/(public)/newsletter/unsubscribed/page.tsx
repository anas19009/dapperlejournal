import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Unsubscribed' }

export default function UnsubscribedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="max-w-md space-y-4 border-2 border-black bg-white p-8 text-center shadow-[6px_6px_0_0_#000]">
        <p className="inline-block border-2 border-black bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-widest">Newsletter</p>
        <h1 className="text-2xl font-bold">You&apos;ve been unsubscribed</h1>
        <p className="text-muted-foreground">
          You won&apos;t receive any more newsletter emails. If you change your mind, you can
          subscribe again from any blog post.
        </p>
        <Link
          href="/blog"
          className="inline-flex border-2 border-black bg-secondary px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
        >
          Back to Blog
        </Link>
      </div>
    </div>
  )
}
