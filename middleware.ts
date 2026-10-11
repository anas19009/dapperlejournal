import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAnonKey, getSupabaseUrl } from './lib/supabase/config'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  function redirectWithCookies(destination: string): NextResponse {
    const url = request.nextUrl.clone()
    url.pathname = destination
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }
  if (pathname === '/mfa') {
    if (!user) return redirectWithCookies('/login')

    const { data: viewerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (viewerProfile?.role === 'viewer') return redirectWithCookies('/')
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.currentLevel === 'aal2') return redirectWithCookies('/dashboard')
    return supabaseResponse
  }
  if (pathname.startsWith('/dashboard')) {
    if (!user) return redirectWithCookies('/login')

    const { data: viewerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (viewerProfile?.role === 'viewer') return redirectWithCookies('/')
    const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalError || (aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2')) {
      return redirectWithCookies('/mfa')
    }
    if (pathname.startsWith('/dashboard/admin')) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const profile = profileData as { role: string } | null
      if (profile?.role !== 'admin') return redirectWithCookies('/dashboard')
    }
  }
  if (user && (pathname === '/login' || pathname === '/register')) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    return redirectWithCookies(profileData?.role === 'viewer' ? '/' : '/dashboard')
  }
  return supabaseResponse
}
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
    '/mfa',
  ],
}
