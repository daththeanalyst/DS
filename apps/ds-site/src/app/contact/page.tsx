import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Contact — DS2 Digital Solutions",
  description: "Tell us what you want to build. Book a call or send us a brief.",
};

const EMAIL = "hello@ds2-consulting.com";

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[100svh] flex items-center justify-center px-6 py-24">
        <div className="max-w-xl w-full text-center">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">
            Contact us
          </h1>
          <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed">
            Tell us about any digital solution you want us to build. Book a call,
            or send us a brief — whichever you prefer.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${EMAIL}?subject=${encodeURIComponent("Book a call")}`}
              className="rounded-full bg-white text-ink-950 px-6 py-3 font-medium hover:bg-ink-100 transition-colors text-sm"
            >
              Book a call
            </a>
            <a
              href={`mailto:${EMAIL}?subject=${encodeURIComponent("Project brief")}`}
              className="rounded-full border border-white/40 text-white px-6 py-3 font-medium hover:bg-white/10 transition-colors text-sm"
            >
              Send us a brief
            </a>
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.28em] text-white/40">
            {EMAIL}
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
