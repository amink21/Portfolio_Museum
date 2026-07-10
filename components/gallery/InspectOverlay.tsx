"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Category, Piece } from "@/lib/types";

interface Props {
  piece: Piece;
  category: Category;
  onClose: () => void;
}

export default function InspectOverlay({ piece, category, onClose }: Props) {
  const veilRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState({ s: 1, x: 0, y: 0 });
  const dragging = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        veilRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        ".insp-img",
        { scale: 0.92, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.65, ease: "power3.out" }
      );
      gsap.fromTo(
        ".insp-panel",
        { y: 36, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, delay: 0.15, ease: "power3.out" }
      );
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      ctx.revert();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    setZoom((z) => {
      const ns = Math.min(3.2, Math.max(1, z.s * Math.exp(-e.deltaY * 0.0016)));
      if (ns === 1) return { s: 1, x: 0, y: 0 };
      return { ...z, s: ns };
    });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoom.s === 1) return;
      dragging.current = { x: e.clientX - zoom.x, y: e.clientY - zoom.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [zoom]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    setZoom((z) => ({
      ...z,
      x: e.clientX - dragging.current!.x,
      y: e.clientY - dragging.current!.y,
    }));
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  return (
    <div
      ref={veilRef}
      className="fixed inset-0 z-30 flex flex-col bg-[rgba(5,6,8,0.93)] md:flex-row"
    >
      {/* The work, zoomable */}
      <div
        ref={imgWrapRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6 md:p-12"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => setZoom({ s: 1, x: 0, y: 0 })}
        style={{ cursor: zoom.s > 1 ? "grab" : "zoom-in" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={piece.image}
          alt={piece.title}
          className="insp-img max-h-full max-w-full object-contain shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
          style={{
            transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})`,
            transition: dragging.current ? "none" : "transform 0.25s ease-out",
          }}
          draggable={false}
        />
        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tracking-[0.24em] text-muted">
          SCROLL TO MAGNIFY · DOUBLE-CLICK TO RESET
        </p>
      </div>

      {/* Catalog panel */}
      <aside
        className="insp-panel w-full shrink-0 overflow-y-auto border-t border-[rgba(244,244,245,0.12)] bg-[#0e0e12] p-7 md:w-[380px] md:border-l md:border-t-0 md:p-9"
        style={{ boxShadow: `inset 0 3px 0 ${category.color}` }}
      >
        <p className="font-mono text-[10px] tracking-[0.32em]" style={{ color: category.color }}>
          {category.wing.toUpperCase()} — {category.name.toUpperCase()}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-fg">
          {piece.title}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-md border border-[rgba(244,244,245,0.14)] px-2.5 py-1 font-mono text-[11px] tracking-[0.14em] text-muted">
            {piece.yearIsPlaceholder ? "c. " : ""}
            {piece.year}
          </span>
          <span className="rounded-md border border-[rgba(244,244,245,0.14)] px-2.5 py-1 font-mono text-[11px] tracking-[0.14em] text-muted">
            CAT. {piece.catalogNo}
          </span>
        </div>
        <p className="mt-5 text-[13.5px] leading-relaxed text-muted">
          {piece.description}
        </p>
        {(piece.yearIsPlaceholder || piece.descriptionIsPlaceholder) && (
          <p className="mt-4 inline-block border border-[rgba(79,127,255,0.35)] px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-accent-dim">
            DRAFT RECORD — DETAILS PENDING
          </p>
        )}
        <button
          onClick={onClose}
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-[rgba(79,127,255,0.5)] px-4 py-2.5 font-mono text-[11px] tracking-[0.2em] text-accent transition-colors hover:bg-accent hover:text-base"
        >
          ← RETURN TO THE WING
        </button>
      </aside>
    </div>
  );
}
