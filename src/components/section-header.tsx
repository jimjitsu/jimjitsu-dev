import Link from "next/link";

interface SectionHeaderProps {
  eyebrow: string;
  icon?: React.ReactNode;
  title: string;
  /** Rendered on the h2 so parent sections can reference it via aria-labelledby. */
  id?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
}

export function SectionHeader({
  eyebrow,
  icon,
  title,
  id,
  seeAllHref,
  seeAllLabel,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <p className="eyebrow flex items-center gap-2">
          {icon}
          {eyebrow}
        </p>
        <h2 id={id} className="display-heading">
          {title}
        </h2>
      </div>
      {seeAllHref && seeAllLabel && (
        <Link
          href={seeAllHref}
          className="font-eyebrow text-sm tracking-[0.04em] text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
        >
          {seeAllLabel} →
        </Link>
      )}
    </div>
  );
}
