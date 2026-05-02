import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { ShaderStage } from "@/components/shader-stage";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DS2 — Digital Solutions Consulting",
  description:
    "A senior team for strategy, engineering, and applied AI. Athens and London.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body>
        {/* Static CSS fallback — paints before JS hydrates / if WebGL fails */}
        <div aria-hidden className="ds-stage" />
        {/* Live shader background — takes over once hydrated */}
        <ShaderStage />
        {children}
      </body>
    </html>
  );
}
