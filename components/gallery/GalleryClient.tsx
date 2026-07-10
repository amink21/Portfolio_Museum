"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import type { Category, Museum, Piece } from "@/lib/types";
import { computeMuseum } from "@/lib/gallery";
import InspectOverlay from "./InspectOverlay";

const GalleryScene = dynamic(() => import("./GalleryScene"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-base">
      <p className="font-mono text-[11px] tracking-[0.3em] text-accent">
        PREPARING THE MUSEUM…
      </p>
    </div>
  ),
});

interface Props {
  museum: Museum;
  categories: Category[];
  pieces: Piece[];
}

export default function GalleryClient({ museum, categories, pieces }: Props) {
  const layout = useMemo(
    () => computeMuseum(categories, pieces),
    [categories, pieces]
  );
  const [inspecting, setInspecting] = useState<Piece | null>(null);
  const [locked, setLocked] = useState(false);
  const [entered, setEntered] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<{ x: number; z: number } | null>(null);

  // Entry title card rises over black while the scene compiles…
  useEffect(() => {
    const tween = gsap.fromTo(
      ".entry-line",
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.16, ease: "power3.out", delay: 0.4 }
    );
    return () => {
      tween.kill();
    };
  }, []);

  // …and lifts away only once the scene has actually rendered frames
  useEffect(() => {
    if (!sceneReady) return;
    const tween = gsap.to(titleRef.current, {
      autoAlpha: 0,
      duration: 1.1,
      ease: "power2.inOut",
      delay: 0.9,
      onComplete: () => setEntered(true),
    });
    return () => {
      tween.kill();
    };
  }, [sceneReady]);

  const inspect = useCallback((piece: Piece) => {
    if (document.pointerLockElement) document.exitPointerLock();
    setInspecting(piece);
  }, []);

  const jumpTo = useCallback(
    (slug: string) => {
      const section = layout.sections.find((s) => s.category.slug === slug);
      if (!section) return;
      jumpRef.current = { x: 0, z: section.jumpZ };
      setActiveSection(slug);
    },
    [layout]
  );

  const inspectingCategory = inspecting
    ? categories.find((c) => c.slug === inspecting.category)
    : null;

  return (
    <main className="fixed inset-0 bg-base">
      <GalleryScene
        museum={museum}
        layout={layout}
        onInspect={inspect}
        onLockChange={setLocked}
        onReady={() => setSceneReady(true)}
        frozen={inspecting !== null || !entered}
        jumpRef={jumpRef}
      />

      {/* Entry title card */}
      <div
        ref={titleRef}
        className="pointer-events-none fixed inset-0 z-20 flex flex-col items-center justify-center bg-[rgba(7,7,9,0.88)]"
      >
        <p className="entry-line font-mono text-[11px] tracking-[0.4em] text-accent">
          THE DESIGN MUSEUM
        </p>
        <h1 className="entry-line mt-4 font-display text-5xl font-semibold text-fg md:text-6xl">
          {museum.name}
        </h1>
        <p className="entry-line mt-4 font-mono text-[10px] tracking-[0.3em] text-muted">
          {pieces.length} WORKS · {layout.sections.length} SECTIONS · ONE WING
        </p>
      </div>

      {/* Chrome */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-10 flex items-start justify-between p-6">
        <div className="rounded-lg bg-[rgba(10,10,11,0.72)] px-4 py-3 backdrop-blur-sm">
          <Link
            href="/"
            className="pointer-events-auto font-mono text-[10px] tracking-[0.26em] text-muted transition-colors hover:text-accent"
          >
            ← HOME
          </Link>
          <h2 className="mt-2 font-display text-lg font-semibold text-fg">
            {museum.name}
          </h2>
          <p className="font-mono text-[9px] tracking-[0.3em] text-accent">
            ONE WING · {pieces.length} WORKS
          </p>
        </div>
      </header>

      {/* Section index (desktop) */}
      <nav
        aria-label="Sections"
        className="fixed right-6 top-1/2 z-10 hidden w-56 -translate-y-1/2 rounded-xl border border-[rgba(244,244,245,0.12)] bg-[rgba(10,10,11,0.78)] p-5 backdrop-blur-md md:block"
      >
        <p className="font-mono text-[10px] tracking-[0.3em] text-accent">
          SECTIONS
        </p>
        <ul className="mt-3 space-y-2.5">
          {layout.sections.map((s) => (
            <li key={s.category.slug}>
              <button
                onClick={() => jumpTo(s.category.slug)}
                className={`group flex w-full items-baseline gap-2.5 text-left ${
                  activeSection === s.category.slug
                    ? "text-fg"
                    : "text-muted hover:text-fg"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 self-center rounded-full"
                  style={{ background: s.category.color }}
                />
                <span className="font-mono text-[10px] tracking-[0.12em]">
                  0{s.index}
                </span>
                <span className="font-display text-[14px] leading-tight transition-transform group-hover:translate-x-0.5">
                  {s.category.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-[rgba(244,244,245,0.1)] pt-3 font-mono text-[9px] leading-relaxed tracking-[0.14em] text-muted">
          SELECT TO GLIDE THERE
        </p>
      </nav>

      {/* Section chips (mobile) */}
      <div className="fixed bottom-16 left-0 right-0 z-10 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
        {layout.sections.map((s) => (
          <button
            key={s.category.slug}
            onClick={() => jumpTo(s.category.slug)}
            className={`shrink-0 rounded-md border px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] backdrop-blur-md ${
              activeSection === s.category.slug
                ? "border-accent bg-[rgba(79,127,255,0.15)] text-accent"
                : "border-[rgba(244,244,245,0.2)] bg-[rgba(10,10,11,0.7)] text-muted"
            }`}
          >
            {s.category.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Crosshair while walking */}
      {locked && !inspecting && (
        <div className="pointer-events-none fixed left-1/2 top-1/2 z-10 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(244,244,245,0.75)] shadow-[0_0_6px_rgba(0,0,0,0.8)]" />
      )}

      {/* Control hints */}
      {entered && !inspecting && (
        <p className="pointer-events-none fixed bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[rgba(10,10,11,0.72)] px-4 py-2 font-mono text-[10px] tracking-[0.22em] text-muted backdrop-blur-sm">
          {locked
            ? "W A S D — WALK · LOOK WITH MOUSE · CLICK A WORK TO INSPECT · ESC — RELEASE"
            : "CLICK A WORK TO INSPECT · CLICK THE FLOOR TO WALK (W A S D + MOUSE)"}
        </p>
      )}

      {inspecting && inspectingCategory && (
        <InspectOverlay
          piece={inspecting}
          category={inspectingCategory}
          onClose={() => setInspecting(null)}
        />
      )}
    </main>
  );
}
