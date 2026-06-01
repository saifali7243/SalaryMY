import type { Metadata } from "next";

import { ToolsTabs } from "@/components/ToolsTabs";

export const metadata: Metadata = {
  title: "Free Salary Calculator & ATS CV Analyzer",
  description:
    "Calculate your net salary as a Malaysian or expat (2026 policy), estimate savings, and check if your CV is ATS-friendly with Malaysia-specific hiring tips.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-xs font-medium text-brand-600 shadow-sm backdrop-blur dark:text-brand-300">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          Free career tools
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Salary Calculator & CV Analyzer
        </h1>
        <p className="mt-3 text-muted">
          Two essential tools for anyone working or job-hunting in Malaysia.
          Calculate your take-home pay as a local or expat, and check if your CV
          passes ATS screening.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-4xl">
        <ToolsTabs />
      </div>
    </div>
  );
}
