import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { FileText, Users, Eye, TrendingUp, PenLine, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { getProfile } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const profile = await getProfile()
  const isAdmin = profile?.role === 'admin'

  const supabase = await createClient()

  const [{ count: totalPosts }, { count: publishedPosts }] = await Promise.all([
    isAdmin
      ? supabase.from('posts').select('*', { count: 'exact', head: true })
      : supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', profile?.id),
    isAdmin
      ? supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published')
      : supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published').eq('author_id', profile?.id),
  ])

  const { count: totalUsers } = isAdmin
    ? await supabase.from('profiles').select('*', { count: 'exact', head: true })
    : { count: null }

  const draftCount = (totalPosts ?? 0) - (publishedPosts ?? 0)
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  const stats = [
    {
      title: 'Total Posts',
      value: totalPosts ?? 0,
      icon: FileText,
      bg: 'bg-secondary',
      iconColor: 'text-white',
      trend: `${draftCount} draft${draftCount !== 1 ? 's' : ''}`,
      show: true,
    },
    {
      title: 'Published',
      value: publishedPosts ?? 0,
      icon: Eye,
      bg: 'bg-secondary',
      iconColor: 'text-white',
      trend: 'Live & visible',
      show: true,
    },
    {
      title: 'Total Users',
      value: totalUsers ?? 0,
      icon: Users,
      bg: 'bg-secondary',
      iconColor: 'text-white',
      trend: 'Active members',
      show: isAdmin,
    },
  ]

  return (
    <div className="min-h-full space-y-8 bg-white/70 p-4 md:p-8 animate-page">
      
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Control room / {profile?.role ?? 'member'}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Hello, {firstName}</h1>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="button-brutal-primary inline-flex h-10 items-center gap-2 px-4 text-sm font-bold transition-all duration-200"
        >
          <PenLine className="icon-on-color h-4 w-4" />
          New Post
        </Link>
      </div>

      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.filter((s) => s.show).map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="relative overflow-hidden border-2 border-black bg-white p-6 shadow-shadow transition-all duration-200 hover:-translate-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-2 bg-black" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-4xl font-bold tracking-tight mt-2 mb-3">{stat.value}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </div>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center border-2 border-black shadow-[3px_3px_0_0_#000] ${stat.bg}`}>
                  <Icon className={`icon-on-color h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/dashboard/posts/new', label: 'Write a new post', desc: 'Start from scratch', icon: PenLine, color: 'text-black bg-accent' },
            { href: '/dashboard/posts', label: 'Manage posts', desc: 'Edit, publish, delete', icon: FileText, color: 'text-black bg-accent' },
            ...(isAdmin ? [{ href: '/dashboard/admin/users', label: 'Manage users', desc: 'Roles & permissions', icon: Users, color: 'text-black bg-accent' }] : []),
          ].map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`group flex items-center gap-4 border-2 border-black p-4 shadow-[3px_3px_0_0_#000] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${'card' in action && action.card ? action.card : 'bg-white'}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black shadow-[3px_3px_0_0_#000] ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-black transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
