'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { LayoutDashboard, LogOut, Loader2 } from 'lucide-react'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts.at(-1)![0]).toUpperCase()
}

function sessionToUser(session: Session | null) {
  if (!session) return null
  const email = session.user.email ?? ''
  const name =
    session.user.user_metadata?.full_name ??
    session.user.user_metadata?.name ??
    email.split('@')[0]
  return { email, name, id: session.user.id, avatarUrl: null as string | null }
}

type UserState = { email: string; name: string; id: string; avatarUrl: string | null } | null | undefined
type Role = 'admin' | 'author' | 'viewer'

export function NavAuthButton() {
  const [user, setUser] = useState<UserState>(undefined)
  const [role, setRole] = useState<Role | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [goingToDashboard, startDashboard] = useTransition()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(sessionToUser(session))
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', session.user.id)
          .single()
        setRole((profile?.role as Role) ?? null)
        setUser((current) => current ? {
          ...current,
          name: profile?.full_name?.trim() || current.name,
          avatarUrl: profile?.avatar_url ?? null,
        } : current)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(sessionToUser(session))
      if (!session) setRole(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (user === undefined) return <div className="w-8 h-8" />

  if (user === null) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/login"
          className="border-2 border-black bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="inline-flex h-8 items-center justify-center border-2 border-black bg-secondary px-4 text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
        >
          Create Account
        </Link>
      </div>
    )
  }

  const handleDashboard = () => {
    startDashboard(() => {
      router.push('/dashboard')
    })
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
    setSigningOut(false)
  }

  const initials = getInitials(user.name)
  const busy = signingOut || goingToDashboard

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-none border-2 border-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 transition-opacity disabled:opacity-50"
        aria-label="Account menu"
        disabled={busy}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: '#101614',
            borderRadius: 0,
            border: '2px solid #000',
            boxShadow: '2px 2px 0 0 #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
            userSelect: 'none',
            letterSpacing: '0.05em',
            flexShrink: 0,
            opacity: busy ? 0.5 : 1,
            transition: 'opacity 150ms',
          }}
          aria-hidden="true"
        >
          {busy ? (
            <Loader2 className="size-3.5 animate-spin" style={{ color: '#fff' }} />
          ) : user.avatarUrl ? (
                                                                 
            <img src={user.avatarUrl} alt="" width={32} height={32} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : initials}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate max-w-52 font-normal">
            {user.email}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {role !== 'viewer' && (
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={handleDashboard}
              disabled={busy}
            >
              {goingToDashboard ? <Loader2 className="size-4 animate-spin" /> : <LayoutDashboard />}
              Dashboard
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer gap-2"
            onClick={handleSignOut}
            disabled={busy}
          >
            {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut />}
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
