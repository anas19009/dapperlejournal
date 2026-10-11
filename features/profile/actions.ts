'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/session'
import type { ProfileFormData, SocialLinksFormData } from './types'

export async function updateProfile(data: Partial<{ [K in keyof (ProfileFormData & SocialLinksFormData)]: string | null }>) {
  const profile = await getProfile()
  if (!profile) return { error: 'Unauthorized' }

  const ALLOWED_PROFILE_KEYS = new Set([
    'full_name', 'pronouns', 'bio', 'company', 'location', 'website',
    'twitter_url', 'linkedin_url', 'github_url', 'instagram_url',
    'facebook_url', 'youtube_url', 'tiktok_url',
  ])

  const safeData = Object.fromEntries(
    Object.entries(data).filter(([k]) => ALLOWED_PROFILE_KEYS.has(k))
  )

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update(safeData)
    .eq('id', profile.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function updateAvatar(formData: FormData) {
  const profile = await getProfile()
  if (!profile) return { error: 'Unauthorized' }

  const file = formData.get('avatar')
  if (!(file instanceof File) || file.size === 0) return { error: 'No file provided' }
  if (file.size > 2 * 1024 * 1024) return { error: 'File too large (max 2 MB)' }

  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
  if (!allowedTypes.has(file.type)) {
    return { error: 'Invalid file type. Use JPG, PNG, or GIF.' }
  }

  const supabase = await createClient()
  const storagePath = `${profile.id}/${file.name || 'avatar.jpg'}`
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(storagePath, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(storagePath)
  const versionedUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: versionedUrl })
    .eq('id', profile.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard/profile')
  return { success: true, avatar_url: versionedUrl }
}

export async function deleteAvatar() {
  const profile = await getProfile()
  if (!profile) return { error: 'Unauthorized' }

  if (!profile.avatar_url) return { success: true }

  const supabase = await createClient()
  const avatarsBucket = supabase.storage.from('avatars')

  let pathsToRemove: string[] = []
  const { data: files = [], error: listError } = await avatarsBucket.list(profile.id)
  if (listError) return { error: listError.message }

  pathsToRemove = (files ?? []).map((file) => `${profile.id}/${file.name}`)

  if (!pathsToRemove.length && profile.avatar_url) {
    try {
      const pathname = new URL(profile.avatar_url).pathname
      const objectPath = pathname.split('/object/public/avatars/')[1]
      if (objectPath) {
        pathsToRemove = [decodeURIComponent(objectPath)]
      }
    } catch {
    }
  }

  if (pathsToRemove.length > 0) {
    const { error: removeError } = await avatarsBucket.remove(pathsToRemove)
    if (removeError) return { error: removeError.message }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', profile.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  return { success: true }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const profile = await getProfile()
  if (!profile) return { error: 'Unauthorized' }

                                                                             
                                                                       
  const anonClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { error: signInError } = await anonClient.auth.signInWithPassword({
    email: profile.email,
    password: currentPassword,
  })
  if (signInError) {
                                                                        
                                                                          
    const isInvalidCredentials =
      signInError.code === 'invalid_credentials' ||
      (signInError.code == null && signInError.status === 400)
    return { error: isInvalidCredentials ? 'Current password is incorrect' : signInError.message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }

  return { success: true }
}
