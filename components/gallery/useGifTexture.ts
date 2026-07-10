"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { parseGIF, decompressFrames, ParsedFrame } from "gifuct-js";

/**
 * Decodes an animated GIF and plays it into a CanvasTexture, honouring each
 * frame's delay and disposal method. three.js only samples a GIF's first
 * frame, so animated pieces need this to actually move on the wall.
 */
export function useGifTexture(url: string) {
  const [ready, setReady] = useState<{
    texture: THREE.CanvasTexture;
  } | null>(null);
  const framesRef = useRef<ParsedFrame[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const patchRef = useRef<HTMLCanvasElement | null>(null);
  const prevRef = useRef<ParsedFrame | null>(null);
  const cursorRef = useRef({ index: -1, nextAt: 0 });

  useEffect(() => {
    let cancelled = false;
    let texture: THREE.CanvasTexture | null = null;
    (async () => {
      const buf = await (await fetch(url)).arrayBuffer();
      if (cancelled) return;
      const gif = parseGIF(buf);
      const frames = decompressFrames(gif, true);
      if (!frames.length) return;
      const canvas = document.createElement("canvas");
      canvas.width = gif.lsd.width;
      canvas.height = gif.lsd.height;
      ctxRef.current = canvas.getContext("2d");
      patchRef.current = document.createElement("canvas");
      framesRef.current = frames;
      cursorRef.current = { index: -1, nextAt: 0 };
      texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      setReady({ texture });
    })();
    return () => {
      cancelled = true;
      texture?.dispose();
    };
  }, [url]);

  useFrame(() => {
    const frames = framesRef.current;
    const ctx = ctxRef.current;
    if (!ready || frames.length === 0 || !ctx) return;
    const now = performance.now();
    const cursor = cursorRef.current;
    if (now < cursor.nextAt) return;

    cursor.index = (cursor.index + 1) % frames.length;
    const frame = frames[cursor.index];
    const prev = prevRef.current;
    if (cursor.index === 0) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    } else if (prev && prev.disposalType === 2) {
      ctx.clearRect(prev.dims.left, prev.dims.top, prev.dims.width, prev.dims.height);
    }

    const { dims, patch } = frame;
    const pc = patchRef.current!;
    if (pc.width !== dims.width || pc.height !== dims.height) {
      pc.width = dims.width;
      pc.height = dims.height;
    }
    pc.getContext("2d")!.putImageData(
      new ImageData(new Uint8ClampedArray(patch), dims.width, dims.height),
      0,
      0
    );
    ctx.drawImage(pc, dims.left, dims.top);

    prevRef.current = frame;
    cursor.nextAt = now + Math.max(frame.delay || 100, 20);
    ready.texture.needsUpdate = true;
  });

  return ready?.texture ?? null;
}
