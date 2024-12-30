// components/SolarSystemCanvas.tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

import Star from './Star';
import Planet from './Planet';

interface MoonData {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
}

interface PlanetData {
  size: number;
  texture: string; // matches a key of planetTextures
  orbitRadius: number;
  orbitSpeed: number;
  moons: MoonData[];
}

interface SolarSystemCanvasProps {
  starColor: string;
  starSize: number;
  planetTextures: Record<string, string>; // e.g. { EarthLike: '/textures/earth.jpg', ... }
  planets: PlanetData[];
  onSelectBody: (body: { type: 'star' | 'planet'; size: number }) => void;
}

export default function SolarSystemCanvas({
  starColor,
  starSize,
  planetTextures,
  planets,
  onSelectBody
}: SolarSystemCanvasProps) {
  return (
    <div className="w-full h-[600px] bg-black/50 border border-gray-700 rounded-md shadow-inner">
      <Canvas shadows camera={{ position: [0, 30, 50], fov: 60 }}>
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />
        <OrbitControls enableZoom={true} />

        <ambientLight intensity={0.2} />
        <pointLight
          position={[0, 0, 0]}
          intensity={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Star at origin */}
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
            texturePath={planetTextures[planet.texture]}
            orbitRadius={planet.orbitRadius}
            orbitSpeed={planet.orbitSpeed}
            moons={planet.moons}
            onClick={() => onSelectBody({ type: 'planet', size: planet.size })}
          />
        ))}
      </Canvas>
    </div>
  );
}
