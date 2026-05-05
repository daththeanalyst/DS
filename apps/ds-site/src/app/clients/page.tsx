import Link from 'next/link'
import Image from 'next/image'

interface ClientEntry {
  slug: string
  name: string
  href: string
  industry: string
  status: 'live' | 'staging' | 'draft'
  shortNote: string
}

const CLIENTS: ClientEntry[] = [
  {
    slug: 'megagym',
    name: 'MEGA GYM',
    href: '/MegaGym-Website/',
    industry: 'Fitness · Athens',
    status: 'staging',
    shortNote: '7 locations · website + booking',
  },
]

export default function ClientsPage() {
  return (
    <main className="clients-page">
      <div className="clients-bg" aria-hidden="true">
        <span className="clients-blob clients-blob--a" />
        <span className="clients-blob clients-blob--b" />
      </div>

      <div className="clients-shell">
        <header className="clients-head">
          <p className="clients-eyebrow">DS2 · Clients</p>
          <h1 className="clients-title">Who we&apos;re building for.</h1>
          <p className="clients-sub">
            Active engagements live behind this gate. Pick a project to view its current build.
          </p>
        </header>

        <ul className="clients-list">
          {CLIENTS.map(c => (
            <li key={c.slug}>
              <Link href={c.href} className="client-card">
                <div className="client-card__left">
                  <p className="client-card__industry">{c.industry}</p>
                  <h2 className="client-card__name">{c.name}</h2>
                  <p className="client-card__note">{c.shortNote}</p>
                </div>
                <div className="client-card__right">
                  <span className={`client-card__status client-card__status--${c.status}`}>
                    {c.status}
                  </span>
                  <span className="client-card__arrow" aria-hidden="true">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <footer className="clients-foot">
          <Image
            src="/logos/black_DS2_logo.png"
            alt="DS2"
            width={180}
            height={60}
            style={{ height: 28, width: 'auto', opacity: 0.55 }}
          />
          <span>DS2 · DIGITAL SOLUTIONS · ATHENS / LONDON</span>
        </footer>
      </div>
    </main>
  )
}
