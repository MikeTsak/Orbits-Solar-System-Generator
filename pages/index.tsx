// pages/index.tsx
import React, { useState, useRef } from 'react';
import Head from 'next/head';
import SolarSystemCanvas from '../components/SolarSystemCanvas';

// Earth & Sun references (for the stats panel)
const EARTH_RADIUS = 6_371_000;  // 6,371,000 m
const EARTH_MASS = 5.972e24;     // 5.972×10^24 kg
const SUN_RADIUS = 6.957e8;      // 695,700,000 m
const SUN_MASS = 1.989e30;       // 1.989×10^30 kg
const G = 6.6743e-11;            // gravitational constant

// Planet texture paths (including your new ones)
const PLANET_TEXTURE_PATHS = {
  EarthLike: '/textures/earth.jpg',
  GasGiant: '/textures/jupiter.jpg',
  Rocky: '/textures/mars.jpg',
  Desert: '/textures/desert.jpg',
  WaterWorld: '/textures/waterworld.jpg',
  LavaPlanet: '/textures/lavaplanet.jpg',
  MagmaPlanet: '/textures/magma.png',
};

// For star color
const STAR_COLORS = {
  Blue: '#84b6f4',
  White: '#ffffff',
  'Yellow-White': '#ffffc2',
  Yellow: '#fff68f',
  'Orangish Red': '#ff9933',
};

// Data types
interface MoonData {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
}

interface PlanetData {
  size: number;
  texture: keyof typeof PLANET_TEXTURE_PATHS;
  orbitRadius: number;
  orbitSpeed: number;
  moons: MoonData[];
}

export default function Home() {
  // Star
  const [starType, setStarType] = useState<keyof typeof STAR_COLORS>('Yellow');
  const [starSize, setStarSize] = useState(1);

  // Planets
  const [planets, setPlanets] = useState<PlanetData[]>([]);

  // Seeds
  const [seed, setSeed] = useState('');
  const [customSeed, setCustomSeed] = useState('');

  // Info sheet (the clicked star/planet)
  const [selectedBody, setSelectedBody] = useState<{
    type: 'star' | 'planet';
    size: number;
  } | null>(null);

  // A ref to the 3D container for the fullscreen feature
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // ---------- SEED HELPERS ----------
  function generateSeed() {
    return Math.random().toString(36).substring(2, 10);
  }

  function seededRandom(seedStr: string) {
    let s = 0;
    for (let i = 0; i < seedStr.length; i++) {
      s = (s << 5) - s + seedStr.charCodeAt(i);
      s |= 0;
    }
    return function () {
      s = (s << 13) ^ s;
      s = (s * 5 + 0x7ffffff) | 0;
      return (s >>> 0) / 4294967295;
    };
  }

  // Generate a system from seed:
  // - star type/size
  // - planets: size, texture, plus random # of moons
  function generateSystemFromSeed(seedValue: string) {
    const rand = seededRandom(seedValue);

    // Star color
    const starKeys = Object.keys(STAR_COLORS) as Array<keyof typeof STAR_COLORS>;
    const starIdx = Math.floor(rand() * starKeys.length);
    const chosenStarType = starKeys[starIdx];
    // star size [0.5..3]
    const sSize = parseFloat((0.5 + rand() * 2.5).toFixed(1));

    // Planets: 2..5
    const planetCount = 2 + Math.floor(rand() * 4);
    const newPlanets: PlanetData[] = [];

    for (let i = 0; i < planetCount; i++) {
      // planet size [0.5..3]
      const pSize = parseFloat((0.5 + rand() * 2.5).toFixed(1));

      // random texture
      const textureKeys = Object.keys(PLANET_TEXTURE_PATHS) as Array<keyof typeof PLANET_TEXTURE_PATHS>;
      const textureIdx = Math.floor(rand() * textureKeys.length);

      // orbit radius & speed => default
      const orbitR = 10 + i * 5;
      const orbitS = 0.1;

      // random moon count: 0..2
      const moonCount = Math.floor(rand() * 3);
      const newMoons: MoonData[] = [];
      for (let m = 0; m < moonCount; m++) {
        // each moon
        const mSize = parseFloat((0.1 + rand() * 0.4).toFixed(2));
        const mOrbR = 2 + Math.floor(rand() * 4);
        const mOrbS = parseFloat((0.2 + rand() * 0.4).toFixed(2));

        newMoons.push({
          size: mSize,
          orbitRadius: mOrbR,
          orbitSpeed: mOrbS,
        });
      }

      newPlanets.push({
        size: pSize,
        texture: textureKeys[textureIdx],
        orbitRadius: orbitR,
        orbitSpeed: orbitS,
        moons: newMoons,
      });
    }

    setStarType(chosenStarType);
    setStarSize(sSize);
    setPlanets(newPlanets);
    setSeed(seedValue);
  }

  // "Load from seed" button
  const handleLoadFromSeed = () => {
    if (!customSeed.trim()) return;
    generateSystemFromSeed(customSeed.trim());
  };

  // ---------- Info Panel Calculations ----------
  const EARTH_RADIUS = 6_371_000;
  const EARTH_MASS = 5.972e24;
  const SUN_RADIUS = 6.957e8;
  const SUN_MASS = 1.989e30;
  const G = 6.6743e-11;

  const numberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 2,
  });
  function formatNumber(n: number) {
    return numberFormatter.format(n);
  }

  function calculateStats(body: { type: 'star' | 'planet'; size: number }) {
    if (body.type === 'star') {
      // star
      const radius = SUN_RADIUS * body.size;
      const mass = SUN_MASS * Math.pow(body.size, 3);
      const gravity = (G * mass) / (radius * radius);
      const circumference = 2 * Math.PI * radius;
      const gravitySun = (G * SUN_MASS) / (SUN_RADIUS * SUN_RADIUS);

      return {
        radius,
        mass,
        gravity,
        circumference,
        massRatio: mass / SUN_MASS,
        gravityRatio: gravity / gravitySun,
      };
    } else {
      // planet
      const radius = EARTH_RADIUS * body.size;
      const mass = EARTH_MASS * Math.pow(body.size, 3);
      const gravity = (G * mass) / (radius * radius);
      const circumference = 2 * Math.PI * radius;

      return {
        radius,
        mass,
        gravity,
        circumference,
        massRatio: mass / EARTH_MASS,
        gravityRatio: gravity / 9.81,
      };
    }
  }

  let statsPanel = null;
  if (selectedBody) {
    const stats = calculateStats(selectedBody);
    const isStar = selectedBody.type === 'star';

    statsPanel = (
      <div className="fixed top-24 right-5 z-50 w-64 rounded-md bg-gray-800/90 p-4 shadow-lg backdrop-blur">
        <h3 className="mb-2 text-lg font-bold tracking-wide">
          {isStar ? 'Star' : 'Planet'} (size={selectedBody.size})
        </h3>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="font-semibold">Radius (m):</span>{' '}
            {formatNumber(stats.radius)}
          </li>
          <li>
            <span className="font-semibold">Circumference (m):</span>{' '}
            {formatNumber(stats.circumference)}
          </li>
          <li>
            <span className="font-semibold">Mass (kg):</span>{' '}
            {formatNumber(stats.mass)}
          </li>
          <li>
            <span className="font-semibold">Surface Gravity (m/s²):</span>{' '}
            {stats.gravity.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </li>
          {isStar ? (
            <>
              <li>
                <span className="font-semibold">Mass vs Sun:</span>{' '}
                {stats.massRatio.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })}
                ×
              </li>
              <li>
                <span className="font-semibold">Gravity vs Sun:</span>{' '}
                {stats.gravityRatio.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })}
                ×
              </li>
            </>
          ) : (
            <>
              <li>
                <span className="font-semibold">Mass vs Earth:</span>{' '}
                {stats.massRatio.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })}
                ×
              </li>
              <li>
                <span className="font-semibold">Gravity vs Earth:</span>{' '}
                {stats.gravityRatio.toLocaleString('en-US', {
                  maximumFractionDigits: 2,
                })}
                ×
              </li>
            </>
          )}
        </ul>
        <button
          onClick={() => setSelectedBody(null)}
          className="mt-4 rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-500"
        >
          Close
        </button>
      </div>
    );
  }

  // ---------- Planet + Moon CRUD ----------
  const handleAddPlanet = () => {
    setPlanets((prev) => [
      ...prev,
      {
        size: 1,
        texture: 'EarthLike',
        orbitRadius: 10 + prev.length * 5,
        orbitSpeed: 0.1,
        moons: [],
      },
    ]);
  };
  const handleRemovePlanet = (idx: number) => {
    setPlanets((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleAddMoon = (planetIndex: number) => {
    setPlanets((prev) =>
      prev.map((planet, i) => {
        if (i === planetIndex) {
          return {
            ...planet,
            moons: [
              ...planet.moons,
              {
                size: 0.3,
                orbitRadius: 3,
                orbitSpeed: 0.3,
              },
            ],
          };
        }
        return planet;
      })
    );
  };
  const handleRemoveMoon = (planetIndex: number, moonIndex: number) => {
    setPlanets((prev) =>
      prev.map((planet, i) => {
        if (i === planetIndex) {
          return {
            ...planet,
            moons: planet.moons.filter((_, m) => m !== moonIndex),
          };
        }
        return planet;
      })
    );
  };

  // ---------- Fullscreen Handler ----------
  const handleFullscreen = () => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.requestFullscreen?.();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-black to-gray-900 text-gray-200">
      <Head>
        <title>Solar System (More Planets + Fullscreen)</title>
        <meta
          name="description"
          content="Custom solar system with orbit radius & speed for planets and moons, plus fullscreen mode."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          html, body {
            font-family: 'Product Sans', sans-serif;
          }
        `}</style>
      </Head>

      <header className="py-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-wide">
          Solar System Generator
        </h1>
        <p className="text-sm text-gray-300">
          Enter a seed to auto-generate star/planet sizes & textures.  
          You can still manually set orbit radius & speed (and click Fullscreen).
        </p>
      </header>

      <main className="relative mx-auto mb-8 flex-1 flex flex-col items-center justify-center max-w-7xl px-4">
        {statsPanel /* Info panel if something is clicked */}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: seed, star config, planets config */}
          <section className="space-y-6">
            {/* Seed Loading */}
            <div className="rounded-md bg-white/5 p-4 shadow-md backdrop-blur-sm">
              <h2 className="mb-3 text-lg font-semibold">Load from Seed</h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter seed"
                  value={customSeed}
                  onChange={(e) => setCustomSeed(e.target.value)}
                  className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-1 focus:outline-none"
                />
                <button
                  onClick={handleLoadFromSeed}
                  className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500"
                >
                  Load
                </button>
              </div>
              {seed && (
                <p className="mt-2 text-sm text-gray-400">
                  Current System Seed: <strong>{seed}</strong>
                </p>
              )}
            </div>

            {/* Star config */}
            <div className="rounded-md bg-white/5 p-4 shadow-md backdrop-blur-sm">
              <h2 className="mb-3 text-lg font-semibold">Star Configuration</h2>
              <label className="mb-1 block">Star Type (Color):</label>
              <select
                value={starType}
                onChange={(e) =>
                  setStarType(e.target.value as keyof typeof STAR_COLORS)
                }
                className="mb-3 w-full rounded border border-gray-700 bg-gray-800 px-3 py-1 focus:outline-none"
              >
                {Object.keys(STAR_COLORS).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <label className="mb-1 block">Star Size (Sun=1):</label>
              <input
                type="number"
                step="0.1"
                value={starSize}
                onChange={(e) => setStarSize(parseFloat(e.target.value))}
                className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-1 focus:outline-none"
              />
            </div>

            {/* Planets */}
            <div className="rounded-md bg-white/5 p-4 shadow-md backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Planets Configuration</h2>
                <button
                  onClick={handleAddPlanet}
                  className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-500"
                >
                  + Planet
                </button>
              </div>

              {planets.map((planet, i) => (
                <div
                  key={i}
                  className="mb-4 space-y-3 rounded bg-gray-800/50 p-3"
                >
                  {/* Planet row */}
                  <div className="flex flex-wrap gap-3">
                    {/* Size */}
                    <div>
                      <label className="mb-1 block text-sm">Size:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={planet.size}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setPlanets((prev) =>
                            prev.map((p, idx) =>
                              idx === i ? { ...p, size: val } : p
                            )
                          );
                        }}
                        className="w-16 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
                      />
                    </div>
                    {/* Texture */}
                    <div>
                      <label className="mb-1 block text-sm">Texture:</label>
                      <select
                        value={planet.texture}
                        onChange={(e) => {
                          const tex =
                            e.target.value as keyof typeof PLANET_TEXTURE_PATHS;
                          setPlanets((prev) =>
                            prev.map((p, idx) =>
                              idx === i ? { ...p, texture: tex } : p
                            )
                          );
                        }}
                        className="w-28 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
                      >
                        {Object.keys(PLANET_TEXTURE_PATHS).map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Orbit Radius */}
                    <div>
                      <label className="mb-1 block text-sm">Orbit Radius:</label>
                      <input
                        type="number"
                        step="1"
                        value={planet.orbitRadius}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setPlanets((prev) =>
                            prev.map((p, idx) =>
                              idx === i ? { ...p, orbitRadius: val } : p
                            )
                          );
                        }}
                        className="w-20 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
                      />
                    </div>
                    {/* Orbit Speed */}
                    <div>
                      <label className="mb-1 block text-sm">Orbit Speed:</label>
                      <input
                        type="number"
                        step="0.01"
                        value={planet.orbitSpeed}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setPlanets((prev) =>
                            prev.map((p, idx) =>
                              idx === i ? { ...p, orbitSpeed: val } : p
                            )
                          );
                        }}
                        className="w-16 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => handleRemovePlanet(i)}
                      className="ml-auto rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Moons */}
                  <div className="border-t border-gray-500 pt-2">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-medium">Moons</h3>
                      <button
                        onClick={() => handleAddMoon(i)}
                        className="rounded bg-blue-700 px-2 py-1 text-xs text-white hover:bg-blue-600"
                      >
                        + Moon
                      </button>
                    </div>

                    {planet.moons.map((moon, mIdx) => (
                      <div
                        key={mIdx}
                        className="mb-2 flex flex-wrap items-center gap-2 rounded bg-gray-700 p-2"
                      >
                        {/* Moon Size */}
                        <div>
                          <label className="block text-xs">Size:</label>
                          <input
                            type="number"
                            step="0.01"
                            value={moon.size}
                            onChange={(e) => {
                              const newSize = parseFloat(e.target.value);
                              setPlanets((prev) =>
                                prev.map((pl, pIndex) => {
                                  if (pIndex === i) {
                                    const updatedMoons = pl.moons.map(
                                      (mm, mmIdx) =>
                                        mmIdx === mIdx
                                          ? { ...mm, size: newSize }
                                          : mm
                                    );
                                    return { ...pl, moons: updatedMoons };
                                  }
                                  return pl;
                                })
                              );
                            }}
                            className="w-16 rounded border border-gray-500 bg-gray-600 px-1 py-0.5 focus:outline-none"
                          />
                        </div>
                        {/* Moon Orbit Radius */}
                        <div>
                          <label className="block text-xs">Orbit R.:</label>
                          <input
                            type="number"
                            step="0.1"
                            value={moon.orbitRadius}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setPlanets((prev) =>
                                prev.map((pl, pIndex) => {
                                  if (pIndex === i) {
                                    const updatedMoons = pl.moons.map(
                                      (mm, mmIdx) =>
                                        mmIdx === mIdx
                                          ? { ...mm, orbitRadius: val }
                                          : mm
                                    );
                                    return { ...pl, moons: updatedMoons };
                                  }
                                  return pl;
                                })
                              );
                            }}
                            className="w-16 rounded border border-gray-500 bg-gray-600 px-1 py-0.5 focus:outline-none"
                          />
                        </div>
                        {/* Moon Orbit Speed */}
                        <div>
                          <label className="block text-xs">Orbit S.:</label>
                          <input
                            type="number"
                            step="0.01"
                            value={moon.orbitSpeed}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setPlanets((prev) =>
                                prev.map((pl, pIndex) => {
                                  if (pIndex === i) {
                                    const updatedMoons = pl.moons.map(
                                      (mm, mmIdx) =>
                                        mmIdx === mIdx
                                          ? { ...mm, orbitSpeed: val }
                                          : mm
                                    );
                                    return { ...pl, moons: updatedMoons };
                                  }
                                  return pl;
                                })
                              );
                            }}
                            className="w-16 rounded border border-gray-500 bg-gray-600 px-1 py-0.5 focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={() => handleRemoveMoon(i, mIdx)}
                          className="ml-auto rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right column: 3D preview + Fullscreen btn */}
          <section className="flex h-full w-full flex-col rounded-md bg-black/10 p-3 shadow-md backdrop-blur">
            <button
              onClick={handleFullscreen}
              className="mb-3 self-start rounded bg-indigo-700 px-2 py-1 text-white hover:bg-indigo-600"
            >
              Fullscreen
            </button>

            <SolarSystemCanvas
              canvasContainerRef={canvasContainerRef} // pass the ref
              starColor={STAR_COLORS[starType]}
              starSize={starSize}
              planetTextures={PLANET_TEXTURE_PATHS}
              planets={planets}
              onSelectBody={(body) => setSelectedBody(body)}
            />
          </section>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-400">
        &copy; 2024 miketsak.gr
      </footer>
    </div>
  );
}
