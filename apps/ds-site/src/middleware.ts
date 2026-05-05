import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE = 'megagym_auth'
const AUTH_VALUE = 'ds2-mgym-v1'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookie = request.cookies.get(AUTH_COOKIE)

  if (cookie?.value !== AUTH_VALUE) {
    const url = request.nextUrl.clone()
    url.pathname = '/megagym-login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Fire-and-forget visit logging
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (supabaseUrl && serviceKey) {
    fetch(`${supabaseUrl}/rest/v1/visits`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        path: pathname,
        referrer: request.headers.get('referer') ?? null,
        country: (request as NextRequest & { geo?: { country?: string } }).geo?.country ?? null,
        user_agent: request.headers.get('user-agent') ?? null,
      }),
    }).catch(() => {})
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/clients/:path*', '/MegaGym-Website/:path*'],
}
