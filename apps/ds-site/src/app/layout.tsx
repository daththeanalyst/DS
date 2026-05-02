import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DS2 — Digital Solutions Consulting",
  description:
    "Athens–London. Tell us about any digital solution you want us to build.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ink-950 text-white font-sans antialiased selection:bg-blue-500/30">
        <div aria-hidden className="ds-stage" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
