import { getSiteSettings } from "@/lib/contentful";

const CONTACT_EMAIL = "jimbo.c.tierney@gmail.com";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const social = settings?.fields.socialLinks ?? {};
  const socialEntries = Object.entries(social);

  return (
    <footer className="mt-24 border-t-2 border-neutral-900 dark:border-neutral-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p className="font-eyebrow text-xs uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Jim Tierney
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">
              {CONTACT_EMAIL}
            </a>
          </li>
          {socialEntries.map(([label, href]) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-eyebrow text-xs uppercase tracking-[0.2em] underline underline-offset-4"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
