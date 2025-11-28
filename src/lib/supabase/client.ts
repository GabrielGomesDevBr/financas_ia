import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []
          return document.cookie
            .split(';')
            .map(cookie => cookie.trim())
            .filter(cookie => cookie.length > 0)
            .map(cookie => {
              const [name, ...rest] = cookie.split('=')
              const value = rest.join('=')
              return { name, value: decodeURIComponent(value) }
            })
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          cookiesToSet.forEach(({ name, value, options }) => {
            const expires = options?.maxAge
              ? new Date(Date.now() + options.maxAge * 1000)
              : undefined
            const cookie = `${name}=${encodeURIComponent(value)}${
              expires ? `; expires=${expires.toUTCString()}` : ''
            }; path=/; SameSite=Lax${options?.secure ? '; Secure' : ''}`
            document.cookie = cookie
          })
        },
      },
    }
  )
}
