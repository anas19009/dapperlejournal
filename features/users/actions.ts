'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { can } from '@/lib/permissions'
import type { Role } from '@/lib/permissions'
import { getProfile } from '@/lib/auth/session'

export async function updateUserRole(userId: string, role: 'admin' | 'author' | 'viewer') {
  const profile = await getProfile()
  if (!profile || !can(profile.role as Role, 'users:update')) return { error: 'Unauthorized' }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) {
    if (error.message.includes('profiles_role_check')) {
      return { error: 'Viewer role is not enabled in the database yet. Apply the latest Supabase migration, then try again.' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const profile = await getProfile()
  if (!profile || !can(profile.role as Role, 'users:update')) return { error: 'Unauthorized' }
  if (profile.id === userId) return { error: 'You cannot delete your own account' }

  const supabase = createServiceClient()
  const { error: commentsError } = await supabase
    .from('comments')
    .delete()
    .eq('author_id', userId)

  if (commentsError) return { error: commentsError.message }

  const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  if (authError) return { error: authError.message }

  revalidatePath('/dashboard/admin/users')
  revalidatePath('/dashboard/comments')
  revalidatePath('/dashboard/posts')
  return { success: true }
}
