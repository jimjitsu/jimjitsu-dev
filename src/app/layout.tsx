import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { Sidebar } from "@/components/sidebar";
import { SidebarShell } from "@/components/sidebar-shell";
import { SITE_URL } from "@/lib/constants";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jim Tierney — Frontend Engineer",
    template: "%s · Jim Tierney",
  },
  description:
    "Portfolio and blog of Jim Tierney, frontend engineer focused on fast, accessible, component-driven UIs.",
  openGraph: {
    siteName: "Jim Tierney",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh bg-base font-mono text-ink antialiased">
        <SidebarShell>
          <Sidebar />
        </SidebarShell>
        <div className="lg:pl-72">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
