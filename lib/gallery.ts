import type { Category, Piece } from "./types";

/** Room + hanging layout for a wing gallery (meters). */
export const ROOM_W = 10;
export const ROOM_H = 5;
export const SPACING = 4.6;
export const EYE_HEIGHT = 1.6;
export const ART_CENTER_Y = 1.62;

export interface Hang {
  piece: Piece;
  position: [number, number, number];
  rotationY: number;
  /** -1 = left wall, +1 = right wall */
  side: number;
}

export interface Section {
  category: Category;
  index: number;
  /** z of the section threshold portal */
  portalZ: number;
  /** z to teleport a visitor to when jumping to this section */
  jumpZ: number;
}

export interface MuseumLayout {
  roomLength: number;
  hangs: Hang[];
  sections: Section[];
  /** where the visitor starts, facing -z */
  start: [number, number, number];
}

const HEAD = 7; // entry vestibule before the first section
const TAIL = 7; // room past the last piece to the end wall
const SECTION_GAP = 5; // portal to first piece of a section

/**
 * One continuous wing for the whole collection: sections follow each other
 * down a single hall, each announced by a threshold portal.
 */
export function computeMuseum(
  categories: Category[],
  pieces: Piece[]
): MuseumLayout {
  const ordered = [...categories].sort((a, b) => a.ordinal - b.ordinal);
  const groups = ordered
    .map((category) => ({
      category,
      pieces: pieces
        .filter((p) => p.category === category.slug)
        .sort(
          (a, b) => a.year - b.year || a.catalogNo.localeCompare(b.catalogNo)
        ),
    }))
    .filter((g) => g.pieces.length > 0);

  const sectionLen = (n: number) =>
    SECTION_GAP + Math.max(1, Math.ceil(n / 2)) * SPACING;
  const roomLength =
    HEAD + groups.reduce((acc, g) => acc + sectionLen(g.pieces.length), 0) + TAIL;

  const hangs: Hang[] = [];
  const sections: Section[] = [];
  let cursor = roomLength / 2 - HEAD;

  groups.forEach((group, gi) => {
    sections.push({
      category: group.category,
      index: gi + 1,
      portalZ: cursor,
      jumpZ: cursor + 2.2,
    });
    group.pieces.forEach((piece, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const idx = Math.floor(i / 2);
      const z =
        cursor - SECTION_GAP - idx * SPACING - (side === 1 ? SPACING / 2 : 0);
      hangs.push({
        piece,
        position: [side * (ROOM_W / 2 - 0.001), ART_CENTER_Y, z],
        rotationY: side === -1 ? Math.PI / 2 : -Math.PI / 2,
        side,
      });
    });
    cursor -= sectionLen(group.pieces.length);
  });

  return {
    roomLength,
    hangs,
    sections,
    start: [0, EYE_HEIGHT, roomLength / 2 - 1.6],
  };
}
