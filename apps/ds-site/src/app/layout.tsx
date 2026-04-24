import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DS — Digital Solutions Consultancy",
  description:
    "Athens–London based. We advise, design, and build digital products — consulting-only, build-only, or end-to-end. Challenge-first, transparent delivery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
