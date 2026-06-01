import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-sm">
            RM
          </span>
          <span className="text-lg tracking-tight">
            Salary<span className="text-brand-600 dark:text-brand-400">MY</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/salaries"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground sm:inline-block"
          >
            Browse salaries
          </Link>
          <ThemeToggle />
          <Link
            href="/submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-background"
          >
            Submit salary
          </Link>
        </div>
      </nav>
    </header>
  );
}
