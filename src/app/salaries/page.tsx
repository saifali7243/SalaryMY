import type { Metadata } from "next";

import {
  CATEGORIES,
  LOCATION_NAMES,
  getSalaryGroups,
} from "@/lib/salary";
import {
  SalaryDirectory,
  type DirectoryItem,
} from "@/components/SalaryDirectory";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Browse all salaries in Malaysia",
  description:
    "Browse and filter average salary benchmarks across Malaysia by role, location and category, with junior, mid and senior pay ranges.",
  alternates: { canonical: "/salaries" },
};

export default async function SalariesPage() {
  const groups = await getSalaryGroups();

  const items: DirectoryItem[] = groups.map((g) => ({
    role: g.role,
    location: g.location,
    category: g.category,
    slug: g.slug,
    averageSalary: g.averageSalary,
    overallMin: g.overallMin,
    overallMax: g.overallMax,
  }));

  const distinctRoles = new Set(groups.map((g) => g.role)).size;

  return (
    <div className="container-page py-12 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Salary benchmarks in Malaysia
        </h1>
        <p className="mt-3 text-muted">
          {distinctRoles} roles across {LOCATION_NAMES.length} locations and{" "}
          {CATEGORIES.length} categories. Filter and search to find your market
          value.
        </p>
      </header>

      <div className="mt-10">
        <SalaryDirectory
          items={items}
          locations={LOCATION_NAMES}
          categories={CATEGORIES}
        />
      </div>
    </div>
  );
}
