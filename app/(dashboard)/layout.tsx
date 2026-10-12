import { requireAuth } from '@/lib/auth/session'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { Toaster } from 'sonner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAuth()

  return (
    <AuthProvider>
      <div className="dashboard-shell flex h-screen min-w-0 overflow-x-hidden">
        <Sidebar profile={profile} />
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-white pt-32 lg:pt-0">
          {children}
        </main>
      </div>
      <Toaster richColors />
    </AuthProvider>
  )
}
