import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                RM
              </span>
              Salary
              <span className="-ml-1 text-brand-600 dark:text-brand-400">
                MY
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Transparent, crowdsourced salary benchmarks for the Malaysian job
              market. Know your worth before you negotiate.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:gap-16">
            <div>
              <h3 className="font-semibold text-foreground">Explore</h3>
              <ul className="mt-3 space-y-2 text-muted">
                <li>
                  <Link
                    href="/salaries"
                    className="transition hover:text-brand-600"
                  >
                    Browse salaries
                  </Link>
                </li>
                <li>
                  <Link
                    href="/submit"
                    className="transition hover:text-brand-600"
                  >
                    Submit a salary
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Legal</h3>
              <ul className="mt-3 space-y-2 text-muted">
                <li>
                  <span className="cursor-default">Privacy</span>
                </li>
                <li>
                  <span className="cursor-default">Terms</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-xs text-muted-2">
          &copy; {year} SalaryMY. Salary figures are estimates for informational
          purposes only.
        </div>
      </div>
    </footer>
  );
}
