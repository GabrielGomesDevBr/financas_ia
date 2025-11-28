import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

const PUBLIC_ROUTES = ['/login', '/waitlist', '/blocked', '/auth/callback']
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  logger.debug('Middleware', `Processing request for: ${pathname}`)

  // Permitir rotas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    logger.debug('Middleware', `Public route allowed: ${pathname}`)
    return response
  }

  // Permitir assets e API auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return response
  }

  // Permitir arquivos PWA (service worker, manifest, workbox)
  if (
    pathname === '/sw.js' ||
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/workbox-') ||
    pathname.endsWith('.worker.js')
  ) {
    logger.debug('Middleware', `Allowing PWA file: ${pathname}`)
    return response
  }


  logger.debug('Middleware', `User authenticated: ${!!user}`)

  // Redirecionar para login se não autenticado
  if (!user) {
    logger.debug('Middleware', `Redirecting to login (no user): ${pathname}`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Buscar dados do usuário
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('access_status, user_type')
    .eq('id', user.id)
    .single()

  if (userError) {
    logger.error(`[Middleware] Error fetching user data:`, userError)
  }

  logger.debug('Middleware', 'User data:', userData)

  // Se não encontrou dados do usuário, permitir (pode estar no onboarding)
  if (!userData) {
    logger.debug('Middleware', 'No user data found in DB, allowing request to proceed (might be onboarding)')
    return response
  }

  // Usuário bloqueado
  if (userData.access_status === 'blocked') {
    if (pathname !== '/blocked') {
      logger.info('Middleware', 'Redirecting blocked user to /blocked')
      return NextResponse.redirect(new URL('/blocked', request.url))
    }
    return response
  }

  // Usuário na waitlist
  if (userData.access_status === 'waitlist') {
    if (pathname !== '/waitlist') {
      logger.info('Middleware', 'Redirecting waitlist user to /waitlist')
      return NextResponse.redirect(new URL('/waitlist', request.url))
    }
    return response
  }

  // Rotas admin - apenas super_admin
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (userData.user_type !== 'super_admin') {
      logger.info('Middleware', 'Redirecting non-admin user from admin route')
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  logger.debug('Middleware', `Access granted to: ${pathname}`)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
