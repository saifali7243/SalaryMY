import type { SalaryGroup } from "@/lib/salary";
import {
  EXPERIENCE_DESCRIPTIONS,
  EXPERIENCE_LABELS,
  formatMYR,
} from "@/lib/format";
import type { ExperienceLevel } from "@/types/database";

const LEVEL_ACCENT: Record<ExperienceLevel, string> = {
  junior: "from-sky-500 to-sky-400",
  mid: "from-brand-500 to-brand-400",
  senior: "from-violet-500 to-violet-400",
};

export function SalaryStats({ group }: { group: SalaryGroup }) {
  return (
    <div className="space-y-8">
      {/* Headline average */}
      <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-card sm:p-8">
        <p className="text-sm font-medium text-brand-700">
          Average monthly salary
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {formatMYR(group.averageSalary)}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Typical range {formatMYR(group.overallMin)} –{" "}
          {formatMYR(group.overallMax)} per month across all experience levels.
        </p>
      </div>

      {/* Per-level breakdown */}
      <div>
        <h2 className="text-lg font-semibold text-ink">
          Salary by experience level
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {group.ranges.map((range) => (
            <div
              key={range.level}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${LEVEL_ACCENT[range.level]}`}
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-ink">
                {EXPERIENCE_LABELS[range.level]}
              </p>
              <p className="text-xs text-slate-400">
                {EXPERIENCE_DESCRIPTIONS[range.level]}
              </p>
              <p className="mt-4 text-xl font-bold tracking-tight text-ink">
                {formatMYR(range.min)}
                <span className="text-slate-300"> – </span>
                {formatMYR(range.max)}
              </p>
              <p className="mt-1 text-xs text-slate-400">per month</p>
            </div>
          ))}
        </div>
      </div>

      {group.source && (
        <p className="text-xs text-slate-400">Source: {group.source}</p>
      )}
    </div>
  );
}
