"use client";

import { useState } from "react";
import Link from "next/link";

import { SearchBar, type SearchableRole } from "@/components/SearchBar";
import { HeroScene } from "@/components/HeroScene";

interface HeroProps {
  roles: SearchableRole[];
  popular: SearchableRole[];
}

export function Hero({ roles, popular }: HeroProps) {
  const [searchActive, setSearchActive] = useState(false);

  return (
    <section className="relative overflow-hidden border-b border-line bg-grid">
      <HeroScene />

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-brand-600 shadow-sm backdrop-blur dark:text-brand-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
          Malaysia&apos;s salary transparency platform
        </span>

        <h1 className="mt-6 animate-fade-up text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Know what you&apos;re really worth in{" "}
          <span className="text-gradient">Malaysia</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl animate-fade-up text-lg leading-relaxed text-muted animation-delay-200">
          Explore real salary ranges by role, experience level and location.
          Compare junior, mid and senior pay — then submit your own to help
          others.
        </p>

        <div className="mx-auto mt-8 max-w-xl animate-fade-up animation-delay-400">
          <SearchBar
            roles={roles}
            size="lg"
            onActiveChange={setSearchActive}
          />
        </div>

        {/* Popular chips — smoothly hide when the search dropdown is active */}
        {popular.length > 0 && (
          <div
            className={`mt-6 flex flex-wrap items-center justify-center gap-2 text-sm transition-all duration-300 ${
              searchActive
                ? "pointer-events-none max-h-0 translate-y-2 opacity-0"
                : "max-h-20 translate-y-0 opacity-100"
            }`}
          >
            <span className="text-muted-2">Popular:</span>
            {popular.map((role) => (
              <Link
                key={role.slug}
                href={`/salary/${role.slug}`}
                tabIndex={searchActive ? -1 : 0}
                className="rounded-full border border-line bg-surface/60 px-3 py-1 font-medium text-muted backdrop-blur transition hover:border-brand-300 hover:text-brand-600"
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
