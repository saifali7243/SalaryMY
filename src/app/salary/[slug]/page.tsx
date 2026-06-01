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

  const related = (await getSalaryGroups())
    .filter((g) => g.slug !== group.slug)
    .slice(0, 3);

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
      <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-brand-600">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/salaries" className="hover:text-brand-600">
              Salaries
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-ink">{group.role}</li>
        </ol>
      </nav>

      <header className="mt-6 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {group.role} Salary in {group.location}
        </h1>
        <p className="mt-3 text-slate-600">
          Based on aggregated market data, here&apos;s what a {group.role} earns
          per month in {group.location}, broken down by experience level.
        </p>
      </header>

      <div className="mt-10">
        <SalaryStats group={group} />
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-ink">
            Earn a different amount as a {group.role}?
          </h2>
          <p className="text-sm text-slate-600">
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
          <h2 className="text-lg font-semibold text-ink">Related roles</h2>
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
