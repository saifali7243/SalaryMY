import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SalaryStats } from "@/components/SalaryStats";
import {
  getAllSalarySlugs,
  getSalaryGroupBySlug,
  getSalaryGroups,
} from "@/lib/salary";
import { SalaryCard } from "@/components/SalaryCard";
import { formatMYR } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSalarySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const group = await getSalaryGroupBySlug(slug);

  if (!group) {
    return { title: "Salary not found" };
  }

  const title = `${group.role} Salary in ${group.location}`;
  const description = `The average ${group.role} salary in ${group.location} is ${formatMYR(
    group.averageSalary
  )} per month, ranging from ${formatMYR(group.overallMin)} to ${formatMYR(
    group.overallMax
  )}. See junior, mid and senior pay.`;

  const canonical = `/salary/${group.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · ${siteConfig.name}`,
      description,
      url: `${siteConfig.url}${canonical}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${siteConfig.name}`,
      description,
    },
  };
}

export default async function SalaryPage({ params }: PageProps) {
  const { slug } = await params;
  const group = await getSalaryGroupBySlug(slug);

  if (!group) {
    notFound();
  }

  const all = await getSalaryGroups();

  // Same role in other locations first, then same category — for richer linking.
  const sameRoleOtherLocations = all.filter(
    (g) => g.role === group.role && g.slug !== group.slug
  );
  const sameCategory = all.filter(
    (g) =>
      g.category === group.category &&
      g.role !== group.role &&
      g.location === group.location
  );
  const related = [...sameRoleOtherLocations, ...sameCategory].slice(0, 6);

  // Structured data helps search engines render rich salary results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Occupation",
    name: group.role,
    occupationLocation: {
      "@type": "Country",
      name: group.location,
    },
    estimatedSalary: group.ranges.map((range) => ({
      "@type": "MonetaryAmountDistribution",
      name: range.level,
      currency: "MYR",
      unitText: "MONTH",
      median: Math.round((range.min + range.max) / 2),
      percentile10: range.min,
      percentile90: range.max,
    })),
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-2">
            /
          </li>
          <li>
            <Link href="/salaries" className="hover:text-brand-600">
              Salaries
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-2">
            /
          </li>
          <li className="font-medium text-foreground">{group.role}</li>
        </ol>
      </nav>

      <header className="mt-6 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-brand-500/10 px-2 py-0.5 text-xs font-medium text-brand-600 dark:text-brand-300">
            {group.category}
          </span>
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
            {group.location}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {group.role} Salary in {group.location}
        </h1>
        <p className="mt-3 text-muted">
          Based on aggregated market data, here&apos;s what a {group.role} earns
          per month in {group.location}, broken down by experience level.
        </p>
      </header>

      <div className="mt-10">
        <SalaryStats group={group} />
      </div>

      {/* CTA */}
      <div className="themed mt-10 flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-foreground">
            Earn a different amount as a {group.role}?
          </h2>
          <p className="text-sm text-muted">
            Add your salary anonymously to improve these benchmarks.
          </p>
        </div>
        <Link
          href="/submit"
          className="shrink-0 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Submit your salary
        </Link>
      </div>

      {/* Related roles */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-semibold text-foreground">
            Related salaries
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((g) => (
              <SalaryCard key={g.slug} group={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
