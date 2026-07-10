"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { EYE_HEIGHT, ROOM_W } from "@/lib/gallery";

interface Props {
  roomLength: number;
  start: [number, number, number];
  onLockChange: (locked: boolean) => void;
  frozen: boolean;
}

const WALK_SPEED = 3.2;
const WALL_PAD = 0.75;

export default function Player({ roomLength, start, onLockChange, frozen }: Props) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const vel = useRef(new THREE.Vector3());
  const bobT = useRef(0);
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;

  // Entry dolly: drift forward from the doorway while the title card lifts
  useEffect(() => {
    camera.position.set(start[0], start[1], start[2] + 1.1);
    camera.lookAt(0, EYE_HEIGHT, -roomLength / 2);
    const tween = gsap.to(camera.position, {
      z: start[2],
      duration: 2.6,
      ease: "power2.inOut",
      delay: 0.6,
    });
    return () => {
      tween.kill();
    };
  }, [camera, start, roomLength]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_state, dt) => {
    if (frozenRef.current) return;
    const k = keys.current;
    const fwd =
      (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
    const strafe =
      (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const right = new THREE.Vector3().crossVectors(
      dir,
      new THREE.Vector3(0, 1, 0)
    );

    const desired = new THREE.Vector3()
      .addScaledVector(dir, fwd)
      .addScaledVector(right, strafe);
    if (desired.lengthSq() > 0) desired.normalize().multiplyScalar(WALK_SPEED);

    const damp = 1 - Math.exp(-9 * dt);
    vel.current.lerp(desired, damp);
    camera.position.addScaledVector(vel.current, dt);

    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x,
      -ROOM_W / 2 + WALL_PAD,
      ROOM_W / 2 - WALL_PAD
    );
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      -roomLength / 2 + WALL_PAD,
      roomLength / 2 - WALL_PAD
    );

    // Gentle head bob proportional to walking speed
    const speedRatio = Math.min(vel.current.length() / WALK_SPEED, 1);
    bobT.current += dt * (4.4 + speedRatio * 4);
    camera.position.y =
      EYE_HEIGHT + Math.sin(bobT.current) * 0.017 * speedRatio;
  });

  return (
    <PointerLockControls
      onLock={() => onLockChange(true)}
      onUnlock={() => onLockChange(false)}
    />
  );
}
