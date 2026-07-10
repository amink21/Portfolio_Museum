"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ROOM_W } from "@/lib/gallery";
import type { Section } from "@/lib/gallery";

const PORTAL_H = 3.6;

/** Threshold frame across the hall announcing the next section. */
export default function SectionPortal({ section }: { section: Section }) {
  const { category, index, portalZ } = section;
  const texRef = useRef<THREE.CanvasTexture>(null);
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 256;
    return c;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const draw = () => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = category.color;
      ctx.font = "500 84px 'IBM Plex Mono', monospace";
      const label = `0${index}`;
      ctx.fillText(label, 300, 128);
      ctx.fillStyle = "#f4f4f5";
      ctx.font = "600 100px 'Space Grotesk', sans-serif";
      ctx.fillText(category.name.toUpperCase(), 1150, 128);
      if (texRef.current) texRef.current.needsUpdate = true;
    };
    document.fonts.ready.then(draw);
    draw();
    return () => {
      cancelled = true;
    };
  }, [canvas, category, index]);

  const pillarX = ROOM_W / 2 - 0.55;

  return (
    <group position={[0, 0, portalZ]}>
      {/* Pillars */}
      {[-pillarX, pillarX].map((x) => (
        <mesh key={x} position={[x, PORTAL_H / 2, 0]} castShadow>
          <boxGeometry args={[0.16, PORTAL_H, 0.16]} />
          <meshStandardMaterial color="#141416" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* Lintel */}
      <mesh position={[0, PORTAL_H + 0.14, 0]} castShadow>
        <boxGeometry args={[ROOM_W - 0.9, 0.32, 0.2]} />
        <meshStandardMaterial color="#141416" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Section colour strip under the lintel — kept shallow so it reads as a
          thin line, not a slab, when walking directly beneath it */}
      <mesh position={[0, PORTAL_H - 0.015, 0.08]}>
        <boxGeometry args={[ROOM_W - 0.9, 0.035, 0.04]} />
        <meshStandardMaterial
          color={category.color}
          emissive={category.color}
          emissiveIntensity={0.45}
          roughness={0.6}
        />
      </mesh>
      {/* Lintel lettering, facing the approaching visitor */}
      <mesh position={[0, PORTAL_H + 0.14, 0.11]}>
        <planeGeometry args={[5.4, 0.675]} />
        <meshBasicMaterial transparent toneMapped={false}>
          <canvasTexture
            ref={texRef}
            attach="map"
            image={canvas}
            colorSpace={THREE.SRGBColorSpace}
          />
        </meshBasicMaterial>
      </mesh>
    </group>
  );
}
