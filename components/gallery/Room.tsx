"use client";

import { useEffect, useMemo, useRef } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { ROOM_H, ROOM_W } from "@/lib/gallery";

const WALL = "#e2dfd7"; // warm gallery white
const CEILING = "#8d8069"; // warm taupe band around the skylight

/** Large wall lettering drawn to a canvas so no external font files are fetched. */
function WallTitle({
  title,
  position,
  rotationY,
}: {
  title: string;
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
      ctx.fillStyle = "#4f7fff";
      ctx.font = "500 46px 'IBM Plex Mono', monospace";
      ctx.fillText("A M I N   K A D A W A L A", 1024, 170);
      ctx.fillStyle = "#1c1c20";
      ctx.font = "600 150px 'Space Grotesk', sans-serif";
      ctx.fillText(title, 1024, 400);
      ctx.strokeStyle = "rgba(30,30,36,0.5)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(700, 500);
      ctx.lineTo(1348, 500);
      ctx.stroke();
      ctx.fillStyle = "rgba(40,37,30,0.6)";
      ctx.font = "400 40px 'IBM Plex Mono', monospace";
      ctx.fillText("GRAPHIC DESIGN — ONE WING, FIVE SECTIONS", 1024, 600);
      if (texRef.current) texRef.current.needsUpdate = true;
    };
    document.fonts.ready.then(draw);
    draw();
    return () => {
      cancelled = true;
    };
  }, [canvas, title]);

  return (
    <mesh position={position} rotation-y={rotationY}>
      <planeGeometry args={[8, 3]} />
      <meshStandardMaterial transparent roughness={0.9} metalness={0}>
        <canvasTexture ref={texRef} attach="map" image={canvas} colorSpace={THREE.SRGBColorSpace} />
      </meshStandardMaterial>
    </mesh>
  );
}

function Bench({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.07, 0.52]} />
        <meshStandardMaterial color="#2b2419" roughness={0.5} metalness={0.05} />
      </mesh>
      {/* leather pad */}
      <mesh position={[0, 0.47, 0]} castShadow>
        <boxGeometry args={[1.94, 0.07, 0.47]} />
        <meshStandardMaterial color="#3a2e20" roughness={0.75} />
      </mesh>
      {[-0.82, 0.82].map((x) => (
        <mesh key={x} position={[x, 0.19, 0]} castShadow>
          <boxGeometry args={[0.07, 0.38, 0.44]} />
          <meshStandardMaterial color="#1a1611" roughness={0.45} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function Room({
  title,
  roomLength,
}: {
  title: string;
  roomLength: number;
}) {
  const L = roomLength;

  const benches = useMemo(() => {
    const zs: number[] = [];
    for (let z = L / 2 - 9; z > -L / 2 + 5; z -= 11) zs.push(z);
    return zs;
  }, [L]);

  const fills = useMemo(() => {
    const zs: number[] = [];
    for (let z = L / 2 - 4; z > -L / 2 + 2; z -= 11) zs.push(z);
    return zs;
  }, [L]);

  // Architectural rhythm: pilaster + ceiling coffer positions down the hall
  const bays = useMemo(() => {
    const zs: number[] = [];
    for (let z = L / 2 - 7; z > -L / 2 + 4; z -= 4.6) zs.push(z);
    return zs;
  }, [L]);

  return (
    <group>
      {/* Dark reflective floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[ROOM_W, L]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={1024}
          mixBlur={0.85}
          mixStrength={1.4}
          mixContrast={1}
          mirror={0.35}
          depthScale={0.5}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#0d0d10"
          metalness={0.15}
          roughness={0.75}
        />
      </mesh>

      {/* Warm ceiling band with a luminous skylight down the middle */}
      <mesh rotation-x={Math.PI / 2} position={[0, ROOM_H, 0]} userData={{ solid: true }}>
        <planeGeometry args={[ROOM_W, L]} />
        <meshStandardMaterial color={CEILING} roughness={0.95} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, ROOM_H - 0.03, 0]}>
        <planeGeometry args={[2.9, L - 5]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fff3dc"
          emissiveIntensity={1.6}
          roughness={1}
        />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={`trim-${x}`} position={[x, ROOM_H - 0.05, 0]}>
          <boxGeometry args={[0.1, 0.08, L - 5]} />
          <meshStandardMaterial color="#141210" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}

      {/* Soft even fill from the skylight */}
      {fills.map((z) => (
        <pointLight
          key={`fill-${z}`}
          position={[0, ROOM_H - 0.9, z]}
          intensity={5}
          distance={12}
          decay={2}
          color="#fff1d8"
        />
      ))}

      {/* Black track rails near the walls */}
      {[-ROOM_W / 2 + 1.9, ROOM_W / 2 - 1.9].map((x) => (
        <mesh key={x} position={[x, ROOM_H - 0.06, 0]}>
          <boxGeometry args={[0.12, 0.1, L - 2]} />
          <meshStandardMaterial color="#0e0e10" roughness={0.45} metalness={0.6} />
        </mesh>
      ))}

      {/* Gallery-white side walls */}
      <mesh position={[-ROOM_W / 2, ROOM_H / 2, 0]} rotation-y={Math.PI / 2} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[L, ROOM_H]} />
        <meshStandardMaterial color={WALL} roughness={0.96} />
      </mesh>
      <mesh position={[ROOM_W / 2, ROOM_H / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[L, ROOM_H]} />
        <meshStandardMaterial color={WALL} roughness={0.96} />
      </mesh>

      {/* End wall: white, collection name in ink, thin accent band */}
      <mesh position={[0, ROOM_H / 2, -L / 2]} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial color={WALL} roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.85, -L / 2 + 0.015]}>
        <planeGeometry args={[ROOM_W, 0.06]} />
        <meshStandardMaterial color="#4f7fff" roughness={0.85} />
      </mesh>
      <WallTitle
        title={title}
        position={[0, 2.6, -L / 2 + 0.02]}
        rotationY={0}
      />

      {/* Entry wall behind the visitor */}
      <mesh position={[0, ROOM_H / 2, L / 2]} rotation-y={Math.PI} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial color={WALL} roughness={0.96} />
      </mesh>

      {/* Steel baseboards */}
      {[-ROOM_W / 2 + 0.03, ROOM_W / 2 - 0.03].map((x) => (
        <mesh key={`base-${x}`} position={[x, 0.05, 0]}>
          <boxGeometry args={[0.03, 0.1, L]} />
          <meshStandardMaterial color="#232327" roughness={0.38} metalness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, -L / 2 + 0.03]}>
        <boxGeometry args={[ROOM_W, 0.1, 0.03]} />
        <meshStandardMaterial color="#232327" roughness={0.38} metalness={0.95} />
      </mesh>

      {benches.map((z) => (
        <Bench key={z} z={z} />
      ))}

      {/* Carpet runner down the center — breaks the mirror floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0]} receiveShadow>
        <planeGeometry args={[2.3, L - 6]} />
        <meshStandardMaterial color="#16141a" roughness={0.98} />
      </mesh>
      {[-1.18, 1.18].map((x) => (
        <mesh key={`trimline-${x}`} rotation-x={-Math.PI / 2} position={[x, 0.007, 0]}>
          <planeGeometry args={[0.05, L - 6]} />
          <meshStandardMaterial color="#2c2a33" roughness={0.9} />
        </mesh>
      ))}

      {/* Pilasters give the flat walls architectural rhythm; kept shallower
          than the frames (0.07) so overlaps never poke through */}
      {bays.map((z) =>
        [-ROOM_W / 2 + 0.035, ROOM_W / 2 - 0.035].map((x) => (
          <group key={`pilaster-${z}-${x}`} position={[x, 0, z]}>
            <mesh position={[0, 1.7, 0]}>
              <boxGeometry args={[0.05, 3.4, 0.4]} />
              <meshStandardMaterial color="#d8d5cc" roughness={0.95} />
            </mesh>
            <mesh position={[0, 3.44, 0]}>
              <boxGeometry args={[0.07, 0.1, 0.5]} />
              <meshStandardMaterial color="#c9c6bc" roughness={0.92} />
            </mesh>
          </group>
        ))
      )}

      {/* Crown moulding along both walls */}
      {[-ROOM_W / 2 + 0.05, ROOM_W / 2 - 0.05].map((x) => (
        <mesh key={`crown-${x}`} position={[x, ROOM_H - 0.32, 0]}>
          <boxGeometry args={[0.08, 0.14, L]} />
          <meshStandardMaterial color="#cfccc2" roughness={0.92} />
        </mesh>
      ))}

      {/* Coffered ceiling beams between the skylight and the walls */}
      {bays.map((z) =>
        [-1, 1].map((s) => (
          <mesh
            key={`coffer-${z}-${s}`}
            position={[s * (ROOM_W / 4 + 0.78), ROOM_H - 0.09, z]}
          >
            <boxGeometry args={[ROOM_W / 2 - 1.56, 0.16, 0.18]} />
            <meshStandardMaterial color="#6f6353" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Entry doors behind the visitor — you came in through somewhere */}
      <group position={[0, 0, L / 2 - 0.04]}>
        {[-0.58, 0.58].map((x) => (
          <mesh key={`door-${x}`} position={[x, 1.32, 0]}>
            <boxGeometry args={[1.12, 2.64, 0.07]} />
            <meshStandardMaterial color="#17171a" roughness={0.55} metalness={0.35} />
          </mesh>
        ))}
        {[-0.16, 0.16].map((x) => (
          <mesh key={`handle-${x}`} position={[x, 1.25, 0.06]}>
            <cylinderGeometry args={[0.018, 0.018, 0.5, 10]} />
            <meshStandardMaterial color="#43434a" roughness={0.3} metalness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 2.72, 0]}>
          <boxGeometry args={[2.4, 0.12, 0.1]} />
          <meshStandardMaterial color="#121215" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
