import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

import "./globals.css";
import { PRODUCT_NAME_TM, PRODUCT_TAGLINE } from "@/lib/brand";

/*
 * DESIGN.md typefaces, self-hosted by next/font at build time and exposed as
 * variables only — `--font-ui` / `--font-display` in globals.css pick them up
 * inside the product shells; the marketing site keeps its own stack.
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: `${PRODUCT_NAME_TM} | ${PRODUCT_TAGLINE}`,
  description:
    "Build factory-ready apparel tech packs with AI-assisted sketches, measurements, BOMs, artwork placement, sampling, and supplier handoff.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        {/* Inside <body>, static by default: it must not opt public routes into dynamic rendering. */}
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
