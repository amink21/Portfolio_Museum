"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Piece } from "@/lib/types";
import { ROOM_H, type Hang } from "@/lib/gallery";
import AimedSpot from "./AimedSpot";

const FRAME_T = 0.075; // frame bar thickness
const FRAME_D = 0.07; // frame depth off the wall
const MAT = 0.14; // mat border around the artwork

function PlacardMesh({ piece }: { piece: Piece }) {
  const texRef = useRef<THREE.CanvasTexture>(null);
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 256;
    return c;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const draw = () => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#141209";
      ctx.fillRect(0, 0, 640, 256);
      ctx.strokeStyle = "rgba(201,162,39,0.8)";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 620, 236);
      ctx.fillStyle = "#c9a227";
      ctx.font = "500 30px 'IBM Plex Mono', monospace";
      ctx.fillText(`CAT. ${piece.catalogNo}`, 40, 74);
      ctx.fillStyle = "#ede8de";
      ctx.font = "600 44px Fraunces, Georgia, serif";
      ctx.fillText(piece.title, 40, 140, 560);
      ctx.fillStyle = "rgba(237,232,222,0.6)";
      ctx.font = "400 32px 'IBM Plex Mono', monospace";
      ctx.fillText(`${piece.yearIsPlaceholder ? "c. " : ""}${piece.year}`, 40, 200);
      if (texRef.current) texRef.current.needsUpdate = true;
    };
    document.fonts.ready.then(draw);
    draw();
    return () => {
      cancelled = true;
    };
  }, [canvas, piece]);

  return (
    <mesh position={[0, 0, 0.012]}>
      <planeGeometry args={[0.5, 0.2]} />
      <meshStandardMaterial roughness={0.5} metalness={0.35}>
        <canvasTexture
          ref={texRef}
          attach="map"
          image={canvas}
          colorSpace={THREE.SRGBColorSpace}
        />
      </meshStandardMaterial>
    </mesh>
  );
}

export default function Artwork({
  hang,
  onInspect,
}: {
  hang: Hang;
  onInspect: (piece: Piece) => void;
}) {
  const { piece, position, rotationY } = hang;
  const texture = useTexture(piece.image);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }, [texture]);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  // Size the piece from its true aspect ratio
  const [w, h] = useMemo(() => {
    const img = texture.image as { width: number; height: number };
    const aspect = img.width / img.height;
    let hh = 1.5;
    let ww = hh * aspect;
    if (ww > 2.7) {
      ww = 2.7;
      hh = ww / aspect;
    }
    if (ww < 1.05) {
      ww = 1.05;
      hh = ww / aspect;
    }
    return [ww, hh];
  }, [texture]);

  const matW = w + MAT * 2;
  const matH = h + MAT * 2;

  // Spotlight hangs from the rail, pulled 1.9m into the room. In the group's
  // local frame, +z points off the wall into the room regardless of side.
  const localLight: [number, number, number] = [
    0,
    ROOM_H - 0.18 - position[1],
    1.9,
  ];

  return (
    <group position={position} rotation-y={rotationY}>
      {/* Frame bars (brass) */}
      {[
        { p: [0, matH / 2 + FRAME_T / 2, 0] as const, s: [matW + FRAME_T * 2, FRAME_T, FRAME_D] as const },
        { p: [0, -matH / 2 - FRAME_T / 2, 0] as const, s: [matW + FRAME_T * 2, FRAME_T, FRAME_D] as const },
        { p: [-matW / 2 - FRAME_T / 2, 0, 0] as const, s: [FRAME_T, matH, FRAME_D] as const },
        { p: [matW / 2 + FRAME_T / 2, 0, 0] as const, s: [FRAME_T, matH, FRAME_D] as const },
      ].map((bar, i) => (
        <mesh key={i} position={[...bar.p]} castShadow>
          <boxGeometry args={[...bar.s]} />
          <meshStandardMaterial
            color="#8a6f1e"
            roughness={0.32}
            metalness={0.92}
            envMapIntensity={1.2}
          />
        </mesh>
      ))}

      {/* Mat board */}
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[matW, matH, 0.045]} />
        <meshStandardMaterial color="#191a1e" roughness={0.85} />
      </mesh>

      {/* The work itself, under a subtle clearcoat "glass" */}
      <mesh
        position={[0, 0, 0.028]}
        userData={{ piece }}
        onClick={(e) => {
          e.stopPropagation();
          if (!document.pointerLockElement) onInspect(piece);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial
          map={texture}
          roughness={0.82}
          metalness={0}
          clearcoat={0.55}
          clearcoatRoughness={0.3}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Brass placard beside the work */}
      <group position={[matW / 2 + 0.42, -0.25, 0]}>
        <mesh>
          <boxGeometry args={[0.52, 0.22, 0.02]} />
          <meshStandardMaterial color="#332b12" roughness={0.4} metalness={0.8} />
        </mesh>
        <PlacardMesh piece={piece} />
      </group>

      {/* Spot housing on the rail */}
      <group position={localLight}>
        <mesh position={[0, 0.02, 0]} rotation-x={0.5}>
          <cylinderGeometry args={[0.055, 0.075, 0.22, 16]} />
          <meshStandardMaterial color="#131418" roughness={0.35} metalness={0.75} />
        </mesh>
      </group>
      <AimedSpot
        position={localLight}
        aim={[0, 0, 0.03]}
        intensity={42}
        angle={0.5}
        penumbra={0.65}
        distance={15}
        castShadow
      />
    </group>
  );
}
