import type { Metadata } from "next";
import "./globals.css";
import { CanvasBackground } from "@/components/canvas-background";

export const metadata: Metadata = {
  title: "DS — Digital Solutions Consultancy",
  description:
    "Athens–London based. We advise, design, and build digital products — consulting-only, build-only, or end-to-end. Challenge-first, transparent delivery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-transparent text-white font-sans antialiased selection:bg-blue-500/30 relative">
        <CanvasBackground />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
