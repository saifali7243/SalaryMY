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
  // Used to scale the visual bar widths relative to the highest senior max.
  const maxValue = Math.max(...group.ranges.map((r) => r.max));

  return (
    <div className="space-y-8">
      {/* Headline average */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-surface p-6 shadow-card sm:p-8">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-400/20 blur-3xl"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-brand-600 dark:text-brand-300">
          Average monthly salary
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {formatMYR(group.averageSalary)}
        </p>
        <p className="mt-2 text-sm text-muted">
          Typical range {formatMYR(group.overallMin)} –{" "}
          {formatMYR(group.overallMax)} per month across all experience levels.
        </p>
      </div>

      {/* Per-level breakdown */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Salary by experience level
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {group.ranges.map((range) => (
            <div
              key={range.level}
              className="themed relative overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${LEVEL_ACCENT[range.level]}`}
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-foreground">
                {EXPERIENCE_LABELS[range.level]}
              </p>
              <p className="text-xs text-muted-2">
                {EXPERIENCE_DESCRIPTIONS[range.level]}
              </p>
              <p className="mt-4 text-xl font-bold tracking-tight text-foreground">
                {formatMYR(range.min)}
                <span className="text-muted-2"> – </span>
                {formatMYR(range.max)}
              </p>
              <p className="mt-1 text-xs text-muted-2">per month</p>

              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${LEVEL_ACCENT[range.level]}`}
                  style={{
                    width: `${Math.max(
                      12,
                      Math.round((range.max / maxValue) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {group.source && (
        <p className="text-xs text-muted-2">Source: {group.source}</p>
      )}
    </div>
  );
}
