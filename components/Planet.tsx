import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three'; // Import THREE
import Moon from './Moon';

interface MoonData {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number;
  texture: string;
}

interface PlanetProps {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number; // how fast it spins on axis
  texturePath: string;
  moons: MoonData[];
  moonTextures: Record<string, string>;
  onClick?: () => void;
}

export default function Planet({
  size,
  orbitRadius,
  orbitSpeed,
  spinSpeed,
  texturePath,
  moons,
  moonTextures,
  onClick
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);

  // load planet texture
  const planetTexture = useTexture(texturePath);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // orbit the star
      const t = clock.getElapsedTime() * orbitSpeed;
      const x = Math.cos(t) * orbitRadius;
      const z = Math.sin(t) * orbitRadius;
      groupRef.current.position.set(x, 0, z);
    }
    if (planetRef.current) {
      // spin on axis
      planetRef.current.rotation.y += spinSpeed;
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
        <meshStandardMaterial
          map={planetTexture}
          metalness={0}
          roughness={1}
        />
      </mesh>

      {/* Moons */}
      {moons.map((moon, index) => {
        const moonTexturePath = moonTextures[moon.texture];
        return (
          <Moon
            key={index}
            size={moon.size}
            orbitRadius={moon.orbitRadius}
            orbitSpeed={moon.orbitSpeed}
            spinSpeed={moon.spinSpeed}
            texturePath={moonTexturePath}
          />
        );
      })}
    </group>
  );
}
