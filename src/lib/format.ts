/** Formatting helpers for currency and labels (Malaysian Ringgit). */

import type { ExperienceLevel } from "@/types/database";

const myr = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

const myrCompact = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** RM 6,000 */
export function formatMYR(value: number): string {
  return myr.format(value);
}

/** RM 6K — for tight UI spaces. */
export function formatMYRCompact(value: number): string {
  return myrCompact.format(value);
}

/** RM 6,000 – RM 11,000 */
export function formatRange(min: number, max: number): string {
  return `${formatMYR(min)} – ${formatMYR(max)}`;
}

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
};

export const EXPERIENCE_DESCRIPTIONS: Record<ExperienceLevel, string> = {
  junior: "0–2 years of experience",
  mid: "3–5 years of experience",
  senior: "6+ years of experience",
};

export function experienceLabel(level: ExperienceLevel): string {
  return EXPERIENCE_LABELS[level];
}
