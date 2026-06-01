"use client";

import { useMemo, useState } from "react";

type VisaCategory = "local" | "cat1" | "cat2" | "cat3";

interface CalcResult {
  grossMonthly: number;
  epfEmployee: number;
  socsoEmployee: number;
  eisEmployee: number;
  pcb: number;
  netMonthly: number;
  grossAnnual: number;
  netAnnual: number;
  meetsExpatMin: boolean;
  expatMinRequired: number;
  costOfLiving: number;
  savings: number;
}

const VISA_INFO: Record<VisaCategory, { label: string; min: number; description: string }> = {
  local: { label: "Malaysian", min: 0, description: "Local employee — no minimum salary requirement" },
  cat1: { label: "Expat Category I", min: 20000, description: "Top executives & C-suite — min RM20,000/mo (2026 policy)" },
  cat2: { label: "Expat Category II", min: 10000, description: "Managers & professionals — min RM10,000/mo (2026 policy)" },
  cat3: { label: "Expat Category III", min: 5000, description: "Skilled workers & technicians — min RM5,000/mo (2026 policy)" },
};

const LOCATIONS: Record<string, number> = {
  "Kuala Lumpur": 3800,
  "Selangor": 3200,
  "Penang": 2900,
  "Johor Bahru": 2600,
  "Kota Kinabalu": 2500,
  "Other": 2400,
};

function estimateMonthlyTax(annualChargeable: number): number {
  if (annualChargeable <= 5000) return 0;
  const brackets = [
    { limit: 5000, rate: 0 },
    { limit: 20000, rate: 0.01 },
    { limit: 35000, rate: 0.03 },
    { limit: 50000, rate: 0.06 },
    { limit: 70000, rate: 0.11 },
    { limit: 100000, rate: 0.19 },
    { limit: 400000, rate: 0.25 },
    { limit: 600000, rate: 0.26 },
    { limit: 2000000, rate: 0.28 },
    { limit: Infinity, rate: 0.30 },
  ];
  let tax = 0;
  let prev = 0;
  for (const bracket of brackets) {
    const taxable = Math.min(annualChargeable, bracket.limit) - prev;
    if (taxable <= 0) break;
    tax += taxable * bracket.rate;
    prev = bracket.limit;
  }
  return Math.round(tax / 12);
}

export function SalaryCalculator() {
  const [salary, setSalary] = useState<string>("8000");
  const [category, setCategory] = useState<VisaCategory>("local");
  const [location, setLocation] = useState<string>("Kuala Lumpur");
  const [includeBonus, setIncludeBonus] = useState(true);

  const result = useMemo<CalcResult | null>(() => {
    const gross = Number(salary);
    if (!gross || gross <= 0) return null;

    const isExpat = category !== "local";
    const expatMinRequired = VISA_INFO[category].min;
    const meetsExpatMin = !isExpat || gross >= expatMinRequired;

    const epfEmployee = isExpat ? 0 : Math.round(gross * 0.11);
    const socsoEmployee = isExpat ? 0 : Math.min(Math.round(gross * 0.005), 69);
    const eisEmployee = isExpat ? 0 : Math.min(Math.round(gross * 0.002), 79);

    const annualGross = gross * (includeBonus ? 13 : 12);
    const annualEpfRelief = Math.min(epfEmployee * 12, 4000);
    const personalRelief = 9000;
    const annualChargeable = Math.max(0, annualGross - annualEpfRelief - personalRelief);

    const pcb = estimateMonthlyTax(annualChargeable);

    const netMonthly = gross - epfEmployee - socsoEmployee - eisEmployee - pcb;
    const costOfLiving = LOCATIONS[location] ?? 2400;
    const savings = netMonthly - costOfLiving;

    return {
      grossMonthly: gross,
      epfEmployee,
      socsoEmployee,
      eisEmployee,
      pcb,
      netMonthly,
      grossAnnual: annualGross,
      netAnnual: netMonthly * 12,
      meetsExpatMin,
      expatMinRequired,
      costOfLiving,
      savings,
    };
  }, [salary, category, location, includeBonus]);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-foreground">
            I am a...
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(VISA_INFO) as VisaCategory[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition ${
                  category === key
                    ? "border-brand-500 bg-brand-600 text-white shadow-sm"
                    : "border-line bg-surface text-muted hover:border-brand-300 hover:text-brand-600"
                }`}
              >
                {VISA_INFO[key].label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-2">
            {VISA_INFO[category].description}
          </p>
        </div>

        <div>
          <label htmlFor="calc-salary" className="block text-sm font-medium text-foreground">
            Monthly gross salary (MYR)
          </label>
          <input
            id="calc-salary"
            type="number"
            inputMode="numeric"
            min={0}
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g. 8000"
            className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        <div>
          <label htmlFor="calc-location" className="block text-sm font-medium text-foreground">
            Location
          </label>
          <select
            id="calc-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1.5 h-11 w-full cursor-pointer appearance-none rounded-lg border border-line bg-surface px-3 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          >
            {Object.keys(LOCATIONS).map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted sm:col-span-2">
          <input
            type="checkbox"
            checked={includeBonus}
            onChange={(e) => setIncludeBonus(e.target.checked)}
            className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
          />
          Include 13th month bonus in annual calculation
        </label>
      </div>

      {result && category !== "local" && !result.meetsExpatMin && (
        <div className="rounded-lg border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <strong>Warning:</strong> The 2026 expatriate policy requires at least{" "}
          <strong>RM{result.expatMinRequired.toLocaleString()}/mo</strong> for{" "}
          {VISA_INFO[category].label}. Your Employment Pass may not be approved at this salary.
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <ResultCard label="Net monthly" value={`RM ${result.netMonthly.toLocaleString()}`} accent />
            <ResultCard label="Gross annual" value={`RM ${result.grossAnnual.toLocaleString()}`} />
            <ResultCard
              label="Estimated savings/mo"
              value={`RM ${result.savings.toLocaleString()}`}
              negative={result.savings < 0}
            />
          </div>

          <div className="rounded-xl border border-line bg-surface-2/50 p-4">
            <h4 className="text-sm font-semibold text-foreground">Monthly deductions breakdown</h4>
            <div className="mt-3 space-y-2">
              <DeductionRow label="EPF (11% employee)" value={result.epfEmployee} />
              <DeductionRow label="SOCSO" value={result.socsoEmployee} />
              <DeductionRow label="EIS" value={result.eisEmployee} />
              <DeductionRow label="PCB (est. income tax)" value={result.pcb} />
              <div className="border-t border-line pt-2">
                <DeductionRow
                  label="Total deductions"
                  value={result.epfEmployee + result.socsoEmployee + result.eisEmployee + result.pcb}
                  bold
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/50 p-4">
            <h4 className="text-sm font-semibold text-foreground">
              Cost of living estimate — {location}
            </h4>
            <p className="mt-1 text-xs text-muted-2">
              Single professional: rent, food, transport, utilities, misc.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted">Estimated monthly expenses</span>
              <span className="font-semibold text-foreground">
                RM {result.costOfLiving.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full transition-all ${
                  result.savings >= 0
                    ? "bg-gradient-to-r from-brand-500 to-brand-400"
                    : "bg-gradient-to-r from-red-500 to-red-400"
                }`}
                style={{
                  width: `${Math.min(100, Math.round((result.costOfLiving / result.netMonthly) * 100))}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-2">
              {result.savings >= 0
                ? `You'd save approximately RM${result.savings.toLocaleString()}/month after expenses.`
                : `Your expenses exceed your net income by RM${Math.abs(result.savings).toLocaleString()}/month.`}
            </p>
          </div>

          {category !== "local" && (
            <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
              <h4 className="text-sm font-semibold text-foreground">
                Expat info for Malaysia (2026)
              </h4>
              <ul className="mt-2 space-y-1 text-xs text-muted">
                <li>• EPF contribution is <strong>optional</strong> for non-citizens (shown as RM0 above)</li>
                <li>• Tax residency: 182+ days in Malaysia = resident tax rates (shown above)</li>
                <li>• Non-residents pay a flat 30% — significantly higher</li>
                <li>• Employment Pass validity: Cat I up to 5 years, Cat II/III up to 2 years</li>
                <li>• New 2026 policy limits contract duration and requires Malaysian understudies</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  accent,
  negative,
}: {
  label: string;
  value: string;
  accent?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-brand-500/30 bg-brand-500/10"
          : negative
          ? "border-red-400/30 bg-red-500/10"
          : "border-line bg-surface"
      }`}
    >
      <p className="text-xs font-medium text-muted-2">{label}</p>
      <p
        className={`mt-1 text-xl font-bold tracking-tight ${
          accent
            ? "text-brand-600 dark:text-brand-400"
            : negative
            ? "text-red-600 dark:text-red-400"
            : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DeductionRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "font-semibold text-foreground" : "text-muted"}`}>
        {label}
      </span>
      <span className={`text-sm ${bold ? "font-semibold text-foreground" : "text-muted"}`}>
        RM {value.toLocaleString()}
      </span>
    </div>
  );
}
