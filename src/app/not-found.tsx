import type { Metadata } from "next";
import Link from "next/link";
import { BowlingPinIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6 py-16 sm:px-10">
      <p className="eyebrow flex items-center gap-2">
        <BowlingPinIcon size={16} className="text-red" />
        404
      </p>
      <h1 className="display-heading">Page not found.</h1>
      <p className="max-w-xl text-base leading-relaxed text-ink-muted">
        That page doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-primary self-start">
        Go home
      </Link>
    </main>
  );
}
