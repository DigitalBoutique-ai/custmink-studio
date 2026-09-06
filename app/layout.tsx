import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

import "./globals.css";
import { PRODUCT_NAME_TM, PRODUCT_TAGLINE } from "@/lib/brand";

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
    <html lang="en">
      <body>
        {/* Inside <body>, static by default: it must not opt public routes into dynamic rendering. */}
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
