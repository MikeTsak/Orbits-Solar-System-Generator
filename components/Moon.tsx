// components/Moon.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

interface MoonProps {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number; // new
  texturePath: string;
}

export default function Moon({
  size,
  orbitRadius,
  orbitSpeed,
  spinSpeed,
  texturePath
}: MoonProps) {
  const moonRef = useRef<THREE.Mesh>(null);
  const moonTexture = useTexture(texturePath);

  useFrame(({ clock }) => {
    if (moonRef.current) {
      // orbit the planet
      const t = clock.getElapsedTime() * orbitSpeed;
      const x = Math.cos(t) * orbitRadius;
      const z = Math.sin(t) * orbitRadius;
      moonRef.current.position.set(x, 0, z);

      // spin on axis
      moonRef.current.rotation.y += spinSpeed;
    }
  });

  return (
    <mesh ref={moonRef} castShadow receiveShadow>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        map={moonTexture}
        metalness={0}
        roughness={1}
      />
    </mesh>
  );
}
