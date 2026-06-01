import Link from "next/link";

import type { SalaryGroup } from "@/lib/salary";
import { formatMYR } from "@/lib/format";

interface SalaryCardProps {
  group: Pick<
    SalaryGroup,
    "role" | "location" | "slug" | "averageSalary" | "overallMin" | "overallMax"
  >;
}

export function SalaryCard({ group }: SalaryCardProps) {
  return (
    <Link
      href={`/salary/${group.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-ink group-hover:text-brand-700">
            {group.role}
          </h3>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
            {group.location}
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-ink">
          {formatMYR(group.averageSalary)}
          <span className="ml-1 text-sm font-normal text-slate-400">/mo avg</span>
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {formatMYR(group.overallMin)} – {formatMYR(group.overallMax)} range
        </p>
      </div>

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
        View breakdown
        <svg
          className="h-4 w-4 transition group-hover:translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
