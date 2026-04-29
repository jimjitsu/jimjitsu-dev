import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/contentful";
import { BowlingBallIcon } from "./icons";
import { CONTACT_EMAIL } from "@/lib/constants";

const FALLBACK_NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export async function Sidebar() {
  const settings = await getSiteSettings();
  const navLinks = settings?.fields.navLinks ?? FALLBACK_NAV;
  const social = settings?.fields.socialLinks ?? {};
  const socialEntries = Object.entries(social);

  return (
    <div className="flex h-full flex-col">
      {/* Logo — full-bleed at top, no padding. Image is square; renders as
          a square block at the sidebar's full width. */}
      <Link href="/" aria-label="Jim Tierney — home" className="block">
        <Image
          src="/jim-jitsu-jpg.jpg"
          alt="Jim Tierney"
          width={600}
          height={600}
          priority
          className="h-auto w-full"
        />
      </Link>

      {/* Everything below the logo gets the standard padding. */}
      <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
        {/* Intro line. */}
        <div className="flex flex-col gap-1.5">
          <p className="font-display text-3xl leading-none tracking-tight text-neutral-900">
            Jim Tierney
          </p>
          <p className="text-sm leading-snug text-neutral-600">
            Frontend developer, jiu jitsu practitioner, and occasional artist of the non-martial variety in Milwaukee, WI
          </p>
        </div>

        <hr className="my-8 border-0 border-t-2 border-neutral-200" />

        {/* Primary nav. */}
        <nav aria-label="Primary">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-eyebrow text-base tracking-[0.04em] text-neutral-900 decoration-amber decoration-2 underline-offset-4 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Spacer pushes social to the bottom. */}
        <div className="flex-1" />

        {/* Social + contact row. */}
        <div className="flex flex-col gap-3 border-t-2 border-neutral-200 pt-6">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-xs text-neutral-900 decoration-amber decoration-2 underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          {socialEntries.length > 0 && (
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {socialEntries.map(([label, href]) => (
                <li key={label} className="flex items-center gap-1.5">
                  <BowlingBallIcon size={10} className="text-teal" aria-hidden />
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-eyebrow text-xs tracking-[0.04em] text-neutral-900 decoration-amber decoration-2 underline-offset-4 hover:underline"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="font-eyebrow text-[11px] tracking-[0.04em] text-neutral-500">
            &copy; {new Date().getFullYear()} Jim Tierney
          </p>
        </div>
      </div>
    </div>
  );
}
