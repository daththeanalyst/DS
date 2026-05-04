import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function truncate(str: string | null, n: number) {
  if (!str) return '—'
  return str.length > n ? str.slice(0, n) + '…' : str
}

export default async function Analytics() {
  const sb = getSupabase()

  const { data: visits } = await sb
    .from('visits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const total = visits?.length ?? 0

  const countryCounts = (visits ?? []).reduce<Record<string, number>>((acc, v) => {
    const key = v.country ?? 'Unknown'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const pathCounts = (visits ?? []).reduce<Record<string, number>>((acc, v) => {
    const key = v.path ?? '/'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const topPaths = Object.entries(pathCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#f5f5f5',
      padding: '48px 32px',
      fontFamily: 'var(--font-inter), ui-sans-serif, sans-serif',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', marginBottom: '8px' }}>
            DS2 · INTERNAL
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '-0.02em', color: '#f5f5f5', margin: 0 }}>
            MegaGym — Visitor Analytics
          </h1>
          <p style={{ marginTop: '6px', fontSize: '13px', color: '#555', fontFamily: 'ui-monospace, monospace' }}>
            ds2-consulting.com/MegaGym-Website
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '40px' }}>
          <StatCard label="Total visits" value={total} />
          <StatCard label="Top country" value={topCountries[0]?.[0] ?? '—'} />
          <StatCard label="Top page" value={topPaths[0]?.[0]?.replace('/MegaGym-Website', '') || '/'} />
        </div>

        {/* Two column breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '40px' }}>
          <BreakdownTable title="Top pages" rows={topPaths} total={total} />
          <BreakdownTable title="Top countries" rows={topCountries} total={total} />
        </div>

        {/* Recent visits table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 500, color: '#a0a0a0', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', margin: 0 }}>
              Recent visits
            </h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Time', 'Path', 'Country', 'Referrer'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#555', fontWeight: 400, fontFamily: 'ui-monospace, monospace', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(visits ?? []).map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '13px 20px', color: '#666', whiteSpace: 'nowrap', fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>
                      {formatDate(v.created_at)}
                    </td>
                    <td style={{ padding: '13px 20px', color: '#d0d0d0' }}>
                      {v.path ?? '—'}
                    </td>
                    <td style={{ padding: '13px 20px', color: '#888' }}>
                      {v.country ?? '—'}
                    </td>
                    <td style={{ padding: '13px 20px', color: '#555', maxWidth: '280px' }}>
                      {truncate(v.referrer, 50)}
                    </td>
                  </tr>
                ))}
                {total === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px 20px', textAlign: 'center', color: '#444', fontFamily: 'ui-monospace, monospace', fontSize: '12px' }}>
                      No visits recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '24px 28px',
    }}>
      <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', margin: '0 0 10px' }}>
        {label}
      </p>
      <p style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-0.03em', color: '#f5f5f5', margin: 0, lineHeight: 1 }}>
        {value}
      </p>
    </div>
  )
}

function BreakdownTable({ title, rows, total }: { title: string; rows: [string, number][]; total: number }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 500, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', margin: 0 }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: '8px 0' }}>
        {rows.length === 0 && (
          <p style={{ padding: '16px 20px', color: '#444', fontSize: '12px', fontFamily: 'ui-monospace, monospace' }}>No data yet.</p>
        )}
        {rows.map(([label, count]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', color: '#d0d0d0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <div style={{ width: '80px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${total > 0 ? (count / total) * 100 : 0}%`, background: 'rgba(255,255,255,0.4)', borderRadius: '99px' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#666', fontFamily: 'ui-monospace, monospace', minWidth: '24px', textAlign: 'right' }}>{count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
