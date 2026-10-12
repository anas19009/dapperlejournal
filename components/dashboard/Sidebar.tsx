'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, PlusCircle, Users, FolderOpen, Tag, LogOut, Menu, X, MessageSquare, Loader2, Code, Bot, UserCircle, Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { can } from '@/lib/permissions'
import type { Role } from '@/lib/permissions'
import type { Profile } from '@/lib/supabase/types'
import { DashboardMascot } from './DashboardMascot'

interface SidebarProps {
  readonly profile: Profile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const role = profile.role as Role
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  function handleLogout() {
    startTransition(async () => {
      try {
        await fetch('/api/auth/signout', { method: 'POST' })
      } finally {
        globalThis.location.href = '/login'
      }
    })
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true, section: 'main' as const },
    { href: '/dashboard/profile', icon: UserCircle, label: 'Profile', show: true, section: 'main' as const },
    { href: '/dashboard/posts', icon: FileText, label: 'Posts', show: true, section: 'main' as const },
    { href: '/dashboard/posts/new', icon: PlusCircle, label: 'New Post', show: true, section: 'main' as const },
    { href: '/dashboard/ai-assistant', icon: Bot, label: 'AI Assistant', show: true, section: 'main' as const },
    { href: '/dashboard/developer', icon: Code, label: 'Developer', show: can(role, 'api_keys:write'), section: 'main' as const },
    { href: '/dashboard/admin/users', icon: Users, label: 'Users', show: can(role, 'users:read'), section: 'admin' as const },
    { href: '/dashboard/admin/categories', icon: FolderOpen, label: 'Categories', show: can(role, 'categories:write'), section: 'admin' as const },
    { href: '/dashboard/admin/tags', icon: Tag, label: 'Tags', show: can(role, 'tags:write'), section: 'admin' as const },
    { href: '/dashboard/comments', icon: MessageSquare, label: 'Comments', show: can(role, 'comments:delete:all'), section: 'admin' as const },
    { href: '/dashboard/admin/newsletter', icon: Mail, label: 'Newsletter', show: can(role, 'users:read'), section: 'admin' as const },
  ]

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((name) => name[0]).join('').toUpperCase().slice(0, 2)
    : profile.email[0].toUpperCase()

  const mainItems = navItems.filter((item) => item.show && item.section === 'main')
  const adminItems = navItems.filter((item) => item.show && item.section === 'admin')

  const renderItems = (items: typeof navItems) => items.map((item) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 border-2 border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-150',
          isActive
            ? 'border-black bg-primary text-white shadow-[3px_3px_0_0_#000]'
            : 'text-muted-foreground hover:border-black hover:bg-white hover:text-foreground',
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-black bg-secondary shadow-[3px_3px_0_0_#000]">
          <Icon className="icon-on-color h-4 w-4" />
        </span>
        {item.label}
        {item.href === '/dashboard/posts/new' && (
          <span className="ml-auto border border-black bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-black">New</span>
        )}
      </Link>
    )
  })

  const sidebarContent = (
    <>
      <div className="relative flex flex-col items-center border-b-2 border-black p-6">
        <Link href="/" className="group flex w-full flex-col items-center gap-1 text-center transition-opacity hover:opacity-80">
          <DashboardMascot size={112} />
          <span className="text-center text-sm font-semibold text-foreground">
            Welcome back, {profile.full_name ?? profile.email.split('@')[0]}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Dashboard</span>
        </Link>
        <button className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        <div className="space-y-0.5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Main</p>
          {renderItems(mainItems)}
        </div>
        {adminItems.length > 0 && (
          <div className="space-y-0.5">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Admin</p>
            {renderItems(adminItems)}
          </div>
        )}
      </nav>

      <div className="border-t-2 border-black p-3">
        <Link href="/dashboard/profile" className="mb-1 flex items-center gap-3 border-2 border-transparent px-3 py-3 transition-colors hover:border-black hover:bg-white">
          {profile.avatar_url ? (
                                                                 
            <img src={profile.avatar_url} alt={profile.full_name ?? profile.email} className="h-8 w-8 shrink-0 rounded-none border-2 border-black object-cover" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-secondary text-xs font-bold text-white shadow-[3px_3px_0_0_#000]">{initials}</div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{profile.full_name ?? profile.email}</p>
            <p className="text-xs capitalize text-muted-foreground">{profile.role}</p>
          </div>
        </Link>
        <button onClick={handleLogout} disabled={isPending} className="flex w-full items-center gap-3 border-2 border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-all duration-150 hover:border-black hover:bg-white hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50">
          {isPending ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <LogOut className="h-4 w-4 shrink-0" />}
          {isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </>
  )

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-30 h-32 items-center justify-center border-b-2 border-black bg-background px-4 lg:hidden">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-center">
          <DashboardMascot size={80} />
          <span className="text-center text-xs font-semibold text-foreground">
            Welcome back, {profile.full_name ?? profile.email.split('@')[0]}
          </span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      </div>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />}

      <aside className={cn('fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r-2 border-black bg-background transition-transform duration-300 ease-in-out', 'lg:sticky lg:z-auto lg:translate-x-0 lg:overflow-y-auto', mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        {sidebarContent}
      </aside>
    </>
  )
}
