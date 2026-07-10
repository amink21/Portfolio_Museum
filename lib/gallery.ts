import type { Piece } from "./types";

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

export interface GalleryLayout {
  roomLength: number;
  hangs: Hang[];
  /** where the visitor starts, facing -z */
  start: [number, number, number];
}

export function computeGallery(pieces: Piece[]): GalleryLayout {
  const perWall = Math.max(1, Math.ceil(pieces.length / 2));
  const roomLength = perWall * SPACING + 9;
  const startZ = roomLength / 2 - 6.5;
  const hangs: Hang[] = pieces.map((piece, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const idx = Math.floor(i / 2);
    const z = startZ - idx * SPACING - (side === 1 ? SPACING / 2 : 0);
    return {
      piece,
      position: [side * (ROOM_W / 2 - 0.001), ART_CENTER_Y, z],
      rotationY: side === -1 ? Math.PI / 2 : -Math.PI / 2,
      side,
    };
  });
  return {
    roomLength,
    hangs,
    start: [0, EYE_HEIGHT, roomLength / 2 - 1.6],
  };
}
