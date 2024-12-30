// components/Star.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface StarProps {
  color: string;
  size: number;
  onClick?: () => void;
}

export default function Star({ color, size, onClick }: StarProps) {
  const starRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (starRef.current) {
      starRef.current.rotation.y += 0.0005;
    }
  });

  // scale star to look bigger
  const starRadius = size * 5;

  return (
    <mesh
      ref={starRef}
      castShadow
      receiveShadow={false}
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <sphereGeometry args={[starRadius, 64, 64]} />
      <meshStandardMaterial emissive={color} emissiveIntensity={1.5} color={color} />
    </mesh>
  );
}
