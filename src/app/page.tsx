import Link from "next/link";

import { Hero } from "@/components/Hero";
import { SalaryCard } from "@/components/SalaryCard";
import { getSalaryGroups } from "@/lib/salary";
import type { SearchableRole } from "@/components/SearchBar";

// Revalidate the homepage hourly so new market data appears without a redeploy.
export const revalidate = 3600;

export default async function HomePage() {
  const groups = await getSalaryGroups();

  const roles: SearchableRole[] = groups.map((g) => ({
    role: g.role,
    location: g.location,
    slug: g.slug,
  }));

  const popular = roles.slice(0, 4);
  const featured = groups.slice(0, 6);

  return (
    <>
      <Hero roles={roles} popular={popular} />

      {/* Featured roles */}
      <section className="container-page py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              Popular salary benchmarks
            </h2>
            <p className="mt-1 text-slate-600">
              Average monthly pay across experience levels.
            </p>
          </div>
          <Link
            href="/salaries"
            className="hidden shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:inline-block"
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
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all salaries →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="container-page py-16 sm:py-20">
          <h2 className="text-center text-2xl font-bold tracking-tight text-ink">
            How SalaryMY works
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-base font-bold text-brand-700">
                  {index + 1}
                </div>
                <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 sm:py-20">
        <div className="overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Help build salary transparency in Malaysia
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Share your salary anonymously. It takes under a minute and helps
            thousands of Malaysians negotiate with confidence.
          </p>
          <Link
            href="/submit"
            className="mt-6 inline-block rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
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
    body: "Find any job title and instantly see the average salary and pay range in Malaysia.",
  },
  {
    title: "Compare by level",
    body: "Break salaries down by junior, mid and senior experience to understand your market value.",
  },
  {
    title: "Contribute back",
    body: "Submit your own salary anonymously to keep the data fresh and accurate for everyone.",
  },
];
