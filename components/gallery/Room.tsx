"use client";

import { useEffect, useMemo, useRef } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { ROOM_H, ROOM_W } from "@/lib/gallery";

const WALL = "#e2dfd7"; // warm gallery white
const CEILING = "#8d8069"; // warm taupe band around the skylight
const BEAM = "#6f6353"; // coffer wood

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

/** Didactic intro panel by the entry, like the wall text opening a real show. */
function IntroPanel({ position, rotationY }: { position: [number, number, number]; rotationY: number }) {
  const texRef = useRef<THREE.CanvasTexture>(null);
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 640;
    return c;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const draw = () => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#eceae2";
      ctx.fillRect(0, 0, 1024, 640);
      ctx.fillStyle = "#4f7fff";
      ctx.font = "500 30px 'IBM Plex Mono', monospace";
      ctx.fillText("THE DESIGN MUSEUM", 70, 100);
      ctx.fillStyle = "#1c1c20";
      ctx.font = "600 78px 'Space Grotesk', sans-serif";
      ctx.fillText("The Collection", 70, 210);
      ctx.fillStyle = "rgba(30,30,36,0.75)";
      ctx.font = "400 34px 'Space Grotesk', sans-serif";
      const lines = [
        "Graphic design by Amin Kadawala —",
        "twenty-four works hung in five sections:",
        "logos, cover art, headers, print, and",
        "concept illustration. Walk. Look. Click.",
      ];
      lines.forEach((l, i) => ctx.fillText(l, 70, 300 + i * 56));
      ctx.fillStyle = "rgba(30,30,36,0.55)";
      ctx.font = "400 26px 'IBM Plex Mono', monospace";
      ctx.fillText("MMXXVI · MONTRÉAL", 70, 570);
      if (texRef.current) texRef.current.needsUpdate = true;
    };
    document.fonts.ready.then(draw);
    draw();
    return () => {
      cancelled = true;
    };
  }, [canvas]);

  return (
    <group position={position} rotation-y={rotationY}>
      <mesh castShadow>
        <boxGeometry args={[1.7, 1.06, 0.03]} />
        <meshStandardMaterial color="#dedbd2" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.017]}>
        <planeGeometry args={[1.64, 1.0]} />
        <meshStandardMaterial roughness={0.9}>
          <canvasTexture ref={texRef} attach="map" image={canvas} colorSpace={THREE.SRGBColorSpace} />
        </meshStandardMaterial>
      </mesh>
    </group>
  );
}

function Bench({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.07, 0.52]} />
        <meshStandardMaterial color="#2b2419" roughness={0.5} metalness={0.05} />
      </mesh>
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

/** Wall grille vent — the kind of mundane detail real buildings can't hide. */
function Vent({ position, rotationY }: { position: [number, number, number]; rotationY: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh>
        <boxGeometry args={[0.72, 0.24, 0.03]} />
        <meshStandardMaterial color="#b9b6ad" roughness={0.6} metalness={0.4} />
      </mesh>
      {[-0.07, 0, 0.07].map((y) => (
        <mesh key={y} position={[0, y, 0.017]}>
          <boxGeometry args={[0.62, 0.035, 0.008]} />
          <meshStandardMaterial color="#43413b" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function SecurityCamera({ position, rotationY }: { position: [number, number, number]; rotationY: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.18, 8]} />
        <meshStandardMaterial color="#1b1b1e" roughness={0.5} metalness={0.6} />
      </mesh>
      <group rotation-x={0.42}>
        <mesh castShadow>
          <boxGeometry args={[0.09, 0.09, 0.24]} />
          <meshStandardMaterial color="#222226" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.13]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.032, 0.038, 0.03, 12]} />
          <meshStandardMaterial color="#0a0a0c" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function FireExtinguisher({ position, rotationY }: { position: [number, number, number]; rotationY: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0, -0.035]}>
        <boxGeometry args={[0.16, 0.5, 0.02]} />
        <meshStandardMaterial color="#5a5750" roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.4, 14]} />
        <meshStandardMaterial color="#a3211f" roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.02, 0.028, 0.08, 8]} />
        <meshStandardMaterial color="#141416" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0.045, 0.27, 0]} rotation-z={-0.5}>
        <boxGeometry args={[0.1, 0.02, 0.02]} />
        <meshStandardMaterial color="#141416" roughness={0.5} metalness={0.7} />
      </mesh>
    </group>
  );
}

/** Green SORTIE sign glowing above the entry doors. */
function ExitSign({ position }: { position: [number, number, number] }) {
  const texRef = useRef<THREE.CanvasTexture>(null);
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 96;
    return c;
  }, []);
  useEffect(() => {
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0f3d24";
    ctx.fillRect(0, 0, 256, 96);
    ctx.fillStyle = "#5df29b";
    ctx.font = "600 52px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SORTIE", 128, 52);
    if (texRef.current) texRef.current.needsUpdate = true;
  }, [canvas]);
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.56, 0.22, 0.07]} />
        <meshStandardMaterial color="#101211" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.037]}>
        <planeGeometry args={[0.52, 0.18]} />
        <meshBasicMaterial toneMapped={false}>
          <canvasTexture ref={texRef} attach="map" image={canvas} colorSpace={THREE.SRGBColorSpace} />
        </meshBasicMaterial>
      </mesh>
      <pointLight position={[0, -0.1, 0.2]} intensity={0.5} distance={2.2} decay={2} color="#4fe08a" />
    </group>
  );
}

export default function Room({
  title,
  roomLength,
  pilasters,
}: {
  title: string;
  roomLength: number;
  pilasters: Array<{ side: number; z: number }>;
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

  // ceiling rhythm for coffers + skylight mullions
  const bays = useMemo(() => {
    const zs: number[] = [];
    for (let z = L / 2 - 7; z > -L / 2 + 4; z -= 4.6) zs.push(z);
    return zs;
  }, [L]);

  const ventZs = useMemo(() => {
    const zs: number[] = [];
    for (let z = L / 2 - 11; z > -L / 2 + 6; z -= 17) zs.push(z);
    return zs;
  }, [L]);

  // Soft contact-shadow gradient reused for every wall junction
  const aoTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 64);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    return t;
  }, []);

  // Fine plaster/fiber noise shared by walls (bump) and the runner (weave)
  const noiseTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 118 + Math.random() * 20;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);

  const wallBump = useMemo(() => {
    const t = noiseTex.clone();
    t.repeat.set(L / 2.5, 2.4);
    t.needsUpdate = true;
    return t;
  }, [noiseTex, L]);

  const runnerBump = useMemo(() => {
    const t = noiseTex.clone();
    t.repeat.set(3, L / 2.4);
    t.needsUpdate = true;
    return t;
  }, [noiseTex, L]);

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
        <meshStandardMaterial color="#ffffff" emissive="#fff3dc" emissiveIntensity={1.6} roughness={1} />
      </mesh>
      {[-1.5, 1.5].map((x) => (
        <mesh key={`trim-${x}`} position={[x, ROOM_H - 0.05, 0]}>
          <boxGeometry args={[0.1, 0.08, L - 5]} />
          <meshStandardMaterial color="#141210" roughness={0.6} metalness={0.4} />
        </mesh>
      ))}
      {/* Skylight mullions */}
      {bays.map((z) => (
        <mesh key={`mullion-${z}`} position={[0, ROOM_H - 0.045, z]}>
          <boxGeometry args={[3.0, 0.06, 0.09]} />
          <meshStandardMaterial color="#17150f" roughness={0.55} metalness={0.4} />
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

      {/* Coffer grid: cross beams + two longitudinal rails */}
      {bays.map((z) =>
        [-1, 1].map((s) => (
          <mesh key={`coffer-${z}-${s}`} position={[s * (ROOM_W / 4 + 0.78), ROOM_H - 0.09, z]}>
            <boxGeometry args={[ROOM_W / 2 - 1.56, 0.16, 0.18]} />
            <meshStandardMaterial color={BEAM} roughness={0.9} />
          </mesh>
        ))
      )}
      {[-3.3, 3.3].map((x) => (
        <mesh key={`rail-long-${x}`} position={[x, ROOM_H - 0.09, 0]}>
          <boxGeometry args={[0.16, 0.14, L - 4]} />
          <meshStandardMaterial color={BEAM} roughness={0.9} />
        </mesh>
      ))}

      {/* Gallery-white side walls with fine plaster bump */}
      <mesh position={[-ROOM_W / 2, ROOM_H / 2, 0]} rotation-y={Math.PI / 2} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[L, ROOM_H]} />
        <meshStandardMaterial color={WALL} roughness={0.96} bumpMap={wallBump} bumpScale={0.35} />
      </mesh>
      <mesh position={[ROOM_W / 2, ROOM_H / 2, 0]} rotation-y={-Math.PI / 2} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[L, ROOM_H]} />
        <meshStandardMaterial color={WALL} roughness={0.96} bumpMap={wallBump} bumpScale={0.35} />
      </mesh>

      {/* Contact-shadow gradients where walls meet floor and ceiling */}
      {[-1, 1].map((s) => (
        <group key={`ao-${s}`}>
          <mesh position={[s * (ROOM_W / 2 - 0.012), 0.28, 0]} rotation-y={(-s * Math.PI) / 2}>
            <planeGeometry args={[L, 0.36]} />
            <meshBasicMaterial map={aoTex} transparent opacity={0.32} depthWrite={false} />
          </mesh>
          <mesh
            position={[s * (ROOM_W / 2 - 0.012), ROOM_H - 0.55, 0]}
            rotation-y={(-s * Math.PI) / 2}
            rotation-z={Math.PI}
          >
            <planeGeometry args={[L, 0.5]} />
            <meshBasicMaterial map={aoTex} transparent opacity={0.22} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {/* End wall: white, collection name in ink, thin accent band */}
      <mesh position={[0, ROOM_H / 2, -L / 2]} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial color={WALL} roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.85, -L / 2 + 0.015]}>
        <planeGeometry args={[ROOM_W, 0.06]} />
        <meshStandardMaterial color="#4f7fff" roughness={0.85} />
      </mesh>
      <WallTitle title={title} position={[0, 2.6, -L / 2 + 0.02]} rotationY={0} />

      {/* Entry wall behind the visitor */}
      <mesh position={[0, ROOM_H / 2, L / 2]} rotation-y={Math.PI} receiveShadow userData={{ solid: true }}>
        <planeGeometry args={[ROOM_W, ROOM_H]} />
        <meshStandardMaterial color={WALL} roughness={0.96} />
      </mesh>

      {/* Steel baseboards + shadow gap above them */}
      {[-ROOM_W / 2 + 0.03, ROOM_W / 2 - 0.03].map((x) => (
        <group key={`base-${x}`}>
          <mesh position={[x, 0.05, 0]}>
            <boxGeometry args={[0.03, 0.1, L]} />
            <meshStandardMaterial color="#232327" roughness={0.38} metalness={0.95} />
          </mesh>
          <mesh position={[x, 0.108, 0]}>
            <boxGeometry args={[0.032, 0.012, L]} />
            <meshStandardMaterial color="#0c0c0e" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.05, -L / 2 + 0.03]}>
        <boxGeometry args={[ROOM_W, 0.1, 0.03]} />
        <meshStandardMaterial color="#232327" roughness={0.38} metalness={0.95} />
      </mesh>

      {/* Pilasters — placed by the layout in the gaps between frames */}
      {pilasters.map(({ side, z }) => (
        <group key={`pilaster-${side}-${z}`} position={[side * (ROOM_W / 2 - 0.02), 0, z]}>
          <mesh position={[0, (ROOM_H - 0.4) / 2, 0]}>
            <boxGeometry args={[0.04, ROOM_H - 0.4, 0.34]} />
            <meshStandardMaterial color="#d8d5cc" roughness={0.95} />
          </mesh>
          <mesh position={[0, ROOM_H - 0.36, 0]}>
            <boxGeometry args={[0.06, 0.09, 0.42]} />
            <meshStandardMaterial color="#c9c6bc" roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.13, 0]}>
            <boxGeometry args={[0.06, 0.1, 0.42]} />
            <meshStandardMaterial color="#c9c6bc" roughness={0.92} />
          </mesh>
        </group>
      ))}

      {/* Crown moulding along both walls */}
      {[-ROOM_W / 2 + 0.05, ROOM_W / 2 - 0.05].map((x) => (
        <mesh key={`crown-${x}`} position={[x, ROOM_H - 0.32, 0]}>
          <boxGeometry args={[0.08, 0.14, L]} />
          <meshStandardMaterial color="#cfccc2" roughness={0.92} />
        </mesh>
      ))}

      {/* Carpet runner with woven texture + trim lines */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0]} receiveShadow>
        <planeGeometry args={[2.3, L - 6]} />
        <meshStandardMaterial color="#16141a" roughness={0.98} bumpMap={runnerBump} bumpScale={0.5} />
      </mesh>
      {[-1.18, 1.18].map((x) => (
        <mesh key={`trimline-${x}`} rotation-x={-Math.PI / 2} position={[x, 0.007, 0]}>
          <planeGeometry args={[0.05, L - 6]} />
          <meshStandardMaterial color="#2c2a33" roughness={0.9} />
        </mesh>
      ))}

      {benches.map((z) => (
        <Bench key={z} z={z} />
      ))}

      {/* Entry doors, casing, SORTIE sign */}
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
        {[-1.22, 1.22].map((x) => (
          <mesh key={`jamb-${x}`} position={[x, 1.36, 0]}>
            <boxGeometry args={[0.12, 2.84, 0.09]} />
            <meshStandardMaterial color="#d4d1c8" roughness={0.92} />
          </mesh>
        ))}
      </group>
      <ExitSign position={[0, 3.02, L / 2 - 0.16]} />

      {/* Housekeeping details real buildings can't hide */}
      <IntroPanel
        position={[ROOM_W / 2 - 0.03, 1.72, L / 2 - 3.4]}
        rotationY={-Math.PI / 2}
      />
      <FireExtinguisher
        position={[-ROOM_W / 2 + 0.09, 1.0, L / 2 - 2.2]}
        rotationY={Math.PI / 2}
      />
      <SecurityCamera
        position={[ROOM_W / 2 - 0.38, ROOM_H - 0.42, L / 2 - 0.5]}
        rotationY={-2.5}
      />
      <SecurityCamera
        position={[-ROOM_W / 2 + 0.38, ROOM_H - 0.42, -L / 2 + 0.5]}
        rotationY={0.7}
      />
      {ventZs.map((z, i) => (
        <Vent
          key={`vent-${z}`}
          position={[
            (i % 2 === 0 ? 1 : -1) * (ROOM_W / 2 - 0.03),
            ROOM_H - 0.85,
            z,
          ]}
          rotationY={(i % 2 === 0 ? -1 : 1) * (Math.PI / 2)}
        />
      ))}
    </group>
  );
}
