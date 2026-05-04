"use client";
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ProjectId = 0 | 1 | 2 | 3 | 4 | 5;

const PROJECTS = [
  {
    meta: "Fintech · End-to-end · 2026",
    title: "AI underwriting assistant for a regional lender.",
    desc: "A senior loan officer was spending 40% of her week reading the same five document types. We built a tool that pre-extracts and flags risks, then hands the human a draft decision with reasoning. Pilot in eight weeks.",
    stats: [
      ["Time saved / week", "14 hrs"],
      ["Decision accuracy", "+9%"],
      ["Built by", "Two engineers"],
    ],
    bg: "g1",
  },
  {
    meta: "Healthtech · Build · 2026",
    title: "Patient triage chatbot.",
    desc: "Production LLM front-end on a clinical knowledge base. Hard guardrails on what it can and can't answer. Costs tracked per session, escalation paths to humans where it matters.",
    stats: [
      ["Resolved without escalation", "62%"],
      ["Cost per session", "$0.04"],
      ["Compliance review", "Passed"],
    ],
    bg: "g2",
  },
  {
    meta: "Retail · Data · 2026",
    title: "Cohort analytics rebuild.",
    desc: "They had three dashboards that disagreed. We replaced all three with one, plus a quarterly insight memo. The dashboard isn't the product — the decisions it changes are.",
    stats: [
      ["Dashboards retired", "3 → 1"],
      ["Time-to-insight", "-70%"],
      ["Format", "Recurring memo"],
    ],
    bg: "g3",
  },
  {
    meta: "B2B SaaS · Web · 2026",
    title: "Marketing site & design system.",
    desc: "Next.js, custom design system, ships in under 90KB. The site is a product, not a brochure — every page state, error case, and edge route was treated as a UI surface worth designing.",
    stats: [
      ["Lighthouse", "99 / 100 / 100 / 100"],
      ["LCP", "0.6s"],
      ["Stack", "Next.js + Tailwind"],
    ],
    bg: "g4",
  },
  {
    meta: "Logistics · Agents · 2026",
    title: "Operations automation agent.",
    desc: "A multi-step agent that reads incoming dispatch emails, extracts shipment details, files them in the right systems, and flags exceptions. Built on the Claude Agent SDK with full tool-call audit logs.",
    stats: [
      ["Emails handled / day", "1,200+"],
      ["Human review", "8%"],
      ["Tools wired", "7"],
    ],
    bg: "g5",
  },
  {
    meta: "Climate · ML · 2026",
    title: "Forecasting pipeline for energy demand.",
    desc: "From raw meter data to a served prediction endpoint, with retraining and drift monitoring. The team can rebuild and redeploy without us in the room — that was the whole point.",
    stats: [
      ["MAPE", "3.8%"],
      ["Retrain cycle", "Weekly"],
      ["Handover", "Complete"],
    ],
    bg: "g6",
  },
] as const;

export default function HomePage() {
  const [activeProj, setActiveProj] = useState<ProjectId | null>(null);
  const lenisStopRef = useRef<{ stop: () => void; start: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ default: gsap }, { default: ScrollTrigger }, { default: Lenis }, ogl] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
        import("ogl"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      // ─── Lenis smooth scroll ───
      const lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenisStopRef.current = { stop: () => lenis.stop(), start: () => lenis.start() };
      lenis.on("scroll", ScrollTrigger.update);
      const tickerCb = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);

      // ─── OGL shader background — dark iridescent metal sheen ───
      const canvas = document.getElementById("shader-bg") as HTMLCanvasElement | null;
      let rafId = 0;
      const oglDispose: Array<() => void> = [];
      if (canvas) {
        const { Renderer, Program, Mesh, Triangle } = ogl;
        const renderer = new Renderer({ canvas, alpha: false, dpr: Math.min(window.devicePixelRatio, 2) });
        const gl = renderer.gl;
        gl.clearColor(0.039, 0.039, 0.039, 1);
        const geometry = new Triangle(gl);
        const program = new Program(gl, {
          vertex: `
            attribute vec2 position;
            varying vec2 vUv;
            void main() {
              vUv = position * 0.5 + 0.5;
              gl_Position = vec4(position, 0.0, 1.0);
            }
          `,
          fragment: `
            precision highp float;
            varying vec2 vUv;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform vec2 uRes;
            float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
            float noise(vec2 p) {
              vec2 i = floor(p), f = fract(p);
              float a = hash(i), b = hash(i + vec2(1,0)), c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
              vec2 u = f*f*(3.0-2.0*f);
              return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            float fbm(vec2 p) {
              float v = 0.0, a = 0.5;
              for (int i = 0; i < 4; i++) {
                v += a * noise(p);
                p *= 2.0; a *= 0.5;
              }
              return v;
            }
            void main() {
              vec2 uv = vUv;
              vec2 p = uv * 2.0 - 1.0;
              p.x *= uRes.x / uRes.y;
              vec2 m = (uMouse * 2.0 - 1.0);
              m.x *= uRes.x / uRes.y;
              float dToM = length(p - m);
              vec2 flow = vec2(
                fbm(p * 0.8 + uTime * 0.03),
                fbm(p * 0.8 - uTime * 0.025 + 4.0)
              );
              float n = fbm(p * 1.2 + flow * 0.6 + uTime * 0.02);
              n += 0.1 * sin(dToM * 4.0 - uTime * 0.4) * exp(-dToM * 1.2);
              vec3 col = vec3(0.04 + n * 0.06);
              float sheen = smoothstep(0.55, 0.62, n) * 0.12;
              col += vec3(sheen);
              float g = (hash(uv * uRes + uTime) - 0.5) * 0.025;
              col += g;
              col *= 1.0 - 0.4 * length(uv - 0.5);
              gl_FragColor = vec4(col, 1.0);
            }
          `,
          uniforms: {
            uTime: { value: 0 },
            uMouse: { value: [0.5, 0.5] },
            uRes: { value: [1, 1] },
          },
        });
        const mesh = new Mesh(gl, { geometry, program });
        const resize = () => {
          renderer.setSize(window.innerWidth, window.innerHeight);
          program.uniforms.uRes.value = [window.innerWidth, window.innerHeight];
        };
        window.addEventListener("resize", resize);
        resize();

        let mx = 0.5,
          my = 0.5,
          tx = 0.5,
          ty = 0.5;
        const onMove = (e: PointerEvent) => {
          tx = e.clientX / window.innerWidth;
          ty = 1.0 - e.clientY / window.innerHeight;
        };
        window.addEventListener("pointermove", onMove);
        const t0 = performance.now();
        const loop = () => {
          const t = (performance.now() - t0) / 1000;
          mx += (tx - mx) * 0.05;
          my += (ty - my) * 0.05;
          program.uniforms.uTime.value = t;
          program.uniforms.uMouse.value = [mx, my];
          renderer.render({ scene: mesh });
          rafId = requestAnimationFrame(loop);
        };
        loop();

        oglDispose.push(() => {
          cancelAnimationFrame(rafId);
          window.removeEventListener("resize", resize);
          window.removeEventListener("pointermove", onMove);
        });
      }

      // ─── Hash links via Lenis ───
      const hashLinks = Array.from(document.querySelectorAll('a[href^="#"]')) as HTMLAnchorElement[];
      const hashHandlers: Array<[HTMLAnchorElement, (e: Event) => void]> = [];
      hashLinks.forEach((a) => {
        const onClick = (e: Event) => {
          const id = a.getAttribute("href");
          if (!id || id.length <= 1) return;
          const el = document.querySelector(id);
          if (el) {
            e.preventDefault();
            lenis.scrollTo(el as HTMLElement, { offset: -40 });
          }
        };
        a.addEventListener("click", onClick);
        hashHandlers.push([a, onClick]);
      });

      // ─── Hero loaded safety ───
      const showHero = () => document.querySelector(".hero")?.classList.add("loaded");
      const onLoad = () => {
        showHero();
        ScrollTrigger.refresh();
      };
      window.addEventListener("load", onLoad);
      const heroTimeout = setTimeout(() => {
        showHero();
        ScrollTrigger.refresh();
      }, 600);

      // ─── How we work — manifesto reveal ───
      const manifesto = document.getElementById("how-manifesto");
      if (manifesto) {
        ScrollTrigger.create({
          trigger: manifesto,
          start: "top 80%",
          once: true,
          onEnter: () => {
            const rows = manifesto.querySelectorAll(".manifesto-row");
            rows.forEach((row, i) => {
              setTimeout(() => row.classList.add("in"), i * 200);
            });
          },
        });
      }

      // ─── Founders split-seam reveal ───
      const split = document.getElementById("founders-split");
      if (split) {
        ScrollTrigger.create({
          trigger: split,
          start: "top 80%",
          onEnter: () => split.classList.add("is-revealed"),
          onLeaveBack: () => split.classList.remove("is-revealed"),
        });
      }

      // ─── Projects reveal ───
      const projs = Array.from(document.querySelectorAll(".proj")) as HTMLElement[];
      projs.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => setTimeout(() => el.classList.add("in"), i * 70),
        });
      });

      // ─── Services — staggered entry + cursor spotlight ───
      const svcs = Array.from(document.querySelectorAll(".svc")) as HTMLElement[];
      const svcHandlers: Array<[HTMLElement, (e: PointerEvent) => void]> = [];
      svcs.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => setTimeout(() => el.classList.add("in"), i * 90),
        });
        const onPointer = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
          el.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
        };
        el.addEventListener("pointermove", onPointer);
        svcHandlers.push([el, onPointer]);
      });

      // ─── Compose typewriter — types subject + body when contact section in view ───
      const subjectEl = document.getElementById("compose-subject");
      const bodyEl = document.getElementById("compose-body");
      const statusEl = document.getElementById("compose-status");
      const contactSection = document.getElementById("contact");
      let typeAbort = { aborted: false };
      if (subjectEl && bodyEl && contactSection) {
        const draft = {
          subject: "We need an AI underwriting copilot, not a chatbot.",
          body: [
            "Hi DS2 — we're a <hl>regional lender</hl> in the Midwest. Our senior loan officers are spending almost half their week reading the same five document types over and over.",
            "We've trialled two off-the-shelf tools. Both hallucinate, neither integrates with our core. We need <hl>a real internal tool</hl> our team can trust on a Monday morning.",
            "Can we book 30 minutes next week?",
          ],
        };
        const setHTML = (el: Element, text: string, withCaret = false) => {
          const html = text
            .replace(/&/g, "&amp;")
            .replace(/<hl>/g, "\u0001")
            .replace(/<\/hl>/g, "\u0002")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\u0001/g, '<span class="hl">')
            .replace(/\u0002/g, "</span>");
          el.innerHTML = html + (withCaret ? '<span class="caret"></span>' : "");
        };
        const typeInto = async (el: Element, text: string, speed = 8) => {
          let out = "";
          for (let i = 0; i < text.length; i++) {
            if (typeAbort.aborted) return;
            const rest = text.slice(i);
            if (rest.startsWith("<hl>")) {
              out += "<hl>";
              i += 3;
              continue;
            }
            if (rest.startsWith("</hl>")) {
              out += "</hl>";
              i += 4;
              continue;
            }
            out += text[i];
            setHTML(el, out, true);
            const ch = text[i];
            let delay = speed + Math.random() * 6;
            if (ch === "," || ch === ".") delay += 35;
            if (ch === " ") delay = speed * 0.5;
            await new Promise((r) => setTimeout(r, delay));
          }
          setHTML(el, out, true);
        };
        let started = false;
        const start = async () => {
          if (started) return;
          started = true;
          if (statusEl) statusEl.textContent = "Drafting · Athens / London";
          bodyEl.innerHTML = "";
          await typeInto(subjectEl, draft.subject, 9);
          if (typeAbort.aborted) return;
          setHTML(subjectEl, draft.subject, false);
          for (let p = 0; p < draft.body.length; p++) {
            if (typeAbort.aborted) return;
            const paragraph = draft.body[p];
            if (!paragraph) continue;
            const pEl = document.createElement("p");
            bodyEl.appendChild(pEl);
            if (p > 0) {
              const prev = bodyEl.children[p - 1];
              if (prev) prev.innerHTML = prev.innerHTML.replace(/<span class="caret"><\/span>/, "");
            }
            await typeInto(pEl, paragraph, 6);
            await new Promise((r) => setTimeout(r, 120));
          }
          if (statusEl && !typeAbort.aborted) statusEl.textContent = "Ready to send · Athens / London";
        };
        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                start();
                obs.disconnect();
              }
            });
          },
          { threshold: 0.2 }
        );
        obs.observe(contactSection);

        cleanup = () => {
          cancelled = true;
          typeAbort.aborted = true;
          obs.disconnect();
          oglDispose.forEach((fn) => fn());
          window.removeEventListener("load", onLoad);
          clearTimeout(heroTimeout);
          hashHandlers.forEach(([a, h]) => a.removeEventListener("click", h));
          svcHandlers.forEach(([el, h]) => el.removeEventListener("pointermove", h));
          ScrollTrigger.getAll().forEach((st) => st.kill());
          gsap.ticker.remove(tickerCb);
          lenis.destroy();
        };
        return;
      }

      cleanup = () => {
        cancelled = true;
        oglDispose.forEach((fn) => fn());
        window.removeEventListener("load", onLoad);
        clearTimeout(heroTimeout);
        hashHandlers.forEach(([a, h]) => a.removeEventListener("click", h));
        svcHandlers.forEach(([el, h]) => el.removeEventListener("pointermove", h));
        ScrollTrigger.getAll().forEach((st) => st.kill());
        gsap.ticker.remove(tickerCb);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  // Modal lock scroll
  useEffect(() => {
    if (activeProj !== null) {
      lenisStopRef.current?.stop();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setActiveProj(null);
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    } else {
      lenisStopRef.current?.start();
    }
  }, [activeProj]);

  const proj = activeProj !== null ? PROJECTS[activeProj] : null;

  return (
    <>
      <canvas id="shader-bg" />

      <nav className="top">
        <div className="nav-inner">
          <a href="#top" className="nav-mark">
            <Image src="/logos/ds2-logo.png" alt="DS2" width={1136} height={285} priority style={{ height: 26, width: "auto", display: "block", opacity: 0.96 }} />
          </a>
          <ul className="nav-links">
            <li><a href="#services">Services</a></li>
            <li><a href="#how">How we work</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#engage">Engage</a></li>
            <li><a href="#founders">Team</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      <a id="top" />

      {/* ─── Hero ────────────────────────────────────── */}
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

      {/* ─── Services — editorial expanding rows ───── */}
      <section className="section" id="services">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Services</div>
            <h2 className="section-title">Six things we build, <em>and we build them seriously.</em></h2>
            <p className="section-sub">No menu padding. Each of these is something we'd take responsibility for end-to-end, or refuse the engagement.</p>
          </div>
          <div className="services-stage">
            <div className="services" id="services-grid">
              <article className="svc">
                <div className="svc-num-big">01</div>
                <div className="svc-main">
                  <div className="svc-title"><span className="svc-kind">Websites</span></div>
                  <h3>Marketing and product sites in Next.js / React.</h3>
                  <p className="svc-desc">Fast, accessible, on-brand, hosted on premium infrastructure. We don't build template sites with plugins glued together — we ship code we'd be willing to maintain ourselves.</p>
                </div>
                <div className="svc-icon">
                  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="7" width="30" height="22" rx="2"/><path d="M5 13h30"/><circle cx="9" cy="10" r="0.7" fill="currentColor"/><circle cx="12" cy="10" r="0.7" fill="currentColor"/><path d="M14 33h12"/><path d="M20 29v4"/></svg>
                </div>
              </article>
              <article className="svc">
                <div className="svc-num-big">02</div>
                <div className="svc-main">
                  <div className="svc-title"><span className="svc-kind">Chatbots</span></div>
                  <h3>Production LLM assistants, not toy demos.</h3>
                  <p className="svc-desc">Grounded retrieval, prompt caching, session memory, cost tracking, a clear knowledge boundary. The kind of chatbot you can put in front of customers and not lose sleep over the bill or the answers.</p>
                </div>
                <div className="svc-icon">
                  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 9h20a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4H17l-6 5v-5H7a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4z"/><circle cx="13" cy="17.5" r="1" fill="currentColor"/><circle cx="19" cy="17.5" r="1" fill="currentColor"/><circle cx="25" cy="17.5" r="1" fill="currentColor"/></svg>
                </div>
              </article>
              <article className="svc">
                <div className="svc-num-big">03</div>
                <div className="svc-main">
                  <div className="svc-title"><span className="svc-kind">AI agents</span></div>
                  <h3>Multi-step autonomous workflows that actually finish.</h3>
                  <p className="svc-desc">Research, outreach, analysis, internal automation. Built on the Claude Agent SDK with tool-use, retries, and observability already wired in — not bolted on after the demo lands.</p>
                </div>
                <div className="svc-icon">
                  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="20" cy="20" r="4"/><circle cx="8" cy="8" r="2.5"/><circle cx="32" cy="8" r="2.5"/><circle cx="8" cy="32" r="2.5"/><circle cx="32" cy="32" r="2.5"/><path d="M10 10l7 7M30 10l-7 7M10 30l7-7M30 30l-7-7"/></svg>
                </div>
              </article>
              <article className="svc">
                <div className="svc-num-big">04</div>
                <div className="svc-main">
                  <div className="svc-title"><span className="svc-kind">Data solutions</span></div>
                  <h3>Bring us a dataset, we tell you what it actually says.</h3>
                  <p className="svc-desc">Descriptive analytics, cohort analysis, dashboards, insight reports. One-off study or a recurring stream of insight — we own the analysis end-to-end and stand behind the conclusions.</p>
                </div>
                <div className="svc-icon">
                  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 33V20"/><path d="M13 33V14"/><path d="M21 33V8"/><path d="M29 33V17"/><path d="M5 33h32"/><circle cx="5" cy="20" r="1.4" fill="currentColor"/><circle cx="13" cy="14" r="1.4" fill="currentColor"/><circle cx="21" cy="8" r="1.4" fill="currentColor"/><circle cx="29" cy="17" r="1.4" fill="currentColor"/></svg>
                </div>
              </article>
              <article className="svc">
                <div className="svc-num-big">05</div>
                <div className="svc-main">
                  <div className="svc-title"><span className="svc-kind">ML pipelines</span></div>
                  <h3>From raw data to served prediction.</h3>
                  <p className="svc-desc">Model training, evaluation, monitoring, deployment. We build the pipeline, not the notebook. If it can't be retrained next quarter without us in the room, we haven't finished the job.</p>
                </div>
                <div className="svc-icon">
                  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="10" cy="10" rx="5" ry="2.5"/><path d="M5 10v6c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-6"/><path d="M5 16v6c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-6"/><path d="M15 18l5 4 5-4"/><path d="M20 22v-6"/><circle cx="30" cy="22" r="5"/><path d="M30 19v6M27 22h6"/></svg>
                </div>
              </article>
              <article className="svc">
                <div className="svc-num-big">06</div>
                <div className="svc-main">
                  <div className="svc-title"><span className="svc-kind">App development</span></div>
                  <h3>Native iOS and Android, cross-platform when it fits.</h3>
                  <p className="svc-desc">We pick the stack the engagement actually needs — not the one with the busiest GitHub. The phone is a hard surface; the app should feel like it belongs there.</p>
                </div>
                <div className="svc-icon">
                  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="12" y="4" width="16" height="32" rx="3"/><path d="M12 9h16"/><path d="M12 31h16"/><circle cx="20" cy="33.5" r="0.9" fill="currentColor"/></svg>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How we work — manifesto ─────────────────── */}
      <section className="section" id="how">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">How we work</div>
            <h2 className="section-title">Four principles, in our <em>own voice.</em></h2>
            <p className="section-sub">Not a methodology. The actual rules we hold ourselves to — written so you can hold us to them too.</p>
          </div>
          <div className="how-manifesto" id="how-manifesto">
            <article className="manifesto-row" data-row="0">
              <div className="manifesto-num-wrap">
                <span className="manifesto-num">01</span>
                <div className="manifesto-rule" />
                <div className="manifesto-tag">Principle</div>
              </div>
              <div className="manifesto-content">
                <h3 className="manifesto-title">Diagnose <em>before</em> you build.</h3>
                <p className="manifesto-body">The first two weeks of every engagement go to understanding what you actually have. Code, data, team shape, decisions in flight — we read it all before we propose anything. <strong>We've inherited too many projects where the previous team built the wrong thing perfectly.</strong></p>
                <div className="manifesto-aside">In practice: a written diagnostic memo, not a slide deck.</div>
              </div>
            </article>
            <article className="manifesto-row" data-row="1">
              <div className="manifesto-num-wrap">
                <span className="manifesto-num">02</span>
                <div className="manifesto-rule" />
                <div className="manifesto-tag">Principle</div>
              </div>
              <div className="manifesto-content">
                <h3 className="manifesto-title">Frame critique as <em>risk.</em></h3>
                <p className="manifesto-body">"Wrong" is rarely useful. "Risky" is. We don't tell you your architecture is wrong — we tell you <strong>where it creates risk under load, what the blast radius looks like, and which fix gives you the most leverage</strong>. You decide what you can live with.</p>
                <div className="manifesto-aside">In practice: every concern paired with a probability and a mitigation.</div>
              </div>
            </article>
            <article className="manifesto-row" data-row="2">
              <div className="manifesto-num-wrap">
                <span className="manifesto-num">03</span>
                <div className="manifesto-rule" />
                <div className="manifesto-tag">Principle</div>
              </div>
              <div className="manifesto-content">
                <h3 className="manifesto-title">Never criticize without <em>alternatives.</em></h3>
                <p className="manifesto-body">A list of problems isn't a contribution. We bring at least <strong>two paths forward — usually a fast one and a careful one</strong> — with the tradeoffs spelled out in language your CFO will understand. Critique without alternatives is just complaining.</p>
                <div className="manifesto-aside">In practice: we'd rather propose nothing than propose without options.</div>
              </div>
            </article>
            <article className="manifesto-row" data-row="3">
              <div className="manifesto-num-wrap">
                <span className="manifesto-num">04</span>
                <div className="manifesto-rule" />
                <div className="manifesto-tag">Principle</div>
              </div>
              <div className="manifesto-content">
                <h3 className="manifesto-title">Take a week to <em>decide.</em></h3>
                <p className="manifesto-body">We don't write proposals with expiry dates. The decision to start is more important than the speed of starting. If you need to sleep on it, sleep on it. <strong>We'd rather hear no slowly than yes too quickly.</strong></p>
                <div className="manifesto-aside">In practice: no scarcity tactics, ever — even when our calendar is full.</div>
              </div>
            </article>
          </div>
          <div className="how-coda">
            <blockquote>Projects end; responsibility doesn't.</blockquote>
            <div className="how-coda-cite">— DS2 working principles, line 04</div>
          </div>
        </div>
      </section>

      {/* ─── Thesis ──────────────────────────────────── */}
      <section className="thesis-section" id="thesis">
        <figure className="thesis">
          <div className="thesis-eyebrow">A working principle</div>
          <blockquote>The biggest cost is <em>lack of knowledge</em>.</blockquote>
          <figcaption>— DS2</figcaption>
        </figure>
      </section>

      {/* ─── Projects ────────────────────────────────── */}
      <section className="section" id="projects">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Selected work</div>
            <h2 className="section-title">Recent projects, <em>quietly delivered.</em></h2>
            <p className="section-sub">Six engagements from our first months. Names redacted on request — happy to walk through the detail under NDA.</p>
          </div>
          <div className="projects" id="projects-grid">
            {PROJECTS.map((p, i) => {
              const sizeClass = ["size-a", "size-b", "size-c", "size-d", "size-e", "size-f"][i];
              return (
                <article key={i} className={`proj ${sizeClass}`} onClick={() => setActiveProj(i as ProjectId)}>
                  <div className={`proj-bg ${p.bg}`} />
                  <div className="proj-info">
                    <div>
                      <div className="meta">{p.meta}</div>
                      <h3>{p.title}</h3>
                    </div>
                    <div className="proj-arrow">→</div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Modal ───────────────────────────────────── */}
      <div className={`modal ${activeProj !== null ? "is-open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setActiveProj(null); }}>
        <div className="modal-card">
          <div className={`modal-cover ${proj?.bg ?? ""}`} />
          <button className="modal-close" aria-label="Close" onClick={() => setActiveProj(null)}>✕</button>
          <div className="modal-body">
            <div className="meta">{proj?.meta}</div>
            <h2>{proj?.title}</h2>
            <p>{proj?.desc}</p>
            <div className="modal-stats">
              {proj?.stats.map(([label, value]) => (
                <div key={label} className="modal-stat">
                  <div className="label">{label}</div>
                  <div className="value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Engage ──────────────────────────────────── */}
      <section className="section" id="engage">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">How we engage</div>
            <h2 className="section-title">Three modes. <em>You pick one.</em></h2>
            <p className="section-sub">No bundles, no upsell. Each mode is its own contract, scoped to what you actually need.</p>
          </div>
          <div className="modes">
            <article className="mode m1">
              <div className="mode-head">
                <div className="mode-head-text">
                  <div className="mode-num">MODE 01</div>
                  <h3>Consulting only.</h3>
                  <div className="mode-best"><strong>Best for:</strong> teams who already build, but want a second pair of senior eyes.</div>
                </div>
                <div className="mode-bigfig">01</div>
              </div>
              <p>Strategic advice and challenge. We pressure-test the plan, the architecture, the team — without picking up a keyboard.</p>
              <div className="mode-stack">
                <div className="stack-row on"><div className="stack-marker" /><div className="stack-label">Strategy &amp; diagnostic</div><div className="stack-tag">included</div></div>
                <div className="stack-row"><div className="stack-marker" /><div className="stack-label">Build &amp; delivery</div><div className="stack-tag">—</div></div>
                <div className="stack-row"><div className="stack-marker" /><div className="stack-label">Handover docs</div><div className="stack-tag">—</div></div>
                <div className="stack-row"><div className="stack-marker" /><div className="stack-label">Stewardship</div><div className="stack-tag">add-on</div></div>
              </div>
              <div className="mode-foot">
                <a className="mode-cta" href="mailto:hello@ds2-consulting.com?subject=Consulting%20engagement">
                  <span>Start with consulting</span>
                  <span className="mode-cta-arrow" />
                </a>
              </div>
            </article>

            <article className="mode m2">
              <div className="mode-head">
                <div className="mode-head-text">
                  <div className="mode-num">MODE 02</div>
                  <h3>Build only.</h3>
                  <div className="mode-best"><strong>Best for:</strong> when the spec is clear and you need senior hands to ship it.</div>
                </div>
                <div className="mode-bigfig">02</div>
              </div>
              <p>You bring the spec, we deliver. Senior engineers, weekly visibility, code we'd be willing to maintain after the handover.</p>
              <div className="mode-stack">
                <div className="stack-row"><div className="stack-marker" /><div className="stack-label">Strategy &amp; diagnostic</div><div className="stack-tag">—</div></div>
                <div className="stack-row on"><div className="stack-marker" /><div className="stack-label">Build &amp; delivery</div><div className="stack-tag">included</div></div>
                <div className="stack-row on"><div className="stack-marker" /><div className="stack-label">Handover docs</div><div className="stack-tag">included</div></div>
                <div className="stack-row"><div className="stack-marker" /><div className="stack-label">Stewardship</div><div className="stack-tag">add-on</div></div>
              </div>
              <div className="mode-foot">
                <a className="mode-cta" href="mailto:hello@ds2-consulting.com?subject=Build%20engagement">
                  <span>Start with a build</span>
                  <span className="mode-cta-arrow" />
                </a>
              </div>
            </article>

            <article className="mode m3">
              <div className="mode-head">
                <div className="mode-head-text">
                  <div className="mode-num">MODE 03</div>
                  <h3>End-to-end.</h3>
                  <div className="mode-best"><strong>Best for:</strong> early ideas, ambiguous problems, full accountability under one roof.</div>
                </div>
                <div className="mode-bigfig">03</div>
              </div>
              <p>Strategy, design, build, handoff — under one roof. The mode where the challenge-first delivery pays back the most.</p>
              <div className="mode-stack">
                <div className="stack-row on"><div className="stack-marker" /><div className="stack-label">Strategy &amp; diagnostic</div><div className="stack-tag">included</div></div>
                <div className="stack-row on"><div className="stack-marker" /><div className="stack-label">Build &amp; delivery</div><div className="stack-tag">included</div></div>
                <div className="stack-row on"><div className="stack-marker" /><div className="stack-label">Handover docs</div><div className="stack-tag">included</div></div>
                <div className="stack-row on"><div className="stack-marker" /><div className="stack-label">Stewardship</div><div className="stack-tag">included</div></div>
              </div>
              <div className="mode-foot">
                <a className="mode-cta" href="mailto:hello@ds2-consulting.com?subject=End-to-end%20engagement">
                  <span>Take it end-to-end</span>
                  <span className="mode-cta-arrow" />
                </a>
              </div>
            </article>
          </div>
          <div className="stewardship">
            <span className="stewardship-tag">Optional</span>
            <p><strong>Stewardship.</strong> A monthly retainer after delivery — we keep eyes on what we built. Patching, monitoring, and the occasional honest call when something's drifting.</p>
          </div>
        </div>
      </section>

      {/* ─── Founders ────────────────────────────────── */}
      <section className="section" id="founders">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Team</div>
            <h2 className="section-title">Two senior founders. <em>No layers in between.</em></h2>
            <p className="section-sub">When you talk to DS2, you talk to one of these two. That doesn't change as the engagement grows.</p>
          </div>
          <div className="founders-split" id="founders-split">
            <article className="founder-half left">
              <div className="photo" />
              <div className="founder-role">Founder</div>
              <h3>Head of Strategy &amp; Consulting.</h3>
              <p>Client relationships, commercial strategy, advisory. The person who asks the uncomfortable questions early, so they're not asked late by someone with less context.</p>
              <div className="founder-loc">Athens</div>
            </article>
            <article className="founder-half right">
              <div className="photo" />
              <div className="founder-role">Founder</div>
              <h3>Head of Engineering &amp; Data.</h3>
              <p>Architecture, data and ML, technical delivery. The person who decides whether what we're proposing will still be standing in three years — and says so before we ship it.</p>
              <div className="founder-loc">London</div>
            </article>
          </div>
          <div className="quote-band" style={{ marginTop: 56 }}>
            <blockquote>We don't certify your organisation — we take responsibility for what we build.</blockquote>
          </div>
        </div>
      </section>

      {/* ─── Contact — macOS Mail compose ────────────── */}
      <section className="section" id="contact">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Contact</div>
            <h2 className="section-title">Tell us what you're <em>actually</em> trying to do.</h2>
            <p className="section-sub">Three lines is enough. We'll write back within the week — usually the same day.</p>
          </div>
          <div className="compose-shell">
            <div className="compose-window">
              <div className="compose-titlebar">
                <div className="traffic-lights"><span /><span /><span /></div>
                <div className="compose-title">New Message</div>
                <div />
              </div>
              <div className="compose-toolbar">
                <div className="toolbar-btn" title="Attach"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.5l-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8L13.7 4.7a3.5 3.5 0 0 1 5 5L9.9 18.5a1.5 1.5 0 0 1-2.1-2.1L16 8.2"/></svg></div>
                <div className="toolbar-btn" title="Format"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"/></svg></div>
                <div className="toolbar-btn" title="Image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5L5 20"/></svg></div>
                <div className="toolbar-divider" />
                <div className="toolbar-btn" title="Sign"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17c4-1 6-9 9-9s4 8 9 9"/><path d="M3 21h18"/></svg></div>
                <div className="toolbar-btn" title="Stationery"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg></div>
                <div style={{ flex: 1 }} />
                <div className="toolbar-btn" title="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg></div>
              </div>
              <div className="compose-headers">
                <div className="row">
                  <span className="label">From:</span>
                  <span className="value">you@yourcompany.com</span>
                </div>
                <div className="row">
                  <span className="label">To:</span>
                  <span className="value"><span className="pill">hello@ds2-consulting.com</span></span>
                </div>
                <div className="row">
                  <span className="label">Subject:</span>
                  <span className="value" id="compose-subject" />
                </div>
              </div>
              <div className="compose-body" id="compose-body" />
              <div className="compose-footer">
                <div className="compose-foot-meta">
                  <span className="dot" />
                  <span id="compose-status">Drafting · Athens / London</span>
                </div>
                <div className="compose-actions">
                  <a href="mailto:hello@ds2-consulting.com?subject=Project%20brief" className="btn-mac btn-mac-ghost">Save draft</a>
                  <a href="mailto:hello@ds2-consulting.com?subject=Booking%20a%20call" className="btn-mac btn-mac-primary">Send <kbd>⌘↵</kbd></a>
                </div>
              </div>
            </div>
            <div className="compose-caption">
              {"// Founded 2026 — taking on partners through Q4. Or just write us at "}
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
          <li><a href="#projects">Projects</a></li>
          <li><a href="mailto:hello@ds2-consulting.com">Contact</a></li>
        </ul>
      </footer>
    </>
  );
}
