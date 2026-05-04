import { NextResponse } from 'next/server'

const AUTH_COOKIE = 'megagym_auth'
const AUTH_VALUE = 'ds2-mgym-v1'

export async function POST(request: Request) {
  const body = await request.json()

  if (body.password !== process.env.MEGAGYM_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(AUTH_COOKIE, AUTH_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
