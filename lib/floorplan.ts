import type { Category, Piece } from "./types";

/** World-coordinate constants for the floor plan (CSS px at scale = 1). */
export const PX_PER_YEAR = 420;
export const LANE_H = 300;
export const LANE_GAP = 96;
export const AXIS_H = 140;
export const MARGIN_X = 260;

export interface NodePos {
  piece: Piece;
  x: number;
  y: number;
}

export interface WingRect {
  category: Category;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlanLayout {
  minYear: number;
  maxYear: number;
  years: number[];
  worldW: number;
  worldH: number;
  wings: WingRect[];
  nodes: NodePos[];
}

const ROMAN: Record<number, string> = {
  2017: "MMXVII",
  2018: "MMXVIII",
  2019: "MMXIX",
  2020: "MMXX",
  2021: "MMXXI",
  2022: "MMXXII",
  2023: "MMXXIII",
  2024: "MMXXIV",
  2025: "MMXXV",
  2026: "MMXXVI",
};

export function toRoman(year: number): string {
  return ROMAN[year] ?? String(year);
}

export function yearX(year: number, minYear: number): number {
  return MARGIN_X + (year - minYear + 0.5) * PX_PER_YEAR;
}

export function computePlan(categories: Category[], pieces: Piece[]): PlanLayout {
  const allYears = pieces.map((p) => p.year);
  const minYear = Math.min(...allYears);
  const maxYear = Math.max(...allYears);
  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) years.push(y);

  const worldW = MARGIN_X * 2 + years.length * PX_PER_YEAR;
  const worldH = AXIS_H + categories.length * (LANE_H + LANE_GAP) + 220;

  const sorted = [...categories].sort((a, b) => a.ordinal - b.ordinal);
  const wings: WingRect[] = sorted.map((c, i) => ({
    category: c,
    x: MARGIN_X * 0.5,
    y: AXIS_H + i * (LANE_H + LANE_GAP),
    w: worldW - MARGIN_X,
    h: LANE_H,
  }));

  const nodes: NodePos[] = [];
  for (const wing of wings) {
    const catPieces = pieces
      .filter((p) => p.category === wing.category.slug)
      .sort(
        (a, b) => a.year - b.year || a.catalogNo.localeCompare(b.catalogNo)
      );
    const byYear = new Map<number, Piece[]>();
    for (const p of catPieces) {
      const list = byYear.get(p.year) ?? [];
      list.push(p);
      byYear.set(p.year, list);
    }
    for (const [year, group] of byYear) {
      group.forEach((piece, j) => {
        const n = group.length;
        const x = yearX(year, minYear) + (j - (n - 1) / 2) * 150;
        const y =
          wing.y + LANE_H / 2 + 14 + (n > 1 ? (j % 2 === 0 ? -52 : 52) : 0);
        nodes.push({ piece, x, y });
      });
    }
  }

  return { minYear, maxYear, years, worldW, worldH, wings, nodes };
}
