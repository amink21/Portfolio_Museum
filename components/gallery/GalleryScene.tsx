"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { Piece } from "@/lib/types";
import type { MuseumLayout } from "@/lib/gallery";
import type { MutableRefObject } from "react";
import Room from "./Room";
import Artwork from "./Artwork";
import Player from "./Player";
import SectionPortal from "./SectionPortal";
import { crowdFor, DustMotes, Plant, Stanchions, Visitor } from "./Decor";

interface Props {
  layout: MuseumLayout;
  onInspect: (piece: Piece) => void;
  onLockChange: (locked: boolean) => void;
  onReady: () => void;
  frozen: boolean;
  jumpRef: MutableRefObject<{ x: number; z: number } | null>;
}

/** Fires once the scene has survived its first real frames (post shader compile). */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    frames.current += 1;
    if (frames.current >= 8) {
      fired.current = true;
      onReady();
    }
  });
  return null;
}

/** Raycast from screen center when clicking in pointer-lock (mouse coords are frozen there). */
function CenterRaycast({ onInspect }: { onInspect: (piece: Piece) => void }) {
  const { camera, scene } = useThree();
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const onClick = () => {
      if (!document.pointerLockElement) return;
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      for (const hit of hits) {
        const piece = hit.object.userData.piece as Piece | undefined;
        if (piece && hit.distance < 9) {
          onInspect(piece);
          return;
        }
        if (hit.object.userData.solid) return; // wall blocks the ray
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [camera, scene, onInspect]);
  return null;
}

export default function GalleryScene({
  layout,
  onInspect,
  onLockChange,
  onReady,
  frozen,
  jumpRef,
}: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
      camera={{ fov: 62, position: layout.start, near: 0.1, far: 200 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <color attach="background" args={["#0a0a0b"]} />

      <ambientLight intensity={0.3} color="#fff4e2" />
      <hemisphereLight intensity={0.55} color="#fff3dd" groundColor="#3d382f" />

      <Suspense fallback={null}>
        <ReadySignal onReady={onReady} />
        <Room title="The Collection" roomLength={layout.roomLength} />
        {layout.hangs.map((hang, i) => (
          <Artwork key={hang.piece.slug} hang={hang} castShadow={i % 3 === 0} />
        ))}
        {layout.sections.map((s) => (
          <SectionPortal key={s.category.slug} section={s} />
        ))}

        {/* Life in the hall: rope lines on featured works, visitors, plants, dust */}
        {layout.hangs.map((hang, i) =>
          i % 3 === 0 ? (
            <Stanchions
              key={`rope-${hang.piece.slug}`}
              position={hang.position}
              rotationY={hang.rotationY}
            />
          ) : null
        )}
        {crowdFor(layout.hangs, layout.roomLength).map((v, i) => (
          <Visitor key={`visitor-${i}`} {...v} />
        ))}
        {layout.sections.map((s, i) => (
          <Plant
            key={`plant-${s.category.slug}`}
            position={[i % 2 === 0 ? 3.9 : -3.9, 0, s.portalZ + 0.6]}
            scale={0.95 + (i % 3) * 0.12}
          />
        ))}
        <DustMotes roomLength={layout.roomLength} />
        <Environment resolution={64} frames={1}>
          <Lightformer
            intensity={0.9}
            rotation-x={Math.PI / 2}
            position={[0, 4.4, 0]}
            scale={[3.4, layout.roomLength * 0.7, 1]}
            color="#fff1d6"
          />
          <Lightformer
            intensity={0.28}
            rotation-y={Math.PI / 2}
            position={[-6, 2.2, 0]}
            scale={[layout.roomLength * 0.5, 1.6, 1]}
            color="#e8dcc2"
          />
          <Lightformer
            intensity={0.28}
            rotation-y={-Math.PI / 2}
            position={[6, 2.2, 0]}
            scale={[layout.roomLength * 0.5, 1.6, 1]}
            color="#e8dcc2"
          />
        </Environment>
      </Suspense>

      <Player
        roomLength={layout.roomLength}
        start={layout.start}
        onLockChange={onLockChange}
        onInspect={onInspect}
        frozen={frozen}
        jumpRef={jumpRef}
      />
      <CenterRaycast onInspect={onInspect} />
    </Canvas>
  );
}
