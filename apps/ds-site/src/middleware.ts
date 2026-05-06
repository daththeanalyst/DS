import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE = 'megagym_auth'
const AUTH_VALUE = 'ds2-mgym-v1'
const VISITOR_COOKIE = 'mgym_visitor'
const CLIENT_COOKIE = 'mgym_client'

function getBlockedIds(): string[] {
  try {
    return JSON.parse(process.env.MEGAGYM_BLOCKED ?? '[]')
  } catch {
    return []
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookie = request.cookies.get(AUTH_COOKIE)

  if (cookie?.value !== AUTH_VALUE) {
    const url = request.nextUrl.clone()
    url.pathname = '/megagym-login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Check if this client_id has been blocked — kick them back to login even
  // if their auth cookie is still valid
  const clientId = request.cookies.get(CLIENT_COOKIE)?.value ?? null
  if (clientId && getBlockedIds().includes(clientId)) {
    const url = request.nextUrl.clone()
    url.pathname = '/megagym-login'
    url.searchParams.set('redirect', pathname)
    const res = NextResponse.redirect(url)
    res.cookies.delete(AUTH_COOKIE)
    res.cookies.delete(CLIENT_COOKIE)
    return res
  }

  const response = NextResponse.next()

  // Skip logging for asset requests (images, scripts, fonts, etc.)
  // Browser page navigations always include text/html in Accept; assets don't.
  const accept = request.headers.get('accept') ?? ''
  if (!accept.includes('text/html')) return response

  // Get or create a persistent visitor ID
  let visitorId = request.cookies.get(VISITOR_COOKIE)?.value ?? null
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
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
        visitor_id: visitorId,
        client_id: request.cookies.get(CLIENT_COOKIE)?.value ?? null,
      }),
    }).catch(() => {})
  }

  return response
}

export const config = {
  matcher: ['/clients/:path*', '/MegaGym-Website/:path*'],
}
