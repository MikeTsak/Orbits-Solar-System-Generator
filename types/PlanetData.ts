//PlanetData.ts

export interface MoonData {
    size: number;
    orbitRadius: number;
    orbitSpeed: number;
    spinSpeed: number;
    texture: string;
  }
  
  export interface PlanetData {
    size: number;
    orbitRadius: number;
    orbitSpeed: number;
    spinSpeed: number;
    texture: string;
    moons: MoonData[];
  }
  