import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { can } from '@/lib/permissions'
import type { Permission, Role } from '@/lib/permissions'
import type { Profile } from '@/lib/supabase/types'
                                                                             
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return profile
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  return profile
}

export async function requirePermission(permission: Permission): Promise<Profile> {
  const profile = await requireAuth()
  if (!can(profile.role as Role, permission)) redirect('/dashboard')
  return profile
}
