import crypto from 'node:crypto'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

type CloudinaryUpload = {
  secure_url: string
  public_id: string
}
function getConfig() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME
  let apiKey = process.env.CLOUDINARY_API_KEY
  let apiSecret = process.env.CLOUDINARY_API_SECRET
  if (cloudinaryUrl) {
    try {
      const parsed = new URL(cloudinaryUrl)
      cloudName = parsed.hostname
      apiKey = decodeURIComponent(parsed.username)
      apiSecret = decodeURIComponent(parsed.password)
    } catch {
      throw new Error('CLOUDINARY_URL is invalid')
    }
  }
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured')
  }
  return { cloudName, apiKey, apiSecret }
}

export async function uploadImageToCloudinary(file: File, folder: string): Promise<CloudinaryUpload> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Invalid image type. Use JPG, PNG, GIF, or WebP.')
  }
  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image must be smaller than 5 MB.')
  }
  const { cloudName, apiKey, apiSecret } = getConfig()
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = crypto
    .createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex')
  const body = new FormData()
  body.append('file', new Blob([await file.arrayBuffer()], { type: file.type }), file.name)
  body.append('api_key', apiKey)
  body.append('timestamp', timestamp)
  body.append('folder', folder)
  body.append('signature', signature)
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  })
  const result = await response.json() as CloudinaryUpload & { error?: { message?: string } }
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message ?? 'Cloudinary upload failed')
  }
  return result
}
