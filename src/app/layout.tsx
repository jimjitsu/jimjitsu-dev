import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "Jim Tierney — Frontend Engineer",
    template: "%s · Jim Tierney",
  },
  description:
    "Portfolio and blog of Jim Tierney, frontend engineer focused on fast, accessible, component-driven UIs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh bg-neutral-50 font-mono text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
