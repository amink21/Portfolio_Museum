"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Piece } from "@/lib/types";
import { ROOM_H, type Hang } from "@/lib/gallery";
import AimedSpot from "./AimedSpot";
import { useGifTexture } from "./useGifTexture";

const FRAME_T = 0.075; // frame bar thickness
const FRAME_D = 0.07; // frame depth off the wall
const MAT = 0.14; // mat border around the artwork

/** Barely-there volumetric cone between a spotlight and its artwork. */
function LightCone({
  from,
  to,
}: {
  from: [number, number, number];
  to: [number, number, number];
}) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, -1, 0), // cone apex (+y) at the light, base (-y) at the art
      dir.clone().normalize()
    );
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: q,
      length: len,
    };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <coneGeometry args={[0.85, length, 20, 1, true]} />
      <meshBasicMaterial
        color="#fff6df"
        transparent
        opacity={0.05}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

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
      ctx.fillStyle = "#f5f2ea";
      ctx.fillRect(0, 0, 640, 256);
      ctx.strokeStyle = "rgba(120,110,90,0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(8, 8, 624, 240);
      ctx.fillStyle = "#3757b8";
      ctx.font = "500 30px 'IBM Plex Mono', monospace";
      ctx.fillText(`CAT. ${piece.catalogNo}`, 40, 74);
      ctx.fillStyle = "#1a1a1e";
      ctx.font = "600 44px 'Space Grotesk', sans-serif";
      ctx.fillText(piece.title, 40, 140, 560);
      ctx.fillStyle = "rgba(26,26,30,0.65)";
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

interface ArtworkProps {
  hang: Hang;
  /** WebGL allows ~16 texture units per shader; every shadow map costs one,
      so in the long single-wing hall only a subset of spots may cast. */
  castShadow?: boolean;
}

export default function Artwork(props: ArtworkProps) {
  const isGif = props.hang.piece.image.toLowerCase().endsWith(".gif");
  return isGif ? <GifArtwork {...props} /> : <StaticArtwork {...props} />;
}

function StaticArtwork({ hang, castShadow = true }: ArtworkProps) {
  const texture = useTexture(hang.piece.image);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }, [texture]);
  return <ArtworkBody hang={hang} castShadow={castShadow} texture={texture} />;
}

function GifArtwork({ hang, castShadow = true }: ArtworkProps) {
  const texture = useGifTexture(hang.piece.image);
  if (!texture) return null;
  return <ArtworkBody hang={hang} castShadow={castShadow} texture={texture} />;
}

function ArtworkBody({
  hang,
  castShadow,
  texture,
}: {
  hang: Hang;
  castShadow: boolean;
  texture: THREE.Texture;
}) {
  const { piece, position, rotationY } = hang;
  const [hovered, setHovered] = useState(false);

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
      {/* Frame bars (accent) */}
      {[
        { p: [0, matH / 2 + FRAME_T / 2, 0] as const, s: [matW + FRAME_T * 2, FRAME_T, FRAME_D] as const },
        { p: [0, -matH / 2 - FRAME_T / 2, 0] as const, s: [matW + FRAME_T * 2, FRAME_T, FRAME_D] as const },
        { p: [-matW / 2 - FRAME_T / 2, 0, 0] as const, s: [FRAME_T, matH, FRAME_D] as const },
        { p: [matW / 2 + FRAME_T / 2, 0, 0] as const, s: [FRAME_T, matH, FRAME_D] as const },
      ].map((bar, i) => (
        <mesh key={i} position={[...bar.p]} castShadow>
          <boxGeometry args={[...bar.s]} />
          <meshStandardMaterial
            color="#141416"
            roughness={0.42}
            metalness={0.75}
            envMapIntensity={1.1}
          />
        </mesh>
      ))}

      {/* Mat board */}
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[matW, matH, 0.045]} />
        <meshStandardMaterial color="#f0ede4" roughness={0.9} />
      </mesh>

      {/* The work itself, under a subtle clearcoat "glass" */}
      <mesh
        position={[0, 0, 0.028]}
        userData={{ piece }}
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

      {/* Placard beside the work */}
      <group position={[matW / 2 + 0.42, -0.25, 0]}>
        <mesh>
          <boxGeometry args={[0.52, 0.22, 0.02]} />
          <meshStandardMaterial color="#d8d4c9" roughness={0.7} metalness={0.1} />
        </mesh>
        <PlacardMesh piece={piece} />
      </group>

      {/* Hanging wires from the picture rail to the frame */}
      {[-matW / 3, matW / 3].map((x) => {
        const topY = matH / 2 + FRAME_T;
        const railY = ROOM_H - 0.14 - position[1];
        return (
          <mesh key={`wire-${x}`} position={[x, (topY + railY) / 2, -0.01]}>
            <cylinderGeometry args={[0.0045, 0.0045, railY - topY, 6]} />
            <meshStandardMaterial color="#1f1f22" roughness={0.5} metalness={0.6} />
          </mesh>
        );
      })}

      {/* Spot housing on the rail, glowing lens, and a faint dust-lit cone */}
      <group position={localLight}>
        <mesh position={[0, 0.02, 0]} rotation-x={0.5}>
          <cylinderGeometry args={[0.055, 0.075, 0.22, 16]} />
          <meshStandardMaterial color="#131418" roughness={0.35} metalness={0.75} />
        </mesh>
        <mesh position={[0, -0.055, 0.075]} rotation-x={0.5}>
          <sphereGeometry args={[0.032, 10, 10]} />
          <meshBasicMaterial color="#fff3cf" toneMapped={false} />
        </mesh>
      </group>
      <LightCone from={localLight} to={[0, 0, 0.03]} />
      <AimedSpot
        position={localLight}
        aim={[0, 0, 0.03]}
        intensity={30}
        angle={0.52}
        penumbra={0.6}
        distance={15}
        color="#fff8ea"
        castShadow={castShadow}
      />
    </group>
  );
}
