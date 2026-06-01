import Link from "next/link";

import { SearchBar, type SearchableRole } from "@/components/SearchBar";

interface HeroProps {
  roles: SearchableRole[];
  popular: SearchableRole[];
}

export function Hero({ roles, popular }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(46,148,86,0.18),transparent)]"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          Malaysia&apos;s salary transparency platform
        </span>

        <h1 className="mt-6 animate-fade-up text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Know what you&apos;re really worth in Malaysia
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
          Explore real salary ranges by role and experience level. Compare
          junior, mid and senior pay — then submit your own to help others.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <SearchBar roles={roles} size="lg" />
        </div>

        {popular.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-slate-500">Popular:</span>
            {popular.map((role) => (
              <Link
                key={role.slug}
                href={`/salary/${role.slug}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
              >
                {role.role}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
