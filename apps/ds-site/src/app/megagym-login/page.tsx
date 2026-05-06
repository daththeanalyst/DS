'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LockIcon() {
  return (
    <svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="26" width="46" height="34" rx="5" stroke="#b0b0b0" strokeWidth="2" fill="none" />
      <path d="M13 26V19C13 9.5 39 9.5 39 19V26" stroke="#b0b0b0" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="26" cy="41" r="4.5" stroke="#b0b0b0" strokeWidth="1.8" fill="none" />
      <line x1="26" y1="45.5" x2="26" y2="51" stroke="#b0b0b0" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function dissolve(canvas: HTMLCanvasElement, bgColor: string, onDone: () => void) {
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const BLOCK = 26
  const cols = Math.ceil(canvas.width / BLOCK)
  const rows = Math.ceil(canvas.height / BLOCK)

  const blocks: Array<[number, number]> = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      blocks.push([c * BLOCK, r * BLOCK])

  for (let i = blocks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = blocks[i]!
    blocks[i] = blocks[j]!
    blocks[j] = tmp
  }

  const DURATION = 1100
  const start = performance.now()
  let last = 0

  function frame(now: number) {
    const t = Math.min((now - start) / DURATION, 1)
    const eased = 1 - Math.pow(1 - t, 2.8)
    const count = Math.floor(eased * blocks.length)
    for (let i = last; i < count; i++) {
      const b = blocks[i]!
      ctx.clearRect(b[0], b[1], BLOCK, BLOCK)
    }
    last = count
    t < 1 ? requestAnimationFrame(frame) : onDone()
  }

  requestAnimationFrame(frame)
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 2 * 60 * 1000
const LS_ATTEMPTS = 'mgym_attempts'
const LS_LOCKOUT = 'mgym_lockout'

function getRemainingLockout(): number {
  const until = parseInt(localStorage.getItem(LS_LOCKOUT) ?? '0', 10)
  return Math.max(0, until - Date.now())
}

function getAttempts(): number {
  return parseInt(localStorage.getItem(LS_ATTEMPTS) ?? '0', 10)
}

function LoginForm() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lockedOut, setLockedOut] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const check = () => {
      const remaining = getRemainingLockout()
      if (remaining > 0) {
        setLockedOut(true)
        setSecondsLeft(Math.ceil(remaining / 1000))
      } else {
        setLockedOut(false)
        setSecondsLeft(0)
      }
    }
    check()
    const interval = setInterval(check, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || loading || lockedOut) return
    if (getRemainingLockout() > 0) return

    setError(false)
    setLoading(true)

    try {
      const res = await fetch('/api/megagym-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const attempts = getAttempts() + 1
        localStorage.setItem(LS_ATTEMPTS, String(attempts))
        if (attempts >= MAX_ATTEMPTS) {
          localStorage.setItem(LS_LOCKOUT, String(Date.now() + LOCKOUT_MS))
          localStorage.setItem(LS_ATTEMPTS, '0')
        }
        setError(true)
        setLoading(false)
        return
      }

      // Reset attempt counter on success
      localStorage.setItem(LS_ATTEMPTS, '0')

      const { redirect: passwordRedirect } = await res.json()
      // Deep-link from middleware takes priority; fall back to password's own destination
      const redirect = searchParams.get('redirect') ?? passwordRedirect ?? '/clients'

      // Prime sessionStorage so the MegaGym preloader skips itself when the
      // user navigates from the clients page into /MegaGym-Website. Same
      // origin (ds2-consulting.com) so the flag is readable there.
      try {
        sessionStorage.setItem('megagym-loaded', '1')
      } catch {
        /* private browsing or quota — non-fatal */
      }

      const canvas = canvasRef.current!
      const overlay = overlayRef.current!

      overlay.style.transition = 'opacity 0.2s ease'
      overlay.style.opacity = '0'

      setTimeout(() => {
        canvas.style.display = 'block'
        dissolve(canvas, 'rgba(244, 243, 241, 0.96)', () => router.push(redirect))
      }, 180)
    } catch {
      setError(true)
      setLoading(false)
    }
  }, [password, loading, lockedOut, router, searchParams])

  return (
    <div className="lock-shell">
      {/* Animated drifting-blob background — pure CSS */}
      <div className="lock-bg" aria-hidden="true">
        <span className="lock-blob lock-blob--a" />
        <span className="lock-blob lock-blob--b" />
        <span className="lock-blob lock-blob--c" />
        <span className="lock-grain" />
      </div>

      {/* Pixel dissolve canvas — hidden until auth success */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 30,
          display: 'none',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Password card */}
      <div ref={overlayRef} className="lock-overlay">
        <div className="lock-brand">
          <img src="/logos/black_DS2_logo.png" alt="DS2" />
        </div>

        <div className="lock-card">
          <LockIcon />

          <h1 className="lock-title">This content is protected.</h1>
          <p className="lock-sub">To view, please enter the password.</p>

          <form onSubmit={handleSubmit} className="lock-form">
            <div className={`lock-input-wrap ${lockedOut ? 'is-locked' : ''}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={lockedOut ? `Try again in ${secondsLeft}s` : 'Enter password'}
                disabled={loading || lockedOut}
                autoFocus
                className="lock-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="lock-eye"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
              <button
                type="submit"
                disabled={loading || !password || lockedOut}
                className="lock-submit"
                aria-label="Submit"
              >
                →
              </button>
            </div>

            {lockedOut && (
              <p className="lock-error">Too many attempts. Try again in {secondsLeft}s.</p>
            )}
            {error && !lockedOut && (
              <p className="lock-error">
                Incorrect password. {MAX_ATTEMPTS - getAttempts()} attempt{MAX_ATTEMPTS - getAttempts() !== 1 ? 's' : ''} remaining.
              </p>
            )}
          </form>
        </div>

        <p className="lock-foot">DS2 · DIGITAL SOLUTIONS</p>
      </div>
    </div>
  )
}

export default function MegaGymLogin() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
