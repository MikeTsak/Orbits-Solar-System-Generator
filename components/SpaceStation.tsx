import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three'; // Import THREE

interface SpaceStationProps {
  size: number;           // scale
  orbitRadius: number;    // orbit distance
  orbitSpeed: number;     // how fast it orbits
  spinSpeed: number;      // how fast it rotates on its axis
  parentPosition?: [number, number, number]; // where does it orbit (star at [0,0,0], or planet pos)
}

/**
 * A pyramid geometry can be approximated by a ConeGeometry 
 */
export default function SpaceStation({
  size,
  orbitRadius,
  orbitSpeed,
  spinSpeed,
  parentPosition = [0, 0, 0]
}: SpaceStationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const stationRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * orbitSpeed;
      const x = parentPosition[0] + Math.cos(t) * orbitRadius;
      const z = parentPosition[2] + Math.sin(t) * orbitRadius;
      groupRef.current.position.set(x, parentPosition[1], z);
    }

    if (stationRef.current) {
      stationRef.current.rotation.y += spinSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={stationRef} castShadow receiveShadow>
        {/**
         * ConeGeometry args: [ radius, height, radialSegments ]
         * we'll treat 'size' as the "radius" here, and height = size * 2
         */}
        <coneGeometry args={[size, size * 2, 4]} />
        <meshStandardMaterial color="#d3d3d3" />
      </mesh>
    </group>
  );
}
