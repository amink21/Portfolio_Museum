"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import type { Category, Piece } from "@/lib/types";

interface Props {
  piece: Piece;
  category: Category;
  onClose: () => void;
}

export default function PlaqueCard({ piece, category, onClose }: Props) {
  const veilRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        veilRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        cardRef.current,
        { autoAlpha: 0, y: 36, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", delay: 0.06 }
      );
      gsap.fromTo(
        ".card-line",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.06, delay: 0.25, ease: "power2.out" }
      );
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      ctx.revert();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const draft = piece.yearIsPlaceholder || piece.descriptionIsPlaceholder;

  return (
    <div
      ref={veilRef}
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(5,5,7,0.8)] p-4 backdrop-blur-md md:p-10"
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-full w-full max-w-4xl grid-cols-1 overflow-hidden overflow-y-auto rounded-2xl border border-[rgba(244,244,245,0.12)] bg-[#101014] md:grid-cols-[1.15fr_1fr]"
      >
        {/* The work */}
        <div className="flex items-center justify-center bg-[#0c0c0f] p-6 md:p-10">
          <div className="overflow-hidden rounded-lg border border-[rgba(244,244,245,0.1)] shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={piece.image}
              alt={piece.title}
              className="block max-h-[52vh] w-full object-contain"
            />
          </div>
        </div>

        {/* Record panel */}
        <div
          className="relative flex flex-col justify-between p-7 md:p-9"
          style={{ boxShadow: `inset 3px 0 0 ${category.color}` }}
        >
          <div>
            <p
              className="card-line font-mono text-[10px] tracking-[0.32em]"
              style={{ color: category.color }}
            >
              {category.wing.toUpperCase()} — {category.name.toUpperCase()}
            </p>
            <h2 className="card-line mt-3 font-display text-3xl font-semibold leading-[1.08] text-fg md:text-4xl">
              {piece.title}
            </h2>
            <div className="card-line mt-4 flex flex-wrap gap-2">
              <span className="rounded-md border border-[rgba(244,244,245,0.14)] px-2.5 py-1 font-mono text-[11px] tracking-[0.14em] text-muted">
                {piece.yearIsPlaceholder ? "c. " : ""}
                {piece.year}
              </span>
              <span className="rounded-md border border-[rgba(244,244,245,0.14)] px-2.5 py-1 font-mono text-[11px] tracking-[0.14em] text-muted">
                CAT. {piece.catalogNo}
              </span>
            </div>
            <p className="card-line mt-5 text-[13.5px] leading-relaxed text-muted">
              {piece.description}
            </p>
            {draft && (
              <p className="card-line mt-4 inline-block rounded-md border border-[rgba(79,127,255,0.4)] px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-accent">
                DRAFT RECORD — DETAILS PENDING
              </p>
            )}
          </div>

          <div className="card-line mt-8 flex items-center justify-between gap-4">
            <Link
              href={`/gallery/${category.slug}`}
              className="group inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-mono text-[11px] tracking-[0.2em] text-base transition-opacity hover:opacity-85"
            >
              ENTER {category.wing.toUpperCase()}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <button
              onClick={onClose}
              className="font-mono text-[11px] tracking-[0.2em] text-muted transition-colors hover:text-fg"
            >
              CLOSE ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
