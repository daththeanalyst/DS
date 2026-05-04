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

function LoginForm() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || loading) return
    setError(false)
    setLoading(true)

    try {
      const res = await fetch('/api/megagym-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        setError(true)
        setLoading(false)
        return
      }

      const redirect = searchParams.get('redirect') ?? '/MegaGym-Website'
      const canvas = canvasRef.current!
      const overlay = overlayRef.current!
      const iframe = iframeRef.current!

      overlay.style.transition = 'opacity 0.2s ease'
      overlay.style.opacity = '0'

      iframe.style.transition = 'filter 1.1s ease'
      iframe.style.filter = 'blur(0px)'

      setTimeout(() => {
        canvas.style.display = 'block'
        dissolve(canvas, 'rgba(244, 243, 241, 0.94)', () => router.push(redirect))
      }, 180)
    } catch {
      setError(true)
      setLoading(false)
    }
  }, [password, loading, router, searchParams])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#f0efed' }}>
      {/* Live blurred MegaGym site as background */}
      <iframe
        ref={iframeRef}
        src="https://megagym.dathproject.com"
        title="preview"
        style={{
          position: 'absolute',
          inset: '-6%',
          width: '112%',
          height: '112%',
          border: 'none',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />

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

      {/* Password overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(244, 243, 241, 0.88)',
          backdropFilter: 'blur(3px)',
        }}
      >
        {/* DS2 logo — top center */}
        <div style={{ position: 'absolute', top: '36px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <img src="/logos/logo-black.png" alt="DS2" style={{ height: '28px', width: 'auto', opacity: 0.7 }} />
        </div>

        <LockIcon />

        <h1 style={{
          marginTop: '28px',
          fontSize: 'clamp(26px, 3.5vw, 38px)',
          fontWeight: 300,
          color: '#1c1c1c',
          letterSpacing: '-0.018em',
          textAlign: 'center',
          fontFamily: 'var(--font-inter), ui-sans-serif, sans-serif',
        }}>
          This content is protected.
        </h1>

        <p style={{
          marginTop: '12px',
          fontSize: '15.5px',
          color: '#888',
          textAlign: 'center',
          fontFamily: 'var(--font-inter), ui-sans-serif, sans-serif',
        }}>
          To view, please enter the password.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ marginTop: '48px', width: '100%', maxWidth: '500px', padding: '0 24px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '3px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              autoFocus
              style={{
                flex: 1,
                padding: '18px 22px',
                fontSize: '15px',
                color: '#333',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-inter), ui-sans-serif, sans-serif',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                padding: '18px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#aaa',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <EyeIcon open={showPassword} />
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                padding: '18px 22px',
                background: 'transparent',
                border: 'none',
                cursor: loading || !password ? 'default' : 'pointer',
                color: loading || !password ? '#ccc' : '#666',
                fontSize: '20px',
                lineHeight: 1,
                transition: 'color 0.2s',
              }}
            >
              →
            </button>
          </div>

          {error && (
            <p style={{
              marginTop: '10px',
              fontSize: '13px',
              color: '#c0392b',
              textAlign: 'center',
              fontFamily: 'var(--font-inter), ui-sans-serif, sans-serif',
            }}>
              Incorrect password. Please try again.
            </p>
          )}
        </form>

        <p style={{
          position: 'absolute',
          bottom: '28px',
          fontSize: '11px',
          color: '#bbb',
          letterSpacing: '0.06em',
          fontFamily: 'ui-monospace, monospace',
        }}>
          DS2 · DIGITAL SOLUTIONS
        </p>
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
