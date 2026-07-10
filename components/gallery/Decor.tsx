"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROOM_W } from "@/lib/gallery";

/* ---------------------------------------------------------------- visitors */

interface VisitorProps {
  position: [number, number, number];
  height?: number;
  shade?: string;
  phase?: number;
}

/** Stylized archviz silhouette: matte capsule body + head, idling gently. */
export function Visitor({
  position,
  height = 1.72,
  shade = "#26262b",
  phase = 0,
}: VisitorProps) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    if (g.current) {
      g.current.rotation.z = Math.sin(t * 0.6) * 0.012;
      g.current.rotation.y = Math.sin(t * 0.21) * 0.22;
    }
  });
  const bodyH = height - 0.28;
  return (
    <group ref={g} position={position}>
      <mesh position={[0, bodyH / 2 + 0.02, 0]} castShadow>
        <capsuleGeometry args={[0.155, bodyH - 0.31, 6, 12]} />
        <meshStandardMaterial color={shade} roughness={0.92} />
      </mesh>
      <mesh position={[0, height - 0.1, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#3b3b40" roughness={0.85} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------- stanchions */

interface StanchionProps {
  /** artwork wall position (world) */
  position: [number, number, number];
  rotationY: number;
  span?: number;
}

/** Pair of posts with a sagging rope, guarding a featured piece. */
export function Stanchions({ position, rotationY, span = 2.4 }: StanchionProps) {
  const half = span / 2;
  const rope = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-half, 0.88, 0),
      new THREE.Vector3(0, 0.72, 0),
      new THREE.Vector3(half, 0.88, 0)
    );
    return new THREE.TubeGeometry(curve, 24, 0.014, 8);
  }, [half]);

  return (
    // sit on the floor, pulled 1.35m into the room off the wall
    <group
      position={[position[0], 0, position[2]]}
      rotation-y={rotationY}
    >
      <group position={[0, 0, 1.35]}>
        {[-half, half].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.46, 0]} castShadow>
              <cylinderGeometry args={[0.028, 0.028, 0.92, 12]} />
              <meshStandardMaterial color="#1d1d21" roughness={0.35} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.94, 0]} castShadow>
              <sphereGeometry args={[0.048, 14, 14]} />
              <meshStandardMaterial color="#2a2a30" roughness={0.3} metalness={0.85} />
            </mesh>
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[0.1, 0.11, 0.025, 16]} />
              <meshStandardMaterial color="#1d1d21" roughness={0.4} metalness={0.7} />
            </mesh>
          </group>
        ))}
        <mesh geometry={rope}>
          <meshStandardMaterial color="#121214" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ plants */

export function Plant({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.21, 0.16, 0.52, 14]} />
        <meshStandardMaterial color="#1a1a1d" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.5, 8]} />
        <meshStandardMaterial color="#3a2f22" roughness={0.95} />
      </mesh>
      {[
        { p: [0, 1.06, 0] as const, r: 0.34 },
        { p: [0.2, 0.88, 0.08] as const, r: 0.24 },
        { p: [-0.19, 0.92, -0.06] as const, r: 0.26 },
        { p: [0.02, 0.8, -0.18] as const, r: 0.2 },
      ].map((b, i) => (
        <mesh key={i} position={[...b.p]} castShadow>
          <sphereGeometry args={[b.r, 12, 10]} />
          <meshStandardMaterial color={i % 2 ? "#1f3324" : "#254030"} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------- dust motes */

/** Slow-rising dust caught in the skylight shaft. */
export function DustMotes({ roomLength }: { roomLength: number }) {
  const points = useRef<THREE.Points>(null);
  const { geometry, speeds } = useMemo(() => {
    const count = 380;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2.6;
      pos[i * 3 + 1] = 2.1 + Math.random() * 2.7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * (roomLength - 8);
    }
    for (let i = 0; i < count; i++) spd[i] = 0.02 + Math.random() * 0.05;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geometry: geo, speeds: spd };
  }, [roomLength]);

  useFrame((_s, dt) => {
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < speeds.length; i++) {
      arr[i * 3 + 1] += speeds[i] * dt;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 2.1 + i) * dt * 0.01;
      if (arr[i * 3 + 1] > 4.85) arr[i * 3 + 1] = 2.1;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.022}
        color="#fff3d8"
        transparent
        opacity={0.32}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ------------------------------------------------- placement along the hall */

export function crowdFor(
  hangs: Array<{ position: [number, number, number]; side: number }>,
  roomLength: number
): VisitorProps[] {
  const shades = ["#26262b", "#2e2a26", "#232830", "#2b2330", "#33302a"];
  const picks = [2, 5, 9, 13, 17, 21].filter((i) => i < hangs.length);
  const visitors: VisitorProps[] = picks.map((i, k) => {
    const h = hangs[i];
    return {
      position: [
        h.side * (ROOM_W / 2 - 1.8) + (k % 2 ? 0.3 : -0.2),
        0,
        h.position[2] + (k % 2 ? 0.4 : -0.3),
      ],
      height: 1.58 + (k % 4) * 0.07,
      shade: shades[k % shades.length],
      phase: k * 1.7,
    };
  });
  // a pair chatting mid-hall
  visitors.push(
    { position: [0.55, 0, roomLength * 0.06], height: 1.74, shade: "#2a2622", phase: 9.1 },
    { position: [-0.35, 0, roomLength * 0.06 + 0.5], height: 1.62, shade: "#22262e", phase: 4.3 }
  );
  return visitors;
}
