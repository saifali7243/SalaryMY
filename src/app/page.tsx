import Link from "next/link";

import { Hero } from "@/components/Hero";
import { SalaryCard } from "@/components/SalaryCard";
import {
  CATEGORIES,
  LOCATION_NAMES,
  getSalaryGroups,
} from "@/lib/salary";
import { buildSalarySlug } from "@/lib/slug";
import type { SearchableRole } from "@/components/SearchBar";
import { formatMYRCompact } from "@/lib/format";

// Revalidate the homepage hourly so new market data appears without a redeploy.
export const revalidate = 3600;

export default async function HomePage() {
  const groups = await getSalaryGroups();

  const roles: SearchableRole[] = groups.map((g) => ({
    role: g.role,
    location: g.location,
    slug: g.slug,
  }));

  // Feature the highest-paying national roles for an eye-catching grid.
  const featured = groups
    .filter((g) => g.location === "Malaysia")
    .sort((a, b) => b.averageSalary - a.averageSalary)
    .slice(0, 6);

  const popular = featured.slice(0, 4).map((g) => ({
    role: g.role,
    location: g.location,
    slug: g.slug,
  }));

  const distinctRoles = new Set(groups.map((g) => g.role)).size;
  const highestAvg = Math.max(...groups.map((g) => g.averageSalary));

  const stats = [
    { label: "Job roles", value: `${distinctRoles}+` },
    { label: "Locations", value: `${LOCATION_NAMES.length}` },
    { label: "Categories", value: `${CATEGORIES.length}` },
    { label: "Top avg / mo", value: formatMYRCompact(highestAvg) },
  ];

  return (
    <>
      <Hero roles={roles} popular={popular} />

      {/* Stats strip */}
      <section className="border-b border-line bg-surface/60">
        <div className="container-page grid grid-cols-2 gap-4 py-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured roles */}
      <section className="container-page py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Top salary benchmarks
            </h2>
            <p className="mt-1 text-muted">
              The highest-paying roles in Malaysia right now.
            </p>
          </div>
          <Link
            href="/salaries"
            className="hidden shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:inline-block dark:text-brand-400"
          >
            View all →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((group) => (
            <SalaryCard key={group.slug} group={group} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/salaries"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            View all salaries →
          </Link>
        </div>
      </section>

      {/* Browse by location */}
      <section className="border-y border-line bg-surface/60">
        <div className="container-page py-14">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
            Browse by location
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted">
            Salaries vary by region. Explore benchmarks for Malaysia&apos;s
            major job markets.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {LOCATION_NAMES.map((location) => (
              <Link
                key={location}
                href={`/salary/${buildSalarySlug("Software Engineer", location)}`}
                className="rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium text-muted shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600"
              >
                {location}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16 sm:py-20">
        <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
          How SalaryMY works
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="themed rounded-2xl border border-line bg-surface p-6 text-center shadow-card"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-base font-bold text-brand-600 dark:text-brand-300">
                {index + 1}
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-16 sm:pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-brand-700/40 bg-gradient-to-br from-brand-700 via-brand-800 to-ink px-6 py-12 text-center sm:px-12">
          <div
            className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-brand-400/30 blur-3xl"
            aria-hidden="true"
          />
          <h2 className="relative text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Help build salary transparency in Malaysia
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-brand-100">
            Share your salary anonymously. It takes under a minute and helps
            thousands of Malaysians negotiate with confidence.
          </p>
          <Link
            href="/submit"
            className="relative mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-50"
          >
            Submit your salary
          </Link>
        </div>
      </section>
    </>
  );
}

const STEPS = [
  {
    title: "Search a role",
    body: "Find any job title and instantly see the average salary and pay range across Malaysia.",
  },
  {
    title: "Compare & filter",
    body: "Break salaries down by junior, mid and senior, and filter by location and category.",
  },
  {
    title: "Contribute back",
    body: "Submit your own salary anonymously to keep the data fresh and accurate for everyone.",
  },
];
