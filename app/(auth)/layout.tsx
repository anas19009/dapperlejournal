import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="public-shell relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="relative w-full max-w-md animate-page">
        <Link href="/" className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 overflow-hidden border-2 border-black bg-white p-2 shadow-[3px_3px_0_0_#000]">
            <Image src="/logo.png" alt="Moroccan Dapper logo" width={72} height={72} className="h-16 w-16 object-contain" />
          </div>
          <h1 className="brand-name text-2xl tracking-tight text-foreground">Moroccan Dapper</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to the editorial desk</p>
        </Link>
        <div className="border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
          {children}
        </div>
      </div>
    </div>
  )
}
