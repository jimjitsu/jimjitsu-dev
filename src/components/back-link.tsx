import Link from "next/link";
import { LaneArrowIcon } from "@/components/icons";

interface BackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-eyebrow text-sm tracking-[0.04em] text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
    >
      <LaneArrowIcon size={14} className="-rotate-90" />
      {label}
    </Link>
  );
}
