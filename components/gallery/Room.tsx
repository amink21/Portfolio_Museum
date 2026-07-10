"use client";

import { useEffect, useMemo, useRef } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { Category } from "@/lib/types";
import { ROOM_H, ROOM_W } from "@/lib/gallery";
import AimedSpot from "./AimedSpot";

/** Large wall lettering drawn to a canvas so no external font files are fetched. */
function WallTitle({
  category,
  position,
  rotationY,
}: {
  category: Category;
  position: [number, number, number];
  rotationY: number;
}) {
  const texRef = useRef<THREE.CanvasTexture>(null);
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 768;
    return c;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const draw = () => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.fillStyle = "#c9a227";
      ctx.font = "500 44px 'IBM Plex Mono', monospace";
      ctx.fillText(category.wing.toUpperCase().split("").join(" "), 1024, 170);
      ctx.fillStyle = "#ede8de";
      ctx.font = "600 170px Fraunces, Georgia, serif";
      ctx.fillText(category.name, 1024, 400);
      ctx.strokeStyle = "rgba(201,162,39,0.65)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(700, 500);
      ctx.lineTo(1348, 500);
      ctx.stroke();
      ctx.fillStyle = "rgba(237,232,222,0.55)";
      ctx.font = "400 40px 'IBM Plex Mono', monospace";
      ctx.fillText("THE KADAWALA COLLECTION", 1024, 600);
      if (texRef.current) texRef.current.needsUpdate = true;
    };
    document.fonts.ready.then(draw);
    draw();
    return () => {
      cancelled = true;
    };
  }, [canvas, category]);

  return (
    <mesh position={position} rotation-y={rotationY}>
      <planeGeometry args={[8, 3]} />
      <meshStandardMaterial transparent roughness={0.85} metalness={0.1}>
        <canvasTexture ref={texRef} attach="map" image={canvas} colorSpace={THREE.SRGBColorSpace} />
      </meshStandardMaterial>
    </mesh>
  );
}

function Bench({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.09, 0.52]} />
        <meshStandardMaterial color="#241d16" roughness={0.55} metalness={0.05} />
      </mesh>
      {[-0.82, 0.82].map((x) => (
        <mesh key={x} position={[x, 0.19, 0]} castShadow>
          <boxGeometry args={[0.07, 0.38, 0.44]} />
          <meshStandardMaterial color="#8a7120" roughness={0.35} metalness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export default function Room({
  category,
  roomLength,
}: {
  category: Category;
  roomLength: number;
}) {
  const endWallColor = useMemo(
    () => new THREE.Color(category.color).multiplyScalar(0.32),
    [category]
  );
  const L = roomLength;

  const benches = useMemo(() => {
    const zs: number[] = [];
    for (let z = L / 2 - 9; z > -L / 2 + 5; z -= 11) zs.push(z);
    return zs;
  }, [L]);

  return (
    <group>
      {/* Reflective stone floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[ROOM_W, L]} />
        <MeshReflectorMaterial
          blur={[320, 90]}
          resolution={1024}
          mixBlur={0.9}
          mixStrength={2.2}
          mixContrast={1}
          mirror={0.55}
          depthScale={0.5}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#101115"
          metalness={0.22}
          roughness={0.78}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation-x={Math.PI / 2} position={[0, ROOM_H, 0]} userData={{ solid: true }}>
        <planeGeometry args={[ROOM_W, L]} />
        <meshStandardMaterial color="#0a0b0d" roughness={0.95} />
      </mesh>

      {/* Light rails on the ceiling */}
      {[-ROOM_W / 2 + 1.9, ROOM_W / 2 - 1.9].map((x) => (
        <mesh key={x} position={[x, ROOM_H - 0.06, 0]}>
          <boxGeometry args={[0.12, 0.1, L - 2]} />
          <meshStandardMaterial color="#131418" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}

      {/* Side walls */}
      <mesh position={[-ROOM_W / 2, ROOM_H / 2, 0]} rotation-y={Math.PI / 2} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[L, ROOM_H]} />
        <meshStandardMaterial color="#16171b" roughness={0.94} />
      </mesh>
      <mesh position={[ROOM_W / 2, ROOM_H / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[L, ROOM_H]} />
        <meshStandardMaterial color="#16171b" roughness={0.94} />
      </mesh>

      {/* End wall in the wing colour, with the wing title */}
      <mesh position={[0, ROOM_H / 2, -L / 2]} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial color={endWallColor} roughness={0.92} />
      </mesh>
      <WallTitle
        category={category}
        position={[0, 2.55, -L / 2 + 0.02]}
        rotationY={0}
      />
      {/* A soft wash on the end wall */}
      <AimedSpot
        position={[0, ROOM_H - 0.3, -L / 2 + 5.5]}
        aim={[0, 1.6, -L / 2]}
        angle={1.15}
        penumbra={1}
        intensity={13}
        distance={16}
        color="#ffedd0"
      />

      {/* Entry wall behind the visitor */}
      <mesh position={[0, ROOM_H / 2, L / 2]} rotation-y={Math.PI} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial color="#131417" roughness={0.94} />
      </mesh>

      {/* Brass baseboards */}
      {[-ROOM_W / 2 + 0.03, ROOM_W / 2 - 0.03].map((x) => (
        <mesh key={`base-${x}`} position={[x, 0.05, 0]}>
          <boxGeometry args={[0.03, 0.1, L]} />
          <meshStandardMaterial color="#c9a227" roughness={0.38} metalness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, -L / 2 + 0.03]}>
        <boxGeometry args={[ROOM_W, 0.1, 0.03]} />
        <meshStandardMaterial color="#c9a227" roughness={0.38} metalness={0.95} />
      </mesh>

      {benches.map((z) => (
        <Bench key={z} z={z} />
      ))}
    </group>
  );
}
