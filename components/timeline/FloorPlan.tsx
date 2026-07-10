"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import type { Category, MuseumData, Piece } from "@/lib/types";
import {
  AXIS_H,
  computePlan,
  MARGIN_X,
  yearX,
  type WingRect,
} from "@/lib/floorplan";
import Directory from "./Directory";
import PlaqueCard from "./PlaqueCard";

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export default function FloorPlan({ data }: { data: MuseumData }) {
  const plan = useMemo(
    () => computePlan(data.categories, data.pieces),
    [data]
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of data.pieces) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [data]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cam = useRef({ x: 0, y: 0, s: 0.35 });
  const target = useRef({ x: 0, y: 0, s: 0.35 });
  const fitScale = useRef(0.35);
  const bucket = useRef("far");
  const draggedRef = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef(0);

  const [filter, setFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    piece: Piece;
    category: Category;
  } | null>(null);
  const [hintGone, setHintGone] = useState(false);

  const fitWorld = useCallback(
    (
      rect: { x: number; y: number; w: number; h: number },
      pad: number
    ): { x: number; y: number; s: number } => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = clamp(
        Math.min(vw / (rect.w + pad * 2), vh / (rect.h + pad * 2)),
        0.05,
        3.4
      );
      return {
        x: (vw - rect.w * s) / 2 - rect.x * s,
        y: (vh - rect.h * s) / 2 - rect.y * s,
        s,
      };
    },
    []
  );

  // Camera loop + wheel/pointer events
  useEffect(() => {
    const vp = viewportRef.current!;
    const world = worldRef.current!;

    const full = { x: 0, y: 0, w: plan.worldW, h: plan.worldH };
    const home = fitWorld(full, 60);
    fitScale.current = home.s;
    target.current = { ...home };
    cam.current = { x: home.x, y: home.y + 40, s: home.s * 0.82 };

    const tick = () => {
      const c = cam.current;
      const t = target.current;
      c.x += (t.x - c.x) * 0.11;
      c.y += (t.y - c.y) * 0.11;
      c.s += (t.s - c.s) * 0.11;
      world.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.s})`;
      const rel = c.s / fitScale.current;
      const b = rel < 1.35 ? "far" : rel < 2.6 ? "mid" : "near";
      if (b !== bucket.current) {
        bucket.current = b;
        vp.dataset.zoom = b;
      }
    };
    gsap.ticker.add(tick);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setHintGone(true);
      const t = target.current;
      const factor = Math.exp(-e.deltaY * 0.0014);
      const ns = clamp(t.s * factor, fitScale.current * 0.8, 3.4);
      const cx = e.clientX;
      const cy = e.clientY;
      t.x = cx - ((cx - t.x) * ns) / t.s;
      t.y = cy - ((cy - t.y) * ns) / t.s;
      t.s = ns;
    };

    // NB: no setPointerCapture here — capturing retargets the eventual `click`
    // to the viewport, which would swallow clicks on medallions and links.
    const onPointerDown = (e: PointerEvent) => {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      draggedRef.current = false;
      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y);
      }
      vp.classList.add("dragging");
    };

    const onPointerMove = (e: PointerEvent) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      const cur = { x: e.clientX, y: e.clientY };
      pointers.current.set(e.pointerId, cur);
      const t = target.current;

      if (pointers.current.size === 2) {
        const [a, b] = [...pointers.current.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (pinchDist.current > 0) {
          const ns = clamp(
            t.s * (dist / pinchDist.current),
            fitScale.current * 0.8,
            3.4
          );
          t.x = mid.x - ((mid.x - t.x) * ns) / t.s;
          t.y = mid.y - ((mid.y - t.y) * ns) / t.s;
          t.s = ns;
        }
        pinchDist.current = dist;
        draggedRef.current = true;
        setHintGone(true);
        return;
      }

      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) {
        draggedRef.current = true;
        setHintGone(true);
      }
      t.x += dx;
      t.y += dy;
    };

    const onPointerUp = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      pinchDist.current = 0;
      if (pointers.current.size === 0) vp.classList.remove("dragging");
    };

    const onDblClick = (e: MouseEvent) => {
      const t = target.current;
      const ns = clamp(t.s * 1.9, fitScale.current * 0.8, 3.4);
      t.x = e.clientX - ((e.clientX - t.x) * ns) / t.s;
      t.y = e.clientY - ((e.clientY - t.y) * ns) / t.s;
      t.s = ns;
    };

    const onResize = () => {
      const h = fitWorld(full, 60);
      fitScale.current = h.s;
    };

    vp.addEventListener("wheel", onWheel, { passive: false });
    vp.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    vp.addEventListener("dblclick", onDblClick);
    window.addEventListener("resize", onResize);

    // Entrance: wings and nodes settle in
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".fp-axis-line",
        { scaleX: 0 },
        { scaleX: 1, transformOrigin: "0 50%", duration: 1.4, ease: "power3.inOut" }
      );
      gsap.fromTo(
        ".fp-wing",
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09, ease: "power3.out", delay: 0.25 }
      );
      gsap.fromTo(
        ".fp-node",
        { autoAlpha: 0, scale: 0.5 },
        { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.018, ease: "back.out(1.6)", delay: 0.7 }
      );
    }, world);

    return () => {
      gsap.ticker.remove(tick);
      ctx.revert();
      vp.removeEventListener("wheel", onWheel);
      vp.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      vp.removeEventListener("dblclick", onDblClick);
      window.removeEventListener("resize", onResize);
    };
  }, [plan, fitWorld]);

  const focusWing = useCallback(
    (slug: string | null) => {
      setFilter(slug);
      const dest = slug
        ? fitWorld(
            plan.wings.find((w) => w.category.slug === slug) as WingRect,
            130
          )
        : fitWorld({ x: 0, y: 0, w: plan.worldW, h: plan.worldH }, 60);
      gsap.to(target.current, {
        x: dest.x,
        y: dest.y,
        s: dest.s,
        duration: 1.15,
        ease: "power3.inOut",
      });
    },
    [plan, fitWorld]
  );

  const openPiece = useCallback(
    (piece: Piece) => {
      if (draggedRef.current) return;
      const category = data.categories.find((c) => c.slug === piece.category)!;
      setSelected({ piece, category });
    },
    [data]
  );

  return (
    <main>
      {/* Fixed chrome */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-30 flex items-start justify-between p-6 md:p-8">
        <div>
          <Link
            href="/"
            className="pointer-events-auto font-mono text-[10px] tracking-[0.26em] text-muted transition-colors hover:text-accent"
          >
            ← HOME
          </Link>
          <h1 className="mt-2 font-display text-xl font-semibold tracking-wide text-fg md:text-2xl">
            {data.museum.name}
          </h1>
          <p className="mt-1 font-mono text-[10px] tracking-[0.3em] text-accent">
            DESIGN MUSEUM — TIMELINE
          </p>
        </div>
        <p className="hidden max-w-[260px] text-right font-mono text-[10px] leading-relaxed tracking-[0.14em] text-muted md:block">
          {data.museum.tagline.toUpperCase()}
        </p>
      </header>

      <Directory
        categories={data.categories}
        counts={counts}
        active={filter}
        onSelect={focusWing}
      />

      {/* Mobile wing chips */}
      <div className="fixed bottom-16 left-0 right-0 z-30 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden">
        {data.categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => focusWing(filter === c.slug ? null : c.slug)}
            className={`shrink-0 border px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] backdrop-blur-md ${
              filter === c.slug
                ? "border-accent bg-[rgba(79,127,255,0.15)] text-accent"
                : "border-[rgba(244,244,245,0.2)] bg-[rgba(11,12,14,0.7)] text-muted"
            }`}
          >
            {c.name.toUpperCase()}
          </button>
        ))}
      </div>

      {!hintGone && (
        <p className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.24em] text-muted">
          DRAG TO PAN · SCROLL TO ZOOM · SELECT A MEDALLION
        </p>
      )}

      {/* The zoomable plan */}
      <div ref={viewportRef} className="fp-viewport" data-zoom="far">
        <div
          ref={worldRef}
          className="fp-world"
          style={{ width: plan.worldW, height: plan.worldH }}
        >
          {/* Year gridlines */}
          {plan.years.map((y) => (
            <div
              key={`grid-${y}`}
              className="absolute"
              style={{
                left: yearX(y, plan.minYear),
                top: AXIS_H - 20,
                bottom: 140,
                borderLeft: "1px dashed rgba(244,244,245,0.09)",
              }}
            />
          ))}

          {/* Time axis */}
          <div
            className="absolute"
            style={{ left: MARGIN_X * 0.5, right: MARGIN_X * 0.5, top: AXIS_H - 56 }}
          >
            <div className="fp-axis-line h-px w-full bg-gradient-to-r from-transparent via-[rgba(79,127,255,0.75)] to-transparent" />
          </div>
          {plan.years.map((y) => (
            <div
              key={`tick-${y}`}
              className="absolute -translate-x-1/2 text-center"
              style={{ left: yearX(y, plan.minYear), top: AXIS_H - 48 }}
            >
              <div className="mx-auto h-3 w-px bg-[rgba(79,127,255,0.6)]" />
              <p className="mt-2 font-mono text-[15px] tracking-[0.28em] text-fg">
                {y}
              </p>
            </div>
          ))}

          {/* Wings */}
          {plan.wings.map((w) => {
            const c = w.category;
            const dimmed = filter !== null && filter !== c.slug;
            return (
              <div
                key={c.slug}
                className={`fp-wing ${dimmed ? "dimmed" : ""} ${
                  filter === c.slug ? "focused" : ""
                }`}
                style={{ left: w.x, top: w.y, width: w.w, height: w.h }}
              >
                <div
                  className="fp-wing-floor"
                  style={{ background: `${c.color}0d` }}
                />
                <div
                  className="fp-wing-floor hatch"
                  style={{ color: `${c.color}14` }}
                />
                <div className="fp-wing-wall" />
                <span className="fp-door" style={{ left: "22%" }} />
                <span className="fp-door" style={{ left: "58%" }} />
                <span className="fp-door" style={{ left: "86%" }} />
                <span
                  className="fp-corner"
                  style={{ left: -3, top: -3, borderLeftWidth: 2, borderTopWidth: 2 }}
                />
                <span
                  className="fp-corner"
                  style={{ right: -3, top: -3, borderRightWidth: 2, borderTopWidth: 2 }}
                />
                <span
                  className="fp-corner"
                  style={{ left: -3, bottom: -3, borderLeftWidth: 2, borderBottomWidth: 2 }}
                />
                <span
                  className="fp-corner"
                  style={{ right: -3, bottom: -3, borderRightWidth: 2, borderBottomWidth: 2 }}
                />
                <Link
                  href={`/gallery/${c.slug}`}
                  className="fp-enter"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    if (draggedRef.current) e.preventDefault();
                  }}
                >
                  ENTER 3D GALLERY →
                </Link>
                <div className="pointer-events-none absolute -top-4 left-1 flex -translate-y-full items-baseline gap-4">
                  <p
                    className="font-mono text-[11px] tracking-[0.34em]"
                    style={{ color: c.color }}
                  >
                    {c.wing.toUpperCase()}
                  </p>
                  <h2 className="font-display text-[26px] leading-none text-fg">
                    {c.name}
                  </h2>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-muted">
                    {counts[c.slug] ?? 0} WORKS
                  </p>
                </div>
              </div>
            );
          })}

          {/* Project nodes */}
          {plan.nodes.map(({ piece, x, y }) => {
            const c = data.categories.find((k) => k.slug === piece.category)!;
            const dimmed = filter !== null && filter !== piece.category;
            return (
              <div
                key={piece.slug}
                className={`fp-node ${dimmed ? "dimmed" : ""}`}
                style={{ left: x, top: y }}
              >
                <button onClick={() => openPiece(piece)} aria-label={piece.title}>
                  <span
                    className="fp-medallion"
                    style={{ borderColor: filter === piece.category ? c.color : undefined }}
                  >
                    {piece.catalogNo}
                  </span>
                  <span className="fp-node-label">
                    <span className="t">{piece.title}</span>
                    <span className="y">
                      {piece.yearIsPlaceholder ? "c. " : ""}
                      {piece.year}
                    </span>
                  </span>
                  <span className="fp-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={piece.image} alt="" loading="lazy" />
                  </span>
                </button>
              </div>
            );
          })}

          {/* Cartouche */}
          <div
            className="absolute border border-[rgba(244,244,245,0.25)] p-5"
            style={{ left: MARGIN_X * 0.5, bottom: 40, width: 340 }}
          >
            <p className="font-display text-[17px] text-fg">
              {data.museum.name}
            </p>
            <p className="mt-1 font-mono text-[9px] tracking-[0.26em] text-muted">
              PLAN OF THE COLLECTION · HUNG BY YEAR
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 w-24 border border-[rgba(244,244,245,0.4)]">
                <div className="h-full w-1/2 bg-[rgba(244,244,245,0.4)]" />
              </div>
              <p className="font-mono text-[9px] tracking-[0.2em] text-muted">
                ONE YEAR
              </p>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <PlaqueCard
          piece={selected.piece}
          category={selected.category}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
}
