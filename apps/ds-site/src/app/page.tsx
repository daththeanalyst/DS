/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";

export default function HomePage() {
  return (
    <>
      <nav className="top">
        <div className="nav-inner">
          <a href="#top" className="nav-mark">
            <Image src="/logos/ds2-logo.png" alt="DS2" width={1136} height={285} priority className="" style={{ height: 26, width: "auto", display: "block", opacity: 0.96 }} />
          </a>
          <ul className="nav-links">
            <li><a href="#services">Services</a></li>
            <li><a href="#how">How we work</a></li>
            <li><a href="#engage">Engage</a></li>
            <li><a href="#founders">Team</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      <a id="top" />

      {/* ─── Hero ────────────────────────────────────────── */}
      <section className="hero">
        <Image
          className="logo"
          src="/logos/ds2-logo.png"
          alt="DS2"
          width={1136}
          height={285}
          priority
          sizes="(min-width: 768px) 620px, 72vw"
        />
        <div className="tagline">
          <div className="tagline-1">Digital Solutions</div>
          <div className="tagline-2">consulting</div>
        </div>
        <p className="hero-sub">
          A senior team for strategy, engineering, and applied AI. We work best when we can be honest early — even if that means challenging the initial idea.
        </p>
        <div className="cta-row">
          <a href="mailto:hello@ds2-consulting.com?subject=Booking%20a%20call" className="btn btn-primary">Book a call</a>
          <a href="#services" className="btn btn-ghost">What we do</a>
        </div>
      </section>

      {/* ─── Services ────────────────────────────────────── */}
      <section className="section" id="services">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Services</div>
            <h2 className="section-title">Six things we build, <em>and we build them seriously.</em></h2>
            <p className="section-sub">No menu padding. Each of these is something we'd take responsibility for end-to-end, or refuse the engagement.</p>
          </div>

          <div className="services">
            <article className="svc">
              <div className="svc-icon">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="7" width="30" height="22" rx="2" />
                  <path d="M5 13h30" />
                  <circle cx="9" cy="10" r="0.7" fill="currentColor" />
                  <circle cx="12" cy="10" r="0.7" fill="currentColor" />
                  <path d="M14 33h12" />
                  <path d="M20 29v4" />
                </svg>
              </div>
              <div className="svc-num">01 — Websites</div>
              <h3>Marketing and product sites in Next.js / React.</h3>
              <p>Fast, accessible, on-brand, hosted on premium infrastructure. We don't build template sites with plugins glued together — we ship code we'd be willing to maintain ourselves.</p>
            </article>

            <article className="svc">
              <div className="svc-icon">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 9h20a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4H17l-6 5v-5H7a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4z" />
                  <circle cx="13" cy="17.5" r="1" fill="currentColor" />
                  <circle cx="19" cy="17.5" r="1" fill="currentColor" />
                  <circle cx="25" cy="17.5" r="1" fill="currentColor" />
                </svg>
              </div>
              <div className="svc-num">02 — Chatbots</div>
              <h3>Production LLM assistants, not toy demos.</h3>
              <p>Grounded retrieval, prompt caching, session memory, cost tracking, a clear knowledge boundary. The kind of chatbot you can put in front of customers and not lose sleep over the bill or the answers.</p>
            </article>

            <article className="svc">
              <div className="svc-icon">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="20" cy="20" r="4" />
                  <circle cx="8" cy="8" r="2.5" />
                  <circle cx="32" cy="8" r="2.5" />
                  <circle cx="8" cy="32" r="2.5" />
                  <circle cx="32" cy="32" r="2.5" />
                  <path d="M10 10l7 7M30 10l-7 7M10 30l7-7M30 30l-7-7" />
                </svg>
              </div>
              <div className="svc-num">03 — AI agents</div>
              <h3>Multi-step autonomous workflows that actually finish.</h3>
              <p>Research, outreach, analysis, internal automation. Built on the Claude Agent SDK with tool-use, retries, and observability already wired in — not bolted on after the demo lands.</p>
            </article>

            <article className="svc">
              <div className="svc-icon">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 33V20" />
                  <path d="M13 33V14" />
                  <path d="M21 33V8" />
                  <path d="M29 33V17" />
                  <path d="M5 33h32" />
                  <circle cx="5" cy="20" r="1.4" fill="currentColor" />
                  <circle cx="13" cy="14" r="1.4" fill="currentColor" />
                  <circle cx="21" cy="8" r="1.4" fill="currentColor" />
                  <circle cx="29" cy="17" r="1.4" fill="currentColor" />
                </svg>
              </div>
              <div className="svc-num">04 — Data solutions</div>
              <h3>Bring us a dataset, we tell you what it actually says.</h3>
              <p>Descriptive analytics, cohort analysis, dashboards, insight reports. One-off study or a recurring stream of insight — we own the analysis end-to-end and stand behind the conclusions.</p>
            </article>

            <article className="svc">
              <div className="svc-icon">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="10" cy="10" rx="5" ry="2.5" />
                  <path d="M5 10v6c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-6" />
                  <path d="M5 16v6c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-6" />
                  <path d="M15 18l5 4 5-4" />
                  <path d="M20 22v-6" />
                  <circle cx="30" cy="22" r="5" />
                  <path d="M30 19v6M27 22h6" />
                </svg>
              </div>
              <div className="svc-num">05 — ML pipelines</div>
              <h3>From raw data to served prediction.</h3>
              <p>Model training, evaluation, monitoring, deployment. We build the pipeline, not the notebook. If it can't be retrained next quarter without us in the room, we haven't finished the job.</p>
            </article>

            <article className="svc">
              <div className="svc-icon">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="12" y="4" width="16" height="32" rx="3" />
                  <path d="M12 9h16" />
                  <path d="M12 31h16" />
                  <circle cx="20" cy="33.5" r="0.9" fill="currentColor" />
                </svg>
              </div>
              <div className="svc-num">06 — App development</div>
              <h3>Native iOS and Android, cross-platform when it fits.</h3>
              <p>We pick the stack the engagement actually needs — not the one with the busiest GitHub. The phone is a hard surface; the app should feel like it belongs there.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ─── How we work — 4 beats ───────────────────────── */}
      <section className="section" id="how">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">How we work</div>
            <h2 className="section-title">Challenge first. <em>Then build.</em></h2>
            <p className="section-sub">Every engagement, four beats — in this order. It's how we keep the work honest and the decisions yours.</p>
          </div>

          <div className="beats">
            <div className="beat">
              <div className="beat-icon">
                <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="15" cy="15" r="9" />
                  <path d="M22 22l7 7" />
                  <path d="M11 15h8M15 11v8" />
                </svg>
              </div>
              <div className="beat-num">01 / Diagnose</div>
              <h3>Diagnose &amp; challenge.</h3>
              <p>We assess what's working, what isn't, and what we'd do differently. Before any roadmap, before any sprint plan.</p>
            </div>
            <div className="beat">
              <div className="beat-icon">
                <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 5L4 30h28L18 5z" />
                  <path d="M18 14v8" />
                  <circle cx="18" cy="26" r="0.9" fill="currentColor" />
                </svg>
              </div>
              <div className="beat-num">02 / Risk</div>
              <h3>Say what creates risk.</h3>
              <p>Always &ldquo;this creates risk because…&rdquo;, never &ldquo;this is wrong&rdquo;. Risk is specific, attributable, and discussable. Opinion isn't.</p>
            </div>
            <div className="beat">
              <div className="beat-icon">
                <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6v6" />
                  <path d="M18 12L9 22v6h18v-6L18 12z" />
                  <path d="M9 28h18" />
                  <circle cx="18" cy="6" r="1.4" fill="currentColor" />
                </svg>
              </div>
              <div className="beat-num">03 / Alternatives</div>
              <h3>Present alternatives with reasoning.</h3>
              <p>Critique paired with constructive options and tradeoffs. You see the route we'd take and the one we'd pass on, with the why for each.</p>
            </div>
            <div className="beat">
              <div className="beat-icon">
                <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="18" r="12" />
                  <path d="M18 11v7l5 3" />
                </svg>
              </div>
              <div className="beat-num">04 / Decision</div>
              <h3>Decision pause.</h3>
              <p>You don't need to decide now. Take time. We're happy to proceed either way — that's the point of doing this in the open.</p>
            </div>
          </div>

          <div className="quote-band">
            <blockquote>Projects end; responsibility doesn't.</blockquote>
          </div>
        </div>
      </section>

      {/* ─── Engagement modes ────────────────────────────── */}
      <section className="section" id="engage">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">How we engage</div>
            <h2 className="section-title">Three modes. <em>You pick one.</em></h2>
            <p className="section-sub">No bundles, no upsell. Each mode is its own contract, scoped to what you actually need.</p>
          </div>

          <div className="modes">
            <article className="mode">
              <div className="mode-icon">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="20" cy="14" r="6" />
                  <path d="M8 33c0-6 5-10 12-10s12 4 12 10" />
                  <path d="M27 8l3 3 5-5" />
                </svg>
              </div>
              <div className="mode-label">Mode 01</div>
              <h3>Consulting only.</h3>
              <p>Strategic advice and challenge. We pressure-test the plan, the architecture, the team — without picking up a keyboard.</p>
              <ul>
                <li>Diagnostic engagements</li>
                <li>Architecture &amp; data review</li>
                <li>Hiring and team shape</li>
              </ul>
            </article>

            <article className="mode">
              <div className="mode-icon">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 12L5 20l9 8" />
                  <path d="M26 12l9 8-9 8" />
                  <path d="M23 8l-6 24" />
                </svg>
              </div>
              <div className="mode-label">Mode 02</div>
              <h3>Build only.</h3>
              <p>You bring the spec, we deliver. Senior engineers, weekly visibility, code we'd be willing to maintain after the handover.</p>
              <ul>
                <li>Fixed-scope delivery</li>
                <li>Specialist squads</li>
                <li>Direct access to the people writing the code</li>
              </ul>
            </article>

            <article className="mode">
              <div className="mode-icon">
                <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="20" r="3" />
                  <circle cx="20" cy="20" r="3" />
                  <circle cx="32" cy="20" r="3" />
                  <path d="M11 20h6M23 20h6" />
                  <path d="M8 14V8M20 14V8M32 14V8" />
                  <path d="M5 8h6M17 8h6M29 8h6" />
                </svg>
              </div>
              <div className="mode-label">Mode 03</div>
              <h3>End-to-end.</h3>
              <p>Strategy, design, build, handoff — under one roof. The mode where the challenge-first delivery pays back the most.</p>
              <ul>
                <li>From hypothesis to live product</li>
                <li>One team, one accountability line</li>
                <li>Documented handover, no lock-in</li>
              </ul>
            </article>
          </div>

          <div className="stewardship">
            <span className="stewardship-tag">Optional</span>
            <p><strong>Stewardship.</strong> A monthly retainer after delivery — we keep eyes on what we built. Patching, monitoring, and the occasional honest call when something's drifting.</p>
          </div>
        </div>
      </section>

      {/* ─── Founders ────────────────────────────────────── */}
      <section className="section" id="founders">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Team</div>
            <h2 className="section-title">Two senior founders. <em>No layers in between.</em></h2>
            <p className="section-sub">When you talk to DS2, you talk to one of these two. That doesn't change as the engagement grows.</p>
          </div>

          <div className="founders">
            <article className="founder">
              <div className="founder-role">Founder</div>
              <h3>Head of Strategy &amp; Consulting.</h3>
              <p>Client relationships, commercial strategy, advisory. The person who asks the uncomfortable questions early, so they're not asked late by someone with less context.</p>
              <div className="founder-loc">Athens · London</div>
            </article>

            <article className="founder">
              <div className="founder-role">Founder</div>
              <h3>Head of Engineering &amp; Data.</h3>
              <p>Architecture, data and ML, technical delivery. The person who decides whether what we're proposing will still be standing in three years — and says so before we ship it.</p>
              <div className="founder-loc">Athens · London</div>
            </article>
          </div>

          <div className="quote-band">
            <blockquote>We don't certify your organisation — we take responsibility for what we build.</blockquote>
          </div>
        </div>
      </section>

      {/* ─── Contact ─────────────────────────────────────── */}
      <section className="section tight" id="contact">
        <div className="wrap">
          <div className="contact-card">
            <h2>Tell us what you're trying to do. <em>We'll be honest about whether we can help.</em></h2>
            <p>Founded 2026. Athens and London. Currently taking on partners for the second half of the year.</p>
            <div className="cta-row">
              <a href="mailto:hello@ds2-consulting.com?subject=Booking%20a%20call" className="btn btn-primary">Book a call</a>
              <a href="mailto:hello@ds2-consulting.com?subject=Project%20brief" className="btn btn-ghost">Send us a brief</a>
            </div>
            <div className="contact-mail">
              <a href="mailto:hello@ds2-consulting.com">hello@ds2-consulting.com</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div>© 2026 DS2 — Digital Solutions Consulting · Athens · London</div>
        <ul className="links">
          <li><a href="#services">Services</a></li>
          <li><a href="#how">How we work</a></li>
          <li><a href="#engage">Engage</a></li>
          <li><a href="mailto:hello@ds2-consulting.com">Contact</a></li>
        </ul>
      </footer>
    </>
  );
}
