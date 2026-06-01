import "server-only";

import { cache } from "react";

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
  category: string;
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

type Band = [number, number];

interface RoleSeed {
  role: string;
  category: string;
  junior: Band;
  mid: Band;
  senior: Band;
}

/**
 * Base monthly salary bands (MYR) at the national baseline. Location-specific
 * figures are derived from these using the multipliers below.
 */
const ROLE_SEEDS: RoleSeed[] = [
  // Engineering
  { role: "Software Engineer", category: "Engineering", junior: [3500, 6000], mid: [6000, 11000], senior: [11000, 20000] },
  { role: "Frontend Developer", category: "Engineering", junior: [3300, 5800], mid: [5800, 10000], senior: [10000, 18000] },
  { role: "Backend Developer", category: "Engineering", junior: [3600, 6200], mid: [6200, 11500], senior: [11500, 21000] },
  { role: "Mobile Developer", category: "Engineering", junior: [3500, 6000], mid: [6000, 11000], senior: [11000, 19000] },
  { role: "DevOps Engineer", category: "Engineering", junior: [4500, 7000], mid: [7000, 13000], senior: [13000, 23000] },
  { role: "QA Engineer", category: "Engineering", junior: [3000, 5000], mid: [5000, 8500], senior: [8500, 15000] },
  { role: "Cybersecurity Analyst", category: "Engineering", junior: [4000, 6500], mid: [6500, 12000], senior: [12000, 22000] },

  // Data & AI
  { role: "Data Scientist", category: "Data & AI", junior: [4000, 6500], mid: [6500, 12000], senior: [12000, 22000] },
  { role: "Data Analyst", category: "Data & AI", junior: [3200, 5200], mid: [5200, 9000], senior: [9000, 15000] },
  { role: "Data Engineer", category: "Data & AI", junior: [4200, 6800], mid: [6800, 12500], senior: [12500, 22000] },
  { role: "Machine Learning Engineer", category: "Data & AI", junior: [4500, 7500], mid: [7500, 14000], senior: [14000, 25000] },

  // Product & Design
  { role: "Product Manager", category: "Product & Design", junior: [5000, 8000], mid: [8000, 15000], senior: [15000, 28000] },
  { role: "UX Designer", category: "Product & Design", junior: [3500, 5500], mid: [5500, 9500], senior: [9500, 16000] },
  { role: "UI Designer", category: "Product & Design", junior: [3300, 5200], mid: [5200, 9000], senior: [9000, 15000] },
  { role: "Graphic Designer", category: "Product & Design", junior: [2800, 4200], mid: [4200, 7000], senior: [7000, 12000] },

  // Marketing & Sales
  { role: "Digital Marketing Executive", category: "Marketing & Sales", junior: [2800, 4200], mid: [4200, 7500], senior: [7500, 13000] },
  { role: "Content Writer", category: "Marketing & Sales", junior: [2600, 4000], mid: [4000, 6500], senior: [6500, 11000] },
  { role: "SEO Specialist", category: "Marketing & Sales", junior: [3000, 4800], mid: [4800, 8000], senior: [8000, 14000] },
  { role: "Sales Executive", category: "Marketing & Sales", junior: [2800, 4500], mid: [4500, 8000], senior: [8000, 16000] },

  // Finance & Business
  { role: "Accountant", category: "Finance & Business", junior: [3000, 4500], mid: [4500, 8000], senior: [8000, 15000] },
  { role: "Financial Analyst", category: "Finance & Business", junior: [3500, 5500], mid: [5500, 9500], senior: [9500, 17000] },
  { role: "Human Resources Executive", category: "Finance & Business", junior: [2800, 4500], mid: [4500, 7500], senior: [7500, 13000] },
  { role: "Business Analyst", category: "Finance & Business", junior: [3800, 6000], mid: [6000, 10500], senior: [10500, 18000] },

  // Operations
  { role: "Project Manager", category: "Operations", junior: [4500, 7000], mid: [7000, 12500], senior: [12500, 22000] },
];

/** Locations with a cost-of-market multiplier relative to the national baseline. */
const LOCATIONS: { name: string; multiplier: number }[] = [
  { name: "Malaysia", multiplier: 1.0 },
  { name: "Kuala Lumpur", multiplier: 1.12 },
  { name: "Selangor", multiplier: 1.06 },
  { name: "Penang", multiplier: 0.98 },
  { name: "Johor Bahru", multiplier: 0.95 },
  { name: "Remote", multiplier: 1.08 },
];

/** Ordered list of job categories used by the directory filters. */
export const CATEGORIES: string[] = [
  ...new Set(ROLE_SEEDS.map((seed) => seed.category)),
];

/** Ordered list of locations used by the directory filters. */
export const LOCATION_NAMES: string[] = LOCATIONS.map((l) => l.name);

/** Map of role name -> category, for enriching rows from any source. */
const ROLE_CATEGORY = new Map<string, string>(
  ROLE_SEEDS.map((seed) => [seed.role.toLowerCase(), seed.category])
);

export function categoryForRole(role: string): string {
  return ROLE_CATEGORY.get(role.toLowerCase()) ?? "Other";
}

/** Round to the nearest RM 50 for tidy, realistic-looking figures. */
function roundBand([min, max]: Band, multiplier: number): Band {
  const r = (v: number) => Math.round((v * multiplier) / 50) * 50;
  return [r(min), r(max)];
}

/**
 * Fallback seed data generated from the base bands × location multipliers.
 * Used when Supabase is not configured (local preview, CI builds) so the UI
 * always renders, and mirrors the rows produced by `supabase/schema.sql`.
 */
const FALLBACK_SALARIES: Omit<SalaryRow, "id" | "created_at">[] =
  ROLE_SEEDS.flatMap((seed) =>
    LOCATIONS.flatMap(({ name, multiplier }) => {
      const levels: { level: ExperienceLevel; band: Band }[] = [
        { level: "junior", band: seed.junior },
        { level: "mid", band: seed.mid },
        { level: "senior", band: seed.senior },
      ];
      return levels.map(({ level, band }) => {
        const [salary_min, salary_max] = roundBand(band, multiplier);
        return {
          role: seed.role,
          location: name,
          experience_level: level,
          salary_min,
          salary_max,
          source: "SalaryMY market sample",
        };
      });
    })
  );

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
        category: categoryForRole(row.role),
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

  return [...groups.values()].sort(
    (a, b) => a.role.localeCompare(b.role) || a.location.localeCompare(b.location)
  );
}

/**
 * All salary groups (one per role + location). Wrapped in React `cache` so the
 * data is computed once per request (shared between metadata + page render).
 */
export const getSalaryGroups = cache(async (): Promise<SalaryGroup[]> => {
  const rows = await fetchSalaries();
  return groupSalaries(rows);
});

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
      group.location.toLowerCase().includes(q) ||
      group.category.toLowerCase().includes(q)
  );
}

/** All slugs — used to statically generate salary pages. */
export async function getAllSalarySlugs(): Promise<string[]> {
  const groups = await getSalaryGroups();
  return groups.map((group) => group.slug);
}
