import type { Metadata } from "next";

import { SubmissionForm } from "@/components/SubmissionForm";

export const metadata: Metadata = {
  title: "Submit your salary",
  description:
    "Anonymously share your salary to help build salary transparency in Malaysia. Takes under a minute.",
  alternates: { canonical: "/submit" },
};

export default function SubmitPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Submit your salary
          </h1>
          <p className="mt-3 text-muted">
            Your contribution is anonymous and helps thousands of Malaysians
            understand their market value. No account needed.
          </p>
        </header>

        <div className="themed mt-8 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <SubmissionForm />
        </div>

        <ul className="mt-6 space-y-2 text-sm text-muted">
          <li className="flex items-start gap-2">
            <Check /> We never ask for your name or identifying details.
          </li>
          <li className="flex items-start gap-2">
            <Check /> Salaries are reviewed before appearing in aggregates.
          </li>
          <li className="flex items-start gap-2">
            <Check /> Enter your gross monthly salary in MYR.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
