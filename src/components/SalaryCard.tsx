"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import type { SalaryGroup } from "@/lib/salary";
import { formatMYR } from "@/lib/format";

interface SalaryCardProps {
  group: Pick<
    SalaryGroup,
    | "role"
    | "location"
    | "slug"
    | "averageSalary"
    | "overallMin"
    | "overallMax"
    | "category"
  >;
}

const MAX_TILT = 7; // degrees

export function SalaryCard({ group }: SalaryCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [transform, setTransform] = useState<string>("");
  const [glare, setGlare] = useState<{ x: number; y: number } | null>(null);

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    const rotateY = (px - 0.5) * 2 * MAX_TILT;
    const rotateX = (0.5 - py) * 2 * MAX_TILT;
    setTransform(
      `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
        2
      )}deg) translateY(-4px)`
    );
    setGlare({ x: px * 100, y: py * 100 });
  }

  function reset() {
    setTransform("");
    setGlare(null);
  }

  return (
    <Link
      ref={ref}
      href={`/salary/${group.slug}`}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={transform ? { transform } : undefined}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card transition-[transform,box-shadow,border-color] duration-200 ease-out will-change-transform hover:border-brand-300 hover:shadow-glow"
    >
      {/* glare highlight */}
      {glare && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(220px circle at ${glare.x}% ${glare.y}%, rgba(46,148,86,0.16), transparent 60%)`,
          }}
        />
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground group-hover:text-brand-600">
            {group.role}
          </h3>
          <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
            {group.location}
          </span>
        </div>
        {group.category && (
          <span className="mt-2 inline-block rounded-md bg-brand-500/10 px-2 py-0.5 text-[11px] font-medium text-brand-600 dark:text-brand-300">
            {group.category}
          </span>
        )}
        <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          {formatMYR(group.averageSalary)}
          <span className="ml-1 text-sm font-normal text-muted-2">/mo avg</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          {formatMYR(group.overallMin)} – {formatMYR(group.overallMax)} range
        </p>
      </div>

      <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
        View breakdown
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
