'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

const TZ_OPTIONS = [
  { label: 'London', value: 'Europe/London' },
  { label: 'Athens', value: 'Europe/Athens' },
]

export default function FilterBar({ initialTz }: { initialTz: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [from, setFrom] = useState(searchParams.get('from') ?? '')
  const [to, setTo] = useState(searchParams.get('to') ?? '')
  const [tz, setTz] = useState(searchParams.get('tz') ?? initialTz)

  const apply = useCallback(() => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    params.set('tz', tz)
    router.replace(`${pathname}?${params.toString()}`)
  }, [from, to, tz, pathname, router])

  const reset = useCallback(() => {
    setFrom('')
    setTo('')
    setTz('Europe/London')
    router.replace(pathname)
  }, [pathname, router])

  const isDirty = from || to || tz !== 'Europe/London'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {/* Timezone toggle */}
      <div style={{ display: 'flex', background: '#111', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
        {TZ_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setTz(opt.value)}
            style={{
              padding: '7px 14px',
              background: tz === opt.value ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              color: tz === opt.value ? '#f5f5f5' : '#555',
              fontSize: '11px',
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Date range */}
      <input
        type="date"
        value={from}
        onChange={e => setFrom(e.target.value)}
        style={dateInputStyle}
      />
      <span style={{ color: '#333', fontSize: '11px', fontFamily: 'ui-monospace, monospace' }}>–</span>
      <input
        type="date"
        value={to}
        onChange={e => setTo(e.target.value)}
        style={dateInputStyle}
      />

      <button onClick={apply} style={{
        padding: '7px 14px',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '6px',
        color: '#f5f5f5',
        fontSize: '11px',
        fontFamily: 'ui-monospace, monospace',
        letterSpacing: '0.06em',
        cursor: 'pointer',
      }}>
        Apply
      </button>

      {isDirty && (
        <button onClick={reset} style={{
          padding: '7px 14px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '6px',
          color: '#555',
          fontSize: '11px',
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.06em',
          cursor: 'pointer',
        }}>
          Reset
        </button>
      )}
    </div>
  )
}

const dateInputStyle: React.CSSProperties = {
  padding: '7px 10px',
  background: '#111',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '6px',
  color: '#888',
  fontSize: '11px',
  fontFamily: 'ui-monospace, monospace',
  outline: 'none',
  colorScheme: 'dark',
}
