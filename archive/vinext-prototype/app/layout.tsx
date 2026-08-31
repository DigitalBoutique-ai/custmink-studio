import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Custm.ink Studio | AI Tech Pack Builder",
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
      <body>{children}</body>
    </html>
  );
}
