import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            RM
          </span>
          <span className="text-lg tracking-tight">
            Salary<span className="text-brand-600">MY</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/salaries"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-ink sm:inline-block"
          >
            Browse salaries
          </Link>
          <Link
            href="/submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Submit salary
          </Link>
        </div>
      </nav>
    </header>
  );
}
