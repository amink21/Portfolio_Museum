"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import gsap from "gsap";
import type { Category, Museum, Piece } from "@/lib/types";
import InspectOverlay from "./InspectOverlay";

const GalleryScene = dynamic(() => import("./GalleryScene"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-ink">
      <p className="font-mono text-[11px] tracking-[0.3em] text-brass">
        PREPARING THE WING…
      </p>
    </div>
  ),
});

interface Props {
  category: Category;
  pieces: Piece[];
  museum: Museum;
}

export default function GalleryClient({ category, pieces, museum }: Props) {
  const [inspecting, setInspecting] = useState<Piece | null>(null);
  const [locked, setLocked] = useState(false);
  const [entered, setEntered] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  // Entry title card: wing name over black, then it lifts away
  useEffect(() => {
    const tl = gsap.timeline({ onComplete: () => setEntered(true) });
    tl.fromTo(
      ".entry-line",
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.16, ease: "power3.out", delay: 0.4 }
    ).to(
      titleRef.current,
      { autoAlpha: 0, duration: 1.1, ease: "power2.inOut", delay: 1.2 },
      ">"
    );
    return () => {
      tl.kill();
    };
  }, []);

  const inspect = useCallback((piece: Piece) => {
    if (document.pointerLockElement) document.exitPointerLock();
    setInspecting(piece);
  }, []);

  return (
    <main className="fixed inset-0 bg-ink">
      <GalleryScene
        category={category}
        pieces={pieces}
        onInspect={inspect}
        onLockChange={setLocked}
        frozen={inspecting !== null || !entered}
      />

      {/* Entry title card */}
      <div
        ref={titleRef}
        className="pointer-events-none fixed inset-0 z-20 flex flex-col items-center justify-center bg-[rgba(7,8,10,0.86)]"
      >
        <p className="entry-line font-mono text-[11px] tracking-[0.4em]" style={{ color: category.color }}>
          {category.wing.toUpperCase()}
        </p>
        <h1 className="entry-line mt-4 font-serif text-5xl text-parchment md:text-6xl">
          {category.name}
        </h1>
        <p className="entry-line mt-4 font-mono text-[10px] tracking-[0.3em] text-parchment-dim">
          {pieces.length} WORKS · {museum.name.toUpperCase()}
        </p>
      </div>

      {/* Chrome */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-10 flex items-start justify-between p-6">
        <div>
          <Link
            href="/"
            className="pointer-events-auto font-mono text-[10px] tracking-[0.26em] text-parchment-dim transition-colors hover:text-brass"
          >
            ← FLOOR PLAN
          </Link>
          <h2 className="mt-2 font-serif text-lg text-parchment">
            {category.name}
          </h2>
          <p className="font-mono text-[9px] tracking-[0.3em]" style={{ color: category.color }}>
            {category.wing.toUpperCase()}
          </p>
        </div>
        <p className="hidden font-mono text-[10px] tracking-[0.2em] text-parchment-dim md:block">
          {pieces.length} WORKS ON VIEW
        </p>
      </header>

      {/* Crosshair while walking */}
      {locked && !inspecting && (
        <div className="pointer-events-none fixed left-1/2 top-1/2 z-10 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(237,232,222,0.75)] shadow-[0_0_6px_rgba(0,0,0,0.8)]" />
      )}

      {/* Control hints */}
      {entered && !inspecting && (
        <p className="pointer-events-none fixed bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.22em] text-parchment-dim">
          {locked
            ? "W A S D — WALK · LOOK WITH MOUSE · CLICK A WORK TO INSPECT · ESC — RELEASE"
            : "CLICK TO ENTER FIRST-PERSON · W A S D + MOUSE"}
        </p>
      )}

      {inspecting && (
        <InspectOverlay
          piece={inspecting}
          category={category}
          onClose={() => setInspecting(null)}
        />
      )}
    </main>
  );
}
