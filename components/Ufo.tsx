import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three'; // Import THREE

interface UfoProps {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number;
  parentPosition?: [number, number, number];
}

/**
 * A "UFO" is a purple cube that orbits & spins
 */
export default function Ufo({
  size,
  orbitRadius,
  orbitSpeed,
  spinSpeed,
  parentPosition = [0, 0, 0],
}: UfoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ufoRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * orbitSpeed;
      const x = parentPosition[0] + Math.cos(t) * orbitRadius;
      const z = parentPosition[2] + Math.sin(t) * orbitRadius;
      groupRef.current.position.set(x, parentPosition[1], z);
    }

    if (ufoRef.current) {
      ufoRef.current.rotation.y += spinSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={ufoRef} castShadow receiveShadow>
        {/** BoxGeometry: [width, height, depth] */}
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="purple" />
      </mesh>
    </group>
  );
}
