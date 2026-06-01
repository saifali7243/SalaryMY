"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Decorative 3D hero scene: animated gradient orbs plus a floating glass
 * "salary card" that gently tilts toward the pointer. Purely visual.
 */
export function HeroScene() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced.current) return;

    function onMove(e: MouseEvent) {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const x = e.clientX / window.innerWidth - 0.5; // -0.5..0.5
        const y = e.clientY / window.innerHeight - 0.5;
        setPointer({ x, y });
      });
    }

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const orb = (depth: number) => ({
    transform: `translate3d(${pointer.x * depth}px, ${pointer.y * depth}px, 0)`,
  });

  const cardTilt = {
    transform: `rotateX(${(-pointer.y * 12).toFixed(2)}deg) rotateY(${(
      pointer.x * 16
    ).toFixed(2)}deg)`,
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Gradient orbs */}
      <div
        className="absolute -left-20 top-4 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl animate-blob dark:bg-brand-500/25"
        style={orb(28)}
      />
      <div
        className="absolute right-0 top-24 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl animate-blob animation-delay-400 dark:bg-emerald-500/20"
        style={orb(44)}
      />
      <div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl animate-blob animation-delay-600 dark:bg-teal-500/15"
        style={orb(18)}
      />

      {/* Floating 3D glass salary card (hidden on small screens) */}
      <div className="absolute right-[6%] top-[18%] hidden perspective lg:block xl:right-[12%]">
        <div className="animate-float" style={{ willChange: "transform" }}>
          <div
            className="preserve-3d w-64 rounded-2xl border border-line bg-surface/80 p-5 shadow-3d backdrop-blur-xl transition-transform duration-200 ease-out"
            style={cardTilt}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">
                Software Engineer
              </span>
              <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-600 dark:text-brand-300">
                KL
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              RM 9,500
              <span className="ml-1 text-xs font-normal text-muted-2">
                /mo avg
              </span>
            </p>

            <div className="mt-4 space-y-2">
              {[
                { label: "Junior", w: "38%" },
                { label: "Mid", w: "64%" },
                { label: "Senior", w: "92%" },
              ].map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex justify-between text-[10px] text-muted-2">
                    <span>{b.label}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                      style={{ width: b.w }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
