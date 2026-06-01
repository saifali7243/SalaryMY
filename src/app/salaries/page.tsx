import type { Metadata } from "next";

import { SalaryCard } from "@/components/SalaryCard";
import { getSalaryGroups } from "@/lib/salary";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Browse all salaries in Malaysia",
  description:
    "Browse average salary benchmarks for roles across Malaysia, with junior, mid and senior pay ranges.",
  alternates: { canonical: "/salaries" },
};

export default async function SalariesPage() {
  const groups = await getSalaryGroups();

  return (
    <div className="container-page py-12 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Salary benchmarks in Malaysia
        </h1>
        <p className="mt-3 text-slate-600">
          {groups.length} roles and counting. Select a role to see the full
          breakdown by experience level.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <SalaryCard key={group.slug} group={group} />
        ))}
      </div>
    </div>
  );
}
