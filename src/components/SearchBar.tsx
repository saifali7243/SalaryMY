"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface SearchableRole {
  role: string;
  location: string;
  slug: string;
}

interface SearchBarProps {
  roles: SearchableRole[];
  /** Visual size; the hero uses "lg". */
  size?: "md" | "lg";
}

export function SearchBar({ roles, size = "lg" }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return roles
      .filter(
        (r) =>
          r.role.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, roles]);

  function go(slug: string) {
    setOpen(false);
    router.push(`/salary/${slug}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || matches.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = matches[activeIndex] ?? matches[0];
      if (target) go(target.slug);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const inputSize =
    size === "lg" ? "h-14 text-base pl-12 pr-4" : "h-11 text-sm pl-10 pr-3";

  return (
    <div className="relative w-full">
      <div className="relative">
        <SearchIcon
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-2 ${
            size === "lg" ? "h-5 w-5" : "h-4 w-4 left-3"
          }`}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder="Search a role, e.g. Software Engineer"
          aria-label="Search salaries by role"
          className={`w-full rounded-xl border border-line bg-surface text-foreground shadow-sm outline-none transition placeholder:text-muted-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 ${inputSize}`}
        />
      </div>

      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
          {matches.map((match, index) => (
            <li key={match.slug}>
              <Link
                href={`/salary/${match.slug}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(match.slug);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex items-center justify-between px-4 py-3 text-left text-sm transition ${
                  index === activeIndex ? "bg-brand-500/10" : "bg-surface"
                }`}
              >
                <span className="font-medium text-foreground">{match.role}</span>
                <span className="text-xs text-muted-2">{match.location}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && matches.length === 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted shadow-lg">
          No roles found. Try a different keyword or{" "}
          <Link href="/submit" className="font-medium text-brand-600">
            submit a salary
          </Link>
          .
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}
