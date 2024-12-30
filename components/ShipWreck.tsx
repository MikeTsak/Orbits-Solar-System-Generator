// components/ShipWreck.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface ShipWreckProps {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number;
  parentPosition?: [number, number, number];
}

/**
 * A "Ship Wreck" is a cylinder geometry, light gray
 */
export default function ShipWreck({
  size,
  orbitRadius,
  orbitSpeed,
  spinSpeed,
  parentPosition = [0, 0, 0]
}: ShipWreckProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wreckRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * orbitSpeed;
      const x = parentPosition[0] + Math.cos(t) * orbitRadius;
      const z = parentPosition[2] + Math.sin(t) * orbitRadius;
      groupRef.current.position.set(x, parentPosition[1], z);
    }

    if (wreckRef.current) {
      wreckRef.current.rotation.y += spinSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={wreckRef} castShadow receiveShadow>
        {/**
         * CylinderGeometry: [ radiusTop, radiusBottom, height, radialSegments ]
         * We'll treat "size" as the radius. Then height ~ size*2
         */}
        <cylinderGeometry args={[size, size, size * 2, 16]} />
        <meshStandardMaterial color="#d3d3d3" />
      </mesh>
    </group>
  );
}
