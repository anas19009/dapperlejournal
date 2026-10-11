'use server'

import { getProfile } from '@/lib/auth/session'
import { can } from '@/lib/permissions'
import type { Role } from '@/lib/permissions'
import { uploadImageToCloudinary } from '@/lib/cloudinary'

export async function uploadPostImage(formData: FormData) {
  const profile = await getProfile()
  if (!profile || !can(profile.role as Role, 'posts:create')) return { error: 'Unauthorized' }

  const file = formData.get('image')
  if (!(file instanceof File)) return { error: 'No image provided' }

  try {
    const upload = await uploadImageToCloudinary(file, `moroccan-dapper/posts/${profile.id}`)
    return { success: true, url: upload.secure_url }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Image upload failed' }
  }
}
