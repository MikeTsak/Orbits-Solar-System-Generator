// components/Moon.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface MoonProps {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number;
  texturePath: string;
}

export default function Moon({
  size,
  orbitRadius,
  orbitSpeed,
  spinSpeed,
  texturePath,
}: MoonProps) {
  const moonRef = useRef<THREE.Mesh>(null); // Reference to the moon's mesh
  const moonTexture = useTexture(texturePath); // Load the texture

  useFrame(({ clock }) => {
    if (moonRef.current) {
      // Calculate the moon's orbit position
      const elapsedTime = clock.getElapsedTime();
      const angle = elapsedTime * orbitSpeed;

      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;

      moonRef.current.position.set(x, 0, z);

      // Rotate the moon around its own axis
      moonRef.current.rotation.y += spinSpeed;
    }
  });

  return (
    <mesh ref={moonRef} castShadow receiveShadow>
      {/* Geometry */}
      <sphereGeometry args={[size, 32, 32]} />
      {/* Material */}
      <meshStandardMaterial
        map={moonTexture}
        metalness={0.2}
        roughness={0.8}
      />
    </mesh>
  );
}
