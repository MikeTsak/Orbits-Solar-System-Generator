// components/Moon.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface MoonProps {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
}

export default function Moon({ size, orbitRadius, orbitSpeed }: MoonProps) {
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (moonRef.current) {
      const t = clock.getElapsedTime() * orbitSpeed;
      const x = Math.cos(t) * orbitRadius;
      const z = Math.sin(t) * orbitRadius;
      moonRef.current.position.set(x, 0, z);
      moonRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={moonRef} castShadow receiveShadow>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color="#aaaaaa" />
    </mesh>
  );
}
