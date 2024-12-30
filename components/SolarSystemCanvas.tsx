// components/SolarSystemCanvas.tsx
import React, { RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

import Star from './Star';
import Planet from './Planet';

interface MoonData {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number;
  texture: string;
}

interface PlanetData {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number;
  texture: string;
  moons: MoonData[];
}

interface SolarSystemCanvasProps {
  canvasContainerRef: RefObject<HTMLDivElement>;
  starColor: string;
  starSize: number;
  starLightIntensity: number; // NEW
  planetTextures: Record<string, string>;
  moonTextures: Record<string, string>;
  planets: PlanetData[];
  onSelectBody: (body: { type: 'star' | 'planet'; size: number }) => void;
}

export default function SolarSystemCanvas({
  canvasContainerRef,
  starColor,
  starSize,
  starLightIntensity, // used for pointLight
  planetTextures,
  moonTextures,
  planets,
  onSelectBody
}: SolarSystemCanvasProps) {
  return (
    <div
      ref={canvasContainerRef}
      className="relative flex-1 w-full h-[600px] border border-gray-700 rounded-md shadow-inner bg-black/50"
    >
      <Canvas shadows camera={{ position: [0, 30, 50], fov: 60 }}>
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />

        <OrbitControls enableZoom={true} />

        {/* Slight ambient light so we can see unlit side a bit */}
        <ambientLight intensity={0.4} />

        {/* The star's main light */}
        <pointLight
          position={[0, 0, 0]}
          intensity={starLightIntensity}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* The Star at origin */}
        <Star
          color={starColor}
          size={starSize}
          onClick={() => onSelectBody({ type: 'star', size: starSize })}
        />

        {/* Planets */}
        {planets.map((planet, idx) => (
          <Planet
            key={idx}
            size={planet.size}
            orbitRadius={planet.orbitRadius}
            orbitSpeed={planet.orbitSpeed}
            spinSpeed={planet.spinSpeed}
            texturePath={planetTextures[planet.texture]}
            moons={planet.moons}
            moonTextures={moonTextures}
            onClick={() => onSelectBody({ type: 'planet', size: planet.size })}
          />
        ))}
      </Canvas>
    </div>
  );
}
