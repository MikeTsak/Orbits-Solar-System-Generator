// components/Planet.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import Moon from './Moon';

interface MoonData {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
}

interface PlanetProps {
  size: number;
  texturePath: string;   // e.g. '/textures/earth.jpg'
  orbitRadius: number;
  orbitSpeed: number;
  moons: MoonData[];
  onClick?: () => void;
}

export default function Planet({
  size,
  texturePath,
  orbitRadius,
  orbitSpeed,
  moons,
  onClick
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);

  // load planet texture
  const texture = useTexture(texturePath);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * orbitSpeed;
      const x = Math.cos(t) * orbitRadius;
      const z = Math.sin(t) * orbitRadius;
      groupRef.current.position.set(x, 0, z);
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={planetRef}
        castShadow
        receiveShadow
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {moons.map((moon, index) => (
        <Moon
          key={index}
          size={moon.size}
          orbitRadius={moon.orbitRadius}
          orbitSpeed={moon.orbitSpeed}
        />
      ))}
    </group>
  );
}
