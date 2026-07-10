"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { Category, Piece } from "@/lib/types";
import { computeGallery } from "@/lib/gallery";
import Room from "./Room";
import Artwork from "./Artwork";
import Player from "./Player";

interface Props {
  category: Category;
  pieces: Piece[];
  onInspect: (piece: Piece) => void;
  onLockChange: (locked: boolean) => void;
  frozen: boolean;
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
  category,
  pieces,
  onInspect,
  onLockChange,
  frozen,
}: Props) {
  const layout = useMemo(() => computeGallery(pieces), [pieces]);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
      camera={{ fov: 62, position: layout.start, near: 0.1, far: 140 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <color attach="background" args={["#0b0c0e"]} />

      <ambientLight intensity={0.3} color="#fff4e2" />
      <hemisphereLight intensity={0.55} color="#fff3dd" groundColor="#3d382f" />

      <Suspense fallback={null}>
        <Room category={category} roomLength={layout.roomLength} />
        {layout.hangs.map((hang) => (
          <Artwork key={hang.piece.slug} hang={hang} />
        ))}
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
      />
      <CenterRaycast onInspect={onInspect} />
    </Canvas>
  );
}
