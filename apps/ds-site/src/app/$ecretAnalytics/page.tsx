import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { PROJECTS } from './projects'

export const dynamic = 'force-dynamic'

interface VisitRow {
  path: string | null
  created_at: string
  country: string | null
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function sevenDaysAgo() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString()
}

export default async function AnalyticsOverview() {
  const sb = getSupabase()

  let allVisits: VisitRow[] = []
  let fetchError: string | null = null

  if (!sb) {
    fetchError = 'Supabase env vars not set (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).'
  } else {
    try {
      const { data, error } = await sb
        .from('visits')
        .select('path, created_at, country')
        .order('created_at', { ascending: false })
      if (error) {
        fetchError = error.message
      } else if (data) {
        allVisits = data as VisitRow[]
      }
    } catch (err) {
      fetchError = err instanceof Error ? err.message : 'Unknown fetch error.'
    }
  }

  const week = sevenDaysAgo()

  const projectStats = PROJECTS.map(project => {
    const visits = (allVisits ?? []).filter(v =>
      v.path?.startsWith(project.pathPrefix),
    )
    const weekVisits = visits.filter(v => v.created_at > week)

    const countryCounts = visits.reduce<Record<string, number>>((acc, v) => {
      const k = v.country ?? 'Unknown'
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    }, {})
    const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]

    return {
      project,
      total: visits.length,
      weekCount: weekVisits.length,
      topCountry: topCountry?.[0] ?? null,
      lastVisit: visits[0]?.created_at ?? null,
    }
  })

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#f5f5f5',
      padding: '52px 36px',
      fontFamily: 'var(--font-inter), ui-sans-serif, sans-serif',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '52px' }}>
          <p style={{ fontSize: '11px', color: '#444', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', marginBottom: '10px' }}>
            DS2 · Analytics
          </p>
          <h1 style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '-0.025em', margin: 0 }}>
            Client projects
          </h1>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
            {PROJECTS.length} active {PROJECTS.length === 1 ? 'project' : 'projects'} · click any card for deeper insights
          </p>
        </div>

        {fetchError && (
          <div style={{
            marginBottom: '32px',
            padding: '18px 22px',
            border: '1px solid rgba(255,170,80,0.32)',
            background: 'rgba(255,170,80,0.06)',
            borderRadius: '10px',
            color: '#e8b46a',
            fontSize: '13px',
            lineHeight: 1.55,
            fontFamily: 'ui-monospace, monospace',
          }}>
            <strong style={{ color: '#f5c98a' }}>Analytics data unavailable.</strong>{' '}
            {fetchError} The page is rendering with empty stats — check Vercel project env vars.
          </div>
        )}

        {/* Project cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
          {projectStats.map(({ project, total, weekCount, topCountry, lastVisit }) => (
            <Link
              key={project.slug}
              href={`/$ecretAnalytics/${project.slug}`}
              className="analytics-card"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className="analytics-card__inner" style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '32px',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, background 0.2s ease',
              }}>
                {/* Project name + URL */}
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.018em', margin: 0 }}>
                      {project.name}
                    </h2>
                    <span style={{ fontSize: '11px', color: '#444', fontFamily: 'ui-monospace, monospace', marginTop: '3px', flexShrink: 0 }}>
                      {lastVisit ? timeAgo(lastVisit) : 'no visits yet'}
                    </span>
                  </div>
                  <p style={{ marginTop: '4px', fontSize: '12px', color: '#555', fontFamily: 'ui-monospace, monospace' }}>
                    {project.url}
                  </p>
                  <p style={{ marginTop: '6px', fontSize: '13px', color: '#666' }}>
                    {project.description}
                  </p>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
                  <MiniStat label="Total visits" value={total} />
                  <MiniStat label="This week" value={weekCount} highlight={weekCount > 0} />
                  <MiniStat label="Top country" value={topCountry ?? '—'} />
                </div>

                {/* Arrow */}
                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', fontSize: '12px', color: '#555' }}>
                  <span>View insights</span>
                  <span style={{ fontSize: '14px' }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}

function MiniStat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div style={{ background: '#111', padding: '16px 18px' }}>
      <p style={{ fontSize: '10px', color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace', margin: '0 0 6px' }}>
        {label}
      </p>
      <p style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '-0.02em', margin: 0, color: highlight ? '#f5f5f5' : '#888' }}>
        {value}
      </p>
    </div>
  )
}
