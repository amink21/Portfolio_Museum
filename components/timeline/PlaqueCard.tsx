"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import type { Category, Piece } from "@/lib/types";
import { toRoman } from "@/lib/floorplan";

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
        { autoAlpha: 1, duration: 0.45, ease: "power2.out" }
      );
      gsap.fromTo(
        cardRef.current,
        { autoAlpha: 0, y: 46, rotateX: 7 },
        {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          duration: 0.7,
          ease: "power3.out",
          delay: 0.08,
        }
      );
      gsap.fromTo(
        ".plaque-line",
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.07,
          delay: 0.3,
          ease: "power2.out",
        }
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
      className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(4,5,7,0.78)] p-4 backdrop-blur-sm md:p-10"
      style={{ perspective: "1200px" }}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-full w-full max-w-4xl grid-cols-1 overflow-y-auto md:grid-cols-[1.15fr_1fr]"
      >
        {/* The work, matted and framed */}
        <div className="flex items-center justify-center border border-[rgba(201,162,39,0.25)] bg-[#101116] p-6 md:p-10">
          <div className="border border-[rgba(201,162,39,0.45)] bg-[#0d0e11] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={piece.image}
              alt={piece.title}
              className="block max-h-[52vh] w-full object-contain"
            />
          </div>
        </div>

        {/* The engraved plaque */}
        <div className="plaque relative flex flex-col justify-between p-7 md:p-9">
          <span className="plaque-screw absolute left-3 top-3" />
          <span className="plaque-screw absolute right-3 top-3" />
          <span className="plaque-screw absolute bottom-3 left-3" />
          <span className="plaque-screw absolute bottom-3 right-3" />

          <div>
            <p className="plaque-line font-mono text-[10px] tracking-[0.32em] text-brass-dim">
              {category.wing.toUpperCase()} — {category.name.toUpperCase()}
            </p>
            <h2 className="plaque-line engraved mt-3 font-serif text-3xl leading-[1.08] md:text-4xl">
              {piece.title}
            </h2>
            <p className="plaque-line mt-3 font-mono text-xs tracking-[0.22em] text-parchment-dim">
              {piece.yearIsPlaceholder ? "c. " : ""}
              {piece.year} · {toRoman(piece.year)} · CAT. {piece.catalogNo}
            </p>
            <div className="plaque-line mt-5 h-px w-24 bg-gradient-to-r from-[rgba(201,162,39,0.7)] to-transparent" />
            <p className="plaque-line mt-5 text-[13.5px] leading-relaxed text-parchment-dim">
              {piece.description}
            </p>
            {draft && (
              <p className="plaque-line mt-4 inline-block border border-[rgba(201,162,39,0.35)] px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-brass-dim">
                DRAFT RECORD — DETAILS PENDING
              </p>
            )}
          </div>

          <div className="plaque-line mt-8 flex items-center justify-between gap-4">
            <Link
              href={`/gallery/${category.slug}`}
              className="group inline-flex items-center gap-2 border border-[rgba(201,162,39,0.5)] px-4 py-2.5 font-mono text-[11px] tracking-[0.2em] text-brass transition-colors hover:bg-brass hover:text-ink"
            >
              ENTER {category.wing.toUpperCase()}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <button
              onClick={onClose}
              className="font-mono text-[11px] tracking-[0.2em] text-parchment-dim transition-colors hover:text-parchment"
            >
              CLOSE ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
