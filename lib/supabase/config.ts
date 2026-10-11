export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL. Add your Supabase project URL to .env.local.')
  }
  try {
    const parsed = new URL(url)
    if (!parsed.hostname.includes('supabase.co') && !parsed.hostname.includes('localhost')) {
      throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL. Use your Supabase project URL, for example https://project-ref.supabase.co')
    }
  } catch {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL. Use your Supabase project URL, for example https://project-ref.supabase.co')
  }
  return url
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to .env.local.')
  }
  return key
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local.')
  }
  return key
}
