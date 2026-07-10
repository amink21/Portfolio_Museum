"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface Props {
  position: [number, number, number];
  aim: [number, number, number];
  intensity?: number;
  angle?: number;
  penumbra?: number;
  distance?: number;
  decay?: number;
  color?: string;
  castShadow?: boolean;
}

/** Spotlight with a properly scene-attached target. */
export default function AimedSpot({
  position,
  aim,
  intensity = 30,
  angle = 0.55,
  penumbra = 0.7,
  distance = 16,
  decay = 1.7,
  color = "#fff1d6",
  castShadow = false,
}: Props) {
  const target = useMemo(() => new THREE.Object3D(), []);
  return (
    <>
      <primitive object={target} position={aim} />
      <spotLight
        position={position}
        target={target}
        intensity={intensity}
        angle={angle}
        penumbra={penumbra}
        distance={distance}
        decay={decay}
        color={color}
        castShadow={castShadow}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-radius={5}
      />
    </>
  );
}
