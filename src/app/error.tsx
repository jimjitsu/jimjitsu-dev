"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-6 py-16 sm:px-10">
      <p className="eyebrow">Error</p>
      <h1 className="display-heading">Something went wrong.</h1>
      <p className="max-w-xl text-base leading-relaxed text-ink-muted">
        An unexpected error occurred. Try again or head back home.
      </p>
      <div className="flex flex-wrap gap-4">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
      </div>
    </main>
  );
}
