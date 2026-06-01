"use client";

import { useMemo, useState } from "react";

import { SalaryCard } from "@/components/SalaryCard";

export interface DirectoryItem {
  role: string;
  location: string;
  category: string;
  slug: string;
  averageSalary: number;
  overallMin: number;
  overallMax: number;
}

interface SalaryDirectoryProps {
  items: DirectoryItem[];
  locations: string[];
  categories: string[];
}

type SortKey = "az" | "high" | "low";

export function SalaryDirectory({
  items,
  locations,
  categories,
}: SalaryDirectoryProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("az");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = items.filter((item) => {
      const matchesQuery =
        !q ||
        item.role.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchesLocation = location === "all" || item.location === location;
      const matchesCategory = category === "all" || item.category === category;
      return matchesQuery && matchesLocation && matchesCategory;
    });

    result.sort((a, b) => {
      if (sort === "high") return b.averageSalary - a.averageSalary;
      if (sort === "low") return a.averageSalary - b.averageSalary;
      return a.role.localeCompare(b.role) || a.location.localeCompare(b.location);
    });

    return result;
  }, [items, query, location, category, sort]);

  function reset() {
    setQuery("");
    setLocation("all");
    setCategory("all");
    setSort("az");
  }

  const hasFilters =
    query.trim() !== "" || location !== "all" || category !== "all";

  return (
    <div>
      {/* Controls */}
      <div className="themed sticky top-16 z-30 -mx-4 mb-8 border-b border-line bg-background/90 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-surface/70 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles…"
              aria-label="Search roles"
              className="h-11 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex">
            <Select
              label="Location"
              value={location}
              onChange={setLocation}
              options={["all", ...locations]}
            />
            <Select
              label="Category"
              value={category}
              onChange={setCategory}
              options={["all", ...categories]}
            />
            <Select
              label="Sort"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={["az", "high", "low"]}
              display={{
                az: "A–Z",
                high: "Highest pay",
                low: "Lowest pay",
              }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-2">
          <span>
            Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            of {items.length} benchmarks
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Category quick chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Chip active={category === "all"} onClick={() => setCategory("all")}>
          All categories
        </Chip>
        {categories.map((cat) => (
          <Chip
            key={cat}
            active={category === cat}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Chip>
        ))}
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <SalaryCard key={item.slug} group={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-surface/50 py-16 text-center">
          <p className="text-foreground">No roles match your filters.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  display,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  display?: Record<string, string>;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-line bg-surface pl-3 pr-8 text-sm font-medium text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 lg:w-auto"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "all" ? `All ${label.toLowerCase()}s` : display?.[opt] ?? opt}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "border-brand-500 bg-brand-600 text-white shadow-sm"
          : "border-line bg-surface text-muted hover:border-brand-300 hover:text-brand-600"
      }`}
    >
      {children}
    </button>
  );
}
