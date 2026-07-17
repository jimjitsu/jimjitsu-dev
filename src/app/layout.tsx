import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { Sidebar } from "@/components/sidebar";
import { SidebarShell } from "@/components/sidebar-shell";
import { ChatWidget } from "@/components/chat-widget";
import { SITE_URL } from "@/lib/constants";
import { getSiteSettings, resolveAssetUrl } from "@/lib/contentful";
import { Analytics } from "@vercel/analytics/next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5EFE0" },
    { media: "(prefers-color-scheme: dark)", color: "#15110D" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  // Default share image: the CMS-managed ogImage if set, else the generated /og card.
  let ogImage = "/og";
  try {
    const settings = await getSiteSettings();
    const asset = settings?.fields.ogImage;
    if (asset && "fields" in asset) {
      ogImage = resolveAssetUrl(asset.fields.file?.url) ?? ogImage;
    }
  } catch {
    // Contentful unavailable — fall back to the generated card.
  }

  return {
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
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
    alternates: {
      types: {
        "application/rss+xml": `${SITE_URL}/rss.xml`,
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      {/* suppressHydrationWarning tolerates attributes that browser extensions
          (Grammarly, password managers, etc.) inject into <body> before React
          hydrates — without it, that mismatch aborts root hydration and leaves
          the page non-interactive. */}
      <body className="min-h-dvh bg-base font-mono text-ink antialiased" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:border-2 focus:border-ink focus:bg-base focus:px-4 focus:py-2 focus:font-eyebrow focus:text-sm focus:text-ink"
        >
          Skip to content
        </a>
        <SidebarShell>
          <Sidebar />
        </SidebarShell>
        <div id="main-content" tabIndex={-1} className="outline-none lg:pl-72">
          {children}
        </div>
        <ChatWidget />
        <Analytics />
      </body>
    </html>
  );
}
