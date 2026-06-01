"use client";

import { useState } from "react";

import { SalaryCalculator } from "@/components/SalaryCalculator";
import { ATSAnalyzer } from "@/components/ATSAnalyzer";

type Tab = "calculator" | "ats";

const TABS: { key: Tab; label: string; icon: string; description: string }[] = [
  {
    key: "calculator",
    label: "Salary Calculator",
    icon: "💰",
    description: "Expat & Malaysian net pay, deductions, and cost of living",
  },
  {
    key: "ats",
    label: "ATS CV Analyzer",
    icon: "📄",
    description: "Check ATS compatibility and get Malaysia hiring tips",
  },
];

export function ToolsTabs() {
  const [active, setActive] = useState<Tab>("calculator");

  return (
    <div>
      {/* Tab selector */}
      <div className="grid gap-3 sm:grid-cols-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
              active === tab.key
                ? "border-brand-500 bg-brand-500/10 shadow-sm"
                : "border-line bg-surface hover:border-brand-300"
            }`}
          >
            <span className="mt-0.5 text-2xl">{tab.icon}</span>
            <div>
              <p
                className={`text-sm font-semibold ${
                  active === tab.key ? "text-brand-600 dark:text-brand-400" : "text-foreground"
                }`}
              >
                {tab.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-2">{tab.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-8 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-8">
        {active === "calculator" && (
          <div>
            <div className="mb-6 border-b border-line pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Expat & Malaysian Salary Calculator
              </h2>
              <p className="mt-1 text-sm text-muted">
                Calculate your net monthly pay after EPF, SOCSO, EIS, and income
                tax. Compare cost of living across Malaysian cities. Updated for
                the 2026 expatriate Employment Pass policy.
              </p>
            </div>
            <SalaryCalculator />
          </div>
        )}

        {active === "ats" && (
          <div>
            <div className="mb-6 border-b border-line pb-4">
              <h2 className="text-lg font-semibold text-foreground">
                ATS CV Analyzer for Malaysia
              </h2>
              <p className="mt-1 text-sm text-muted">
                Upload or paste your CV to check ATS compatibility. Get a score,
                keyword analysis, and tailored advice for expats looking to get
                hired in Malaysia.
              </p>
            </div>
            <ATSAnalyzer />
          </div>
        )}
      </div>
    </div>
  );
}
