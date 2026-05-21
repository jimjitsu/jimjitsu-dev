"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface SidebarShellProps {
  children: React.ReactNode;
}

/**
 * Client wrapper for the sidebar. On desktop the aside is permanently visible;
 * on mobile it's hidden behind a hamburger toggle and slides in from the left.
 *
 * The server-rendered Sidebar is passed in as `children`, which lets us keep
 * Contentful fetching on the server while the open/close state lives here.
 */
export function SidebarShell({ children }: SidebarShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  // Auto-close on route change so navigation feels responsive on mobile.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Focus trap: move focus into the sidebar when it opens and cycle
  // Tab/Shift+Tab within it. Escape also closes the drawer.
  useEffect(() => {
    if (!open) return;
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const focusable = Array.from(
      sidebar.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* Hamburger — mobile only, fixed top-right. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="site-sidebar"
        className="fixed right-4 top-4 z-50 inline-flex items-center justify-center border-2 border-ink bg-base p-2 text-ink shadow-[3px_3px_0_0_rgb(var(--color-ink))] transition hover:-translate-y-0.5 hover:translate-x-0 lg:hidden"
      >
        <HamburgerIcon />
      </button>

      {/* Backdrop — mobile only, dismissable. */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="site-sidebar"
        ref={sidebarRef}
        aria-label="Site navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r-2 border-ink bg-white transition-transform duration-200 ease-out dark:bg-black lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile-only close affordance (the X). Sits above the full-bleed
            logo so it stays visible — wrapped in a white-bg circle for
            contrast against the dark logo art. */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full border-2 border-neutral-900 bg-white p-1.5 text-neutral-900 lg:hidden"
        >
          <CloseIcon />
        </button>
        {children}
      </aside>
    </>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
