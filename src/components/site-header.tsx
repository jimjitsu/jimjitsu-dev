import Link from "next/link";
import { getSiteSettings } from "@/lib/contentful";

const FALLBACK_NAV = [
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export async function SiteHeader() {
  const settings = await getSiteSettings();
  const navLinks = settings?.fields.navLinks ?? FALLBACK_NAV;

  return (
    <header className="border-b-2 border-neutral-900 dark:border-neutral-100">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight"
          aria-label="Jim Tierney — home"
        >
          Jim Tierney
        </Link>
        <nav aria-label="Primary">
          <ul className="flex gap-6 font-eyebrow text-xs uppercase tracking-[0.2em]">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
