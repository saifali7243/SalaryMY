import "server-only";

import type { ExperienceLevel, SalaryRow } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { buildSalarySlug } from "@/lib/slug";

/** One experience band within a role/location group. */
export interface SalaryRange {
  level: ExperienceLevel;
  min: number;
  max: number;
}

/** Aggregated salary information for a single role + location. */
export interface SalaryGroup {
  role: string;
  location: string;
  slug: string;
  source: string | null;
  ranges: SalaryRange[];
  /** Midpoint of all bands — the headline "average" salary. */
  averageSalary: number;
  /** Overall lowest min and highest max across bands. */
  overallMin: number;
  overallMax: number;
}

const LEVEL_ORDER: Record<ExperienceLevel, number> = {
  junior: 0,
  mid: 1,
  senior: 2,
};

/**
 * Fallback seed data — mirrors `supabase/schema.sql`. Used when Supabase is not
 * configured (e.g. local preview, CI builds) so the UI always renders.
 */
const FALLBACK_SALARIES: Omit<SalaryRow, "id" | "created_at">[] = [
  { role: "Software Engineer", location: "Malaysia", experience_level: "junior", salary_min: 3500, salary_max: 6000, source: "SalaryMY market sample" },
  { role: "Software Engineer", location: "Malaysia", experience_level: "mid", salary_min: 6000, salary_max: 11000, source: "SalaryMY market sample" },
  { role: "Software Engineer", location: "Malaysia", experience_level: "senior", salary_min: 11000, salary_max: 20000, source: "SalaryMY market sample" },
  { role: "Data Scientist", location: "Malaysia", experience_level: "junior", salary_min: 4000, salary_max: 6500, source: "SalaryMY market sample" },
  { role: "Data Scientist", location: "Malaysia", experience_level: "mid", salary_min: 6500, salary_max: 12000, source: "SalaryMY market sample" },
  { role: "Data Scientist", location: "Malaysia", experience_level: "senior", salary_min: 12000, salary_max: 22000, source: "SalaryMY market sample" },
  { role: "Product Manager", location: "Malaysia", experience_level: "junior", salary_min: 5000, salary_max: 8000, source: "SalaryMY market sample" },
  { role: "Product Manager", location: "Malaysia", experience_level: "mid", salary_min: 8000, salary_max: 15000, source: "SalaryMY market sample" },
  { role: "Product Manager", location: "Malaysia", experience_level: "senior", salary_min: 15000, salary_max: 28000, source: "SalaryMY market sample" },
  { role: "UX Designer", location: "Malaysia", experience_level: "junior", salary_min: 3500, salary_max: 5500, source: "SalaryMY market sample" },
  { role: "UX Designer", location: "Malaysia", experience_level: "mid", salary_min: 5500, salary_max: 9500, source: "SalaryMY market sample" },
  { role: "UX Designer", location: "Malaysia", experience_level: "senior", salary_min: 9500, salary_max: 16000, source: "SalaryMY market sample" },
  { role: "DevOps Engineer", location: "Malaysia", experience_level: "junior", salary_min: 4500, salary_max: 7000, source: "SalaryMY market sample" },
  { role: "DevOps Engineer", location: "Malaysia", experience_level: "mid", salary_min: 7000, salary_max: 13000, source: "SalaryMY market sample" },
  { role: "DevOps Engineer", location: "Malaysia", experience_level: "senior", salary_min: 13000, salary_max: 23000, source: "SalaryMY market sample" },
  { role: "Accountant", location: "Malaysia", experience_level: "junior", salary_min: 3000, salary_max: 4500, source: "SalaryMY market sample" },
  { role: "Accountant", location: "Malaysia", experience_level: "mid", salary_min: 4500, salary_max: 8000, source: "SalaryMY market sample" },
  { role: "Accountant", location: "Malaysia", experience_level: "senior", salary_min: 8000, salary_max: 15000, source: "SalaryMY market sample" },
  { role: "Digital Marketing Executive", location: "Malaysia", experience_level: "junior", salary_min: 2800, salary_max: 4200, source: "SalaryMY market sample" },
  { role: "Digital Marketing Executive", location: "Malaysia", experience_level: "mid", salary_min: 4200, salary_max: 7500, source: "SalaryMY market sample" },
  { role: "Digital Marketing Executive", location: "Malaysia", experience_level: "senior", salary_min: 7500, salary_max: 13000, source: "SalaryMY market sample" },
];

type RawSalary = Pick<
  SalaryRow,
  "role" | "location" | "experience_level" | "salary_min" | "salary_max" | "source"
>;

/** Fetch all salary rows, preferring Supabase and falling back to seed data. */
async function fetchSalaries(): Promise<RawSalary[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_SALARIES;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("salaries")
      .select("role, location, experience_level, salary_min, salary_max, source");

    if (error || !data || data.length === 0) {
      return FALLBACK_SALARIES;
    }
    return data;
  } catch {
    return FALLBACK_SALARIES;
  }
}

/** Group raw rows into one SalaryGroup per role + location. */
function groupSalaries(rows: RawSalary[]): SalaryGroup[] {
  const groups = new Map<string, SalaryGroup>();

  for (const row of rows) {
    const slug = buildSalarySlug(row.role, row.location);
    let group = groups.get(slug);

    if (!group) {
      group = {
        role: row.role,
        location: row.location,
        slug,
        source: row.source,
        ranges: [],
        averageSalary: 0,
        overallMin: Number.POSITIVE_INFINITY,
        overallMax: 0,
      };
      groups.set(slug, group);
    }

    group.ranges.push({
      level: row.experience_level,
      min: row.salary_min,
      max: row.salary_max,
    });
    group.overallMin = Math.min(group.overallMin, row.salary_min);
    group.overallMax = Math.max(group.overallMax, row.salary_max);
  }

  for (const group of groups.values()) {
    group.ranges.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
    const midpoints = group.ranges.map((r) => (r.min + r.max) / 2);
    group.averageSalary = Math.round(
      midpoints.reduce((sum, value) => sum + value, 0) / midpoints.length
    );
    if (!Number.isFinite(group.overallMin)) group.overallMin = 0;
  }

  return [...groups.values()].sort((a, b) => a.role.localeCompare(b.role));
}

/** All salary groups (one per role + location), alphabetically by role. */
export async function getSalaryGroups(): Promise<SalaryGroup[]> {
  const rows = await fetchSalaries();
  return groupSalaries(rows);
}

/** A single salary group resolved from its slug, or null if not found. */
export async function getSalaryGroupBySlug(
  slug: string
): Promise<SalaryGroup | null> {
  const groups = await getSalaryGroups();
  return groups.find((group) => group.slug === slug) ?? null;
}

/** Lightweight search over role + location for the homepage search box. */
export async function searchSalaryGroups(query: string): Promise<SalaryGroup[]> {
  const groups = await getSalaryGroups();
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups.filter(
    (group) =>
      group.role.toLowerCase().includes(q) ||
      group.location.toLowerCase().includes(q)
  );
}

/** All slugs — used to statically generate salary pages. */
export async function getAllSalarySlugs(): Promise<string[]> {
  const groups = await getSalaryGroups();
  return groups.map((group) => group.slug);
}
