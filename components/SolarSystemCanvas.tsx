// components/SolarSystemCanvas.tsx
import React, { RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

import Star from './Star';
import Planet from './Planet';
import SpaceStation from './SpaceStation';
import ShipWreck from './ShipWreck';
import Ufo from './Ufo';
import { PlanetData } from '../types/PlanetData';


interface OrbitObject {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number;
  parentPlanetIndex: number | null;
}

// Moon/Planet definitions omitted for brevity

interface SolarSystemCanvasProps {
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  starColor: string;
  starSize: number;
  starLightIntensity: number;
  planetTextures: Record<string, string>;
  moonTextures: Record<string, string>;
  planets: PlanetData[];
  spaceStations: OrbitObject[];
  shipWrecks: OrbitObject[];
  ufos: OrbitObject[];
  onSelectBody: (body: { type: 'star' | 'planet'; size: number }) => void;
}


export default function SolarSystemCanvas({
  canvasContainerRef,
  starColor,
  starSize,
  starLightIntensity,
  planetTextures,
  moonTextures,
  planets,
  spaceStations,
  shipWrecks,
  ufos,
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

        <ambientLight intensity={0.4} />
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

        {/* Space Stations */}
        {spaceStations.map((obj, idx) => {
          let parentPos: [number, number, number] = [0, 0, 0]; 
          return (
            <SpaceStation
              key={idx}
              size={obj.size}
              orbitRadius={obj.orbitRadius}
              orbitSpeed={obj.orbitSpeed}
              spinSpeed={obj.spinSpeed}
              parentPosition={parentPos}
            />
          );
        })}

        {/* Ship Wrecks */}
        {shipWrecks.map((obj, idx) => {
          let parentPos: [number, number, number] = [0, 0, 0];
          return (
            <ShipWreck
              key={idx}
              size={obj.size}
              orbitRadius={obj.orbitRadius}
              orbitSpeed={obj.orbitSpeed}
              spinSpeed={obj.spinSpeed}
              parentPosition={parentPos}
            />
          );
        })}

        {/* UFOs */}
        {ufos.map((obj, idx) => {
          let parentPos: [number, number, number] = [0, 0, 0];
          return (
            <Ufo
              key={idx}
              size={obj.size}
              orbitRadius={obj.orbitRadius}
              orbitSpeed={obj.orbitSpeed}
              spinSpeed={obj.spinSpeed}
              parentPosition={parentPos}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
