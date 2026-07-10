"use client";

import Link from "next/link";
import type { Category } from "@/lib/types";

interface Props {
  categories: Category[];
  counts: Record<string, number>;
  active: string | null;
  onSelect: (slug: string | null) => void;
}

export default function Directory({ categories, counts, active, onSelect }: Props) {
  return (
    <nav
      aria-label="Wing directory"
      className="pointer-events-auto fixed right-6 top-1/2 z-30 hidden w-60 -translate-y-1/2 border border-[rgba(79,127,255,0.3)] bg-[rgba(11,12,14,0.82)] p-5 backdrop-blur-md md:block"
    >
      <p className="font-mono text-[10px] tracking-[0.3em] text-accent">
        DIRECTORY
      </p>
      <div className="mt-1 h-px w-full bg-gradient-to-r from-[rgba(79,127,255,0.5)] to-transparent" />
      <ul className="mt-4 space-y-3">
        <li>
          <button
            onClick={() => onSelect(null)}
            className={`dir-entry block w-full text-left font-display text-[15px] ${
              active === null ? "active text-fg" : "text-muted hover:text-fg"
            }`}
          >
            All Wings
            <span className="ml-2 font-mono text-[10px] text-accent-dim">
              {Object.values(counts).reduce((a, b) => a + b, 0)}
            </span>
          </button>
        </li>
        {categories.map((c) => (
          <li key={c.slug}>
            <button
              onClick={() => onSelect(active === c.slug ? null : c.slug)}
              className={`dir-entry block w-full text-left ${
                active === c.slug ? "active" : ""
              }`}
            >
              <span className="flex items-baseline gap-2">
                <span
                  className="inline-block h-2 w-2 shrink-0 self-center"
                  style={{ background: c.color }}
                />
                <span
                  className={`font-display text-[15px] leading-tight ${
                    active === c.slug ? "text-fg" : "text-muted"
                  }`}
                >
                  {c.name}
                </span>
              </span>
              <span className="mt-0.5 block pl-4 font-mono text-[10px] tracking-[0.18em] text-accent-dim">
                {c.wing.toUpperCase()} · {counts[c.slug] ?? 0} WORKS
              </span>
            </button>
            <Link
              href={`/gallery/${c.slug}`}
              className="mt-1 block pl-4 font-mono text-[10px] tracking-[0.2em] text-accent transition-colors hover:text-fg"
            >
              ENTER 3D GALLERY →
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
