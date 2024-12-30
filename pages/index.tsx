// pages/index.tsx
import React, { useState, useRef } from 'react';
import Head from 'next/head';
import SolarSystemCanvas from '../components/SolarSystemCanvas';

// Earth & Sun references
const EARTH_RADIUS = 6_371_000;
const EARTH_MASS = 5.972e24;
const SUN_RADIUS = 6.957e8;
const SUN_MASS = 1.989e30;
const G = 6.6743e-11;

// Planet texture paths (unchanged)
const PLANET_TEXTURE_PATHS = {
  EarthLike: '/textures/earth.jpg',
  GasGiant: '/textures/jupiter.jpg',
  Forestworld: '/textures/forestworld.jpg',
  Rocky: '/textures/mars.jpg',
  Desert: '/textures/desert.jpg',
  WaterWorld: '/textures/waterworld.jpg',
  LavaPlanet: '/textures/lavaplanet.jpg',
  MagmaPlanet: '/textures/magma.png',
};

// Moon texture paths (unchanged)
const MOON_TEXTURE_PATHS = {
  Gray: '/textures-moons/moon_gray.jpg',
  Cratered: '/textures-moons/moon_cratered.jpg',
  IceMoon: '/textures-moons/moon_ice.jpg',
  ForestMoon: '/textures-moons/forest.jpg',
};

const STAR_COLORS = {
  Blue: '#84b6f4',
  White: '#ffffff',
  'Yellow-White': '#ffffc2',
  Yellow: '#fff68f',
  'Orangish Red': '#ff9933',
};

// Data structures
interface MoonData {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number;
  texture: keyof typeof MOON_TEXTURE_PATHS;
}

interface PlanetData {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number;
  texture: keyof typeof PLANET_TEXTURE_PATHS;
  moons: MoonData[];
}

/** 
 * For the new objects (space stations, ship wrecks, UFOs) 
 * we store them similarly to how we store planets.
 * They can orbit the star (parentPlanetIndex = null)
 * or orbit a particular planet (parentPlanetIndex = i).
 */
interface OrbitObject {
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  spinSpeed: number;
  parentPlanetIndex: number | null;  // null => orbit star, or => index of planet
}

/** We'll have separate arrays for each new object type. */

export default function Home() {
  // Star
  const [starType, setStarType] = useState<keyof typeof STAR_COLORS>('Yellow');
  const [starSize, setStarSize] = useState(1);
  const [starLightIntensity, setStarLightIntensity] = useState(2.5);

  // Planets
  const [planets, setPlanets] = useState<PlanetData[]>([]);

  // NEW: Arrays for space stations, ship wrecks, UFOs
  const [spaceStations, setSpaceStations] = useState<OrbitObject[]>([]);
  const [shipWrecks, setShipWrecks] = useState<OrbitObject[]>([]);
  const [ufos, setUfos] = useState<OrbitObject[]>([]);

  // Seeds
  const [seed, setSeed] = useState('');
  const [customSeed, setCustomSeed] = useState('');

  // Info sheet
  const [selectedBody, setSelectedBody] = useState<{
    type: 'star' | 'planet';
    size: number;
  } | null>(null);

  // Fullscreen ref
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // ---------- RANDOM SEED HELPERS ----------
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

  function generateSystemFromSeed(seedValue: string) {
    const rand = seededRandom(seedValue);

    // star
    const starKeys = Object.keys(STAR_COLORS) as Array<keyof typeof STAR_COLORS>;
    const starIdx = Math.floor(rand() * starKeys.length);
    const chosenStarType = starKeys[starIdx];
    const sSize = parseFloat((0.5 + rand() * 2.5).toFixed(1));

    // planets
    const planetCount = 2 + Math.floor(rand() * 4);
    const newPlanets: PlanetData[] = [];

    for (let i = 0; i < planetCount; i++) {
      const pSize = parseFloat((0.5 + rand() * 2.5).toFixed(1));
      const orbitR = 10 + i * 5;
      const orbitS = 0.1;
      const spin = parseFloat((0.005 + rand() * 0.015).toFixed(3));

      const planetTexKeys = Object.keys(PLANET_TEXTURE_PATHS) as Array<
        keyof typeof PLANET_TEXTURE_PATHS
      >;
      const ptIdx = Math.floor(rand() * planetTexKeys.length);

      // random moon count
      const moonCount = Math.floor(rand() * 3);
      const newMoons: MoonData[] = [];
      for (let m = 0; m < moonCount; m++) {
        const mSize = parseFloat((0.1 + rand() * 0.4).toFixed(2));
        const mOrbR = 2 + Math.floor(rand() * 4);
        const mOrbS = parseFloat((0.2 + rand() * 0.4).toFixed(2));
        const mSpin = parseFloat((0.01 + rand() * 0.02).toFixed(3));

        const moonTexKeys = Object.keys(MOON_TEXTURE_PATHS) as Array<
          keyof typeof MOON_TEXTURE_PATHS
        >;
        const mtIdx = Math.floor(rand() * moonTexKeys.length);

        newMoons.push({
          size: mSize,
          orbitRadius: mOrbR,
          orbitSpeed: mOrbS,
          spinSpeed: mSpin,
          texture: moonTexKeys[mtIdx],
        });
      }

      newPlanets.push({
        size: pSize,
        orbitRadius: orbitR,
        orbitSpeed: orbitS,
        spinSpeed: spin,
        texture: planetTexKeys[ptIdx],
        moons: newMoons,
      });
    }

    // Generate a few random space stations, ship wrecks, UFOs
    const newSpaceStations: OrbitObject[] = [];
    const stationCount = Math.floor(rand() * 3);
    for (let i = 0; i < stationCount; i++) {
      newSpaceStations.push({
        size: parseFloat((0.5 + rand() * 1.5).toFixed(1)),  // 0.5..2
        orbitRadius: 5 + Math.floor(rand() * 25),
        orbitSpeed: parseFloat((0.05 + rand() * 0.1).toFixed(2)),
        spinSpeed: parseFloat((0.005 + rand() * 0.015).toFixed(3)),
        parentPlanetIndex: Math.random() < 0.5 ? null : Math.floor(rand() * planetCount),
      });
    }

    const newShipWrecks: OrbitObject[] = [];
    const wreckCount = Math.floor(rand() * 3);
    for (let i = 0; i < wreckCount; i++) {
      newShipWrecks.push({
        size: parseFloat((0.5 + rand() * 1).toFixed(1)),
        orbitRadius: 5 + Math.floor(rand() * 25),
        orbitSpeed: parseFloat((0.05 + rand() * 0.1).toFixed(2)),
        spinSpeed: parseFloat((0.005 + rand() * 0.015).toFixed(3)),
        parentPlanetIndex: Math.random() < 0.5 ? null : Math.floor(rand() * planetCount),
      });
    }

    const newUfos: OrbitObject[] = [];
    const ufoCount = Math.floor(rand() * 3);
    for (let i = 0; i < ufoCount; i++) {
      newUfos.push({
        size: parseFloat((0.3 + rand() * 0.7).toFixed(1)), // 0.3..1
        orbitRadius: 8 + Math.floor(rand() * 15),
        orbitSpeed: parseFloat((0.05 + rand() * 0.1).toFixed(2)),
        spinSpeed: parseFloat((0.01 + rand() * 0.02).toFixed(3)),
        parentPlanetIndex: Math.random() < 0.5 ? null : Math.floor(rand() * planetCount),
      });
    }

    // finalize
    setStarType(chosenStarType);
    setStarSize(sSize);
    setStarLightIntensity(2.5);
    setPlanets(newPlanets);
    setSpaceStations(newSpaceStations);
    setShipWrecks(newShipWrecks);
    setUfos(newUfos);

    setSeed(seedValue);
  }

  const handleLoadFromSeed = () => {
    if (!customSeed.trim()) return;
    generateSystemFromSeed(customSeed.trim());
  };

  // ---------- Stats Panel ----------
  const numberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'standard',
    maximumFractionDigits: 2,
  });
  function formatNumber(n: number) {
    return numberFormatter.format(n);
  }

  function calculateStats(body: { type: 'star' | 'planet'; size: number }) {
    if (body.type === 'star') {
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
            <span className="font-semibold">Radius (m):</span> {formatNumber(stats.radius)}
          </li>
          <li>
            <span className="font-semibold">Circumference (m):</span> {formatNumber(stats.circumference)}
          </li>
          <li>
            <span className="font-semibold">Mass (kg):</span> {formatNumber(stats.mass)}
          </li>
          <li>
            <span className="font-semibold">Surface Gravity (m/s²):</span>{' '}
            {stats.gravity.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </li>
          {isStar ? (
            <>
              <li>
                <span className="font-semibold">Mass vs Sun:</span>{' '}
                {stats.massRatio.toLocaleString('en-US', { maximumFractionDigits: 2 })}×
              </li>
              <li>
                <span className="font-semibold">Gravity vs Sun:</span>{' '}
                {stats.gravityRatio.toLocaleString('en-US', { maximumFractionDigits: 2 })}×
              </li>
            </>
          ) : (
            <>
              <li>
                <span className="font-semibold">Mass vs Earth:</span>{' '}
                {stats.massRatio.toLocaleString('en-US', { maximumFractionDigits: 2 })}×
              </li>
              <li>
                <span className="font-semibold">Gravity vs Earth:</span>{' '}
                {stats.gravityRatio.toLocaleString('en-US', { maximumFractionDigits: 2 })}×
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

  // Planet & Moon CRUD (unchanged)...

  // For Space Stations CRUD
  const handleAddSpaceStation = () => {
    setSpaceStations((prev) => [
      ...prev,
      {
        size: 1,
        orbitRadius: 10,
        orbitSpeed: 0.1,
        spinSpeed: 0.01,
        parentPlanetIndex: null,
      },
    ]);
  };
  const handleRemoveSpaceStation = (idx: number) => {
    setSpaceStations((prev) => prev.filter((_, i) => i !== idx));
  };

  // For Ship Wrecks CRUD
  const handleAddShipWreck = () => {
    setShipWrecks((prev) => [
      ...prev,
      {
        size: 1,
        orbitRadius: 10,
        orbitSpeed: 0.1,
        spinSpeed: 0.01,
        parentPlanetIndex: null,
      },
    ]);
  };
  const handleRemoveShipWreck = (idx: number) => {
    setShipWrecks((prev) => prev.filter((_, i) => i !== idx));
  };

  // For UFOs CRUD
  const handleAddUfo = () => {
    setUfos((prev) => [
      ...prev,
      {
        size: 1,
        orbitRadius: 10,
        orbitSpeed: 0.1,
        spinSpeed: 0.01,
        parentPlanetIndex: null,
      },
    ]);
  };
  const handleRemoveUfo = (idx: number) => {
    setUfos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Fullscreen
  const handleFullscreen = () => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.requestFullscreen?.();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-black to-gray-900 text-gray-200">
      <Head>
        <title>Solar System + Stations/ShipWrecks/UFOs</title>
        <meta
          name="description"
          content="Solar system with star light intensity, spin speeds, plus space stations, ship wrecks, UFOs."
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
        <h1 className="mb-2 text-3xl font-bold tracking-wide">Solar System Generator</h1>
        <p className="text-sm text-gray-300">
          Now includes Space Stations, Ship Wrecks, and UFOs as orbiting objects!
        </p>
      </header>

      <main className="relative mx-auto mb-8 flex-1 flex flex-col items-center justify-center max-w-7xl px-4">
        {statsPanel}

        <div className="grid gap-8 lg:grid-cols-2 w-full">
          {/* Left Column */}
          <section className="space-y-6">
            {/* Seed load */}
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
                onChange={(e) => setStarType(e.target.value as keyof typeof STAR_COLORS)}
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
                className="mb-3 w-full rounded border border-gray-700 bg-gray-800 px-3 py-1 focus:outline-none"
              />

              <label className="mb-1 block">Light Intensity:</label>
              <input
                type="number"
                step="0.1"
                value={starLightIntensity}
                onChange={(e) => setStarLightIntensity(parseFloat(e.target.value))}
                className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-1 focus:outline-none"
              />
            </div>

            {/* Planets config */}
            <PlanetsUI
              planets={planets}
              setPlanets={setPlanets}
            />

            {/* Space Stations / Ship Wrecks / UFOs */}
            <StationsUI
              label="Space Stations (Pyramid, Light Gray)"
              objects={spaceStations}
              setObjects={setSpaceStations}
              handleAdd={handleAddSpaceStation}
              handleRemove={handleRemoveSpaceStation}
            />
            <StationsUI
              label="Ship Wrecks (Cylinder, Light Gray)"
              objects={shipWrecks}
              setObjects={setShipWrecks}
              handleAdd={handleAddShipWreck}
              handleRemove={handleRemoveShipWreck}
            />
            <StationsUI
              label="UFOs (Cube, Purple)"
              objects={ufos}
              setObjects={setUfos}
              handleAdd={handleAddUfo}
              handleRemove={handleRemoveUfo}
            />
          </section>

          {/* Right Column: 3D Preview + Fullscreen button */}
          <section className="flex h-full w-full flex-col rounded-md bg-black/10 p-3 shadow-md backdrop-blur">
            <button
              onClick={handleFullscreen}
              className="mb-3 self-start rounded bg-indigo-700 px-2 py-1 text-white hover:bg-indigo-600"
            >
              Fullscreen
            </button>

            <SolarSystemCanvas
              canvasContainerRef={canvasContainerRef}
              starColor={STAR_COLORS[starType]}
              starSize={starSize}
              starLightIntensity={starLightIntensity}
              planetTextures={PLANET_TEXTURE_PATHS}
              moonTextures={MOON_TEXTURE_PATHS}
              planets={planets}
              spaceStations={spaceStations}
              shipWrecks={shipWrecks}
              ufos={ufos}
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

/** A sub-component to configure the Planets & their Moons. */
function PlanetsUI({
  planets,
  setPlanets
}: {
  planets: PlanetData[];
  setPlanets: React.Dispatch<React.SetStateAction<PlanetData[]>>;
}) {
  const handleAddPlanet = () => {
    setPlanets((prev) => [
      ...prev,
      {
        size: 1,
        orbitRadius: 10 + prev.length * 5,
        orbitSpeed: 0.1,
        spinSpeed: 0.01,
        texture: 'EarthLike',
        moons: []
      }
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
                spinSpeed: 0.01,
                texture: 'Gray'
              }
            ]
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
            moons: planet.moons.filter((_, m) => m !== moonIndex)
          };
        }
        return planet;
      })
    );
  };

  return (
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
        <div key={i} className="mb-4 space-y-3 rounded bg-gray-800/50 p-3">
          {/* Planet row */}
          <div className="flex flex-wrap gap-3">
            {/* size */}
            <div>
              <label className="mb-1 block text-sm">Size:</label>
              <input
                type="number"
                step="0.1"
                value={planet.size}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPlanets((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, size: val } : p))
                  );
                }}
                className="w-16 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
              />
            </div>
            {/* texture */}
            <div>
              <label className="mb-1 block text-sm">Texture:</label>
              <select
                value={planet.texture}
                onChange={(e) => {
                  const tex = e.target.value as keyof typeof PLANET_TEXTURE_PATHS;
                  setPlanets((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, texture: tex } : p))
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
            {/* orbit radius */}
            <div>
              <label className="mb-1 block text-sm">Orbit Radius:</label>
              <input
                type="number"
                step="1"
                value={planet.orbitRadius}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPlanets((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, orbitRadius: val } : p))
                  );
                }}
                className="w-20 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
              />
            </div>
            {/* orbit speed */}
            <div>
              <label className="mb-1 block text-sm">Orbit Speed:</label>
              <input
                type="number"
                step="0.01"
                value={planet.orbitSpeed}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPlanets((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, orbitSpeed: val } : p))
                  );
                }}
                className="w-16 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
              />
            </div>
            {/* spin speed */}
            <div>
              <label className="mb-1 block text-sm">Spin Speed:</label>
              <input
                type="number"
                step="0.001"
                value={planet.spinSpeed}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPlanets((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, spinSpeed: val } : p))
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
                {/* Moon size */}
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
                            const updatedMoons = pl.moons.map((mm, mmIdx) =>
                              mmIdx === mIdx ? { ...mm, size: newSize } : mm
                            );
                            return { ...pl, moons: updatedMoons };
                          }
                          return pl;
                        })
                      );
                    }}
                    className="w-14 rounded border border-gray-500 bg-gray-600 px-1 py-0.5 focus:outline-none"
                  />
                </div>
                {/* orbit radius */}
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
                            const updatedMoons = pl.moons.map((mm, mmIdx) =>
                              mmIdx === mIdx ? { ...mm, orbitRadius: val } : mm
                            );
                            return { ...pl, moons: updatedMoons };
                          }
                          return pl;
                        })
                      );
                    }}
                    className="w-14 rounded border border-gray-500 bg-gray-600 px-1 py-0.5 focus:outline-none"
                  />
                </div>
                {/* orbit speed */}
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
                            const updatedMoons = pl.moons.map((mm, mmIdx) =>
                              mmIdx === mIdx ? { ...mm, orbitSpeed: val } : mm
                            );
                            return { ...pl, moons: updatedMoons };
                          }
                          return pl;
                        })
                      );
                    }}
                    className="w-14 rounded border border-gray-500 bg-gray-600 px-1 py-0.5 focus:outline-none"
                  />
                </div>
                {/* spin speed */}
                <div>
                  <label className="block text-xs">Spin S.:</label>
                  <input
                    type="number"
                    step="0.001"
                    value={moon.spinSpeed}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setPlanets((prev) =>
                        prev.map((pl, pIndex) => {
                          if (pIndex === i) {
                            const updatedMoons = pl.moons.map((mm, mmIdx) =>
                              mmIdx === mIdx ? { ...mm, spinSpeed: val } : mm
                            );
                            return { ...pl, moons: updatedMoons };
                          }
                          return pl;
                        })
                      );
                    }}
                    className="w-14 rounded border border-gray-500 bg-gray-600 px-1 py-0.5 focus:outline-none"
                  />
                </div>
                {/* texture */}
                <div>
                  <label className="block text-xs">Texture:</label>
                  <select
                    value={moon.texture}
                    onChange={(e) => {
                      const newTex = e.target.value as keyof typeof MOON_TEXTURE_PATHS;
                      setPlanets((prev) =>
                        prev.map((pl, pIndex) => {
                          if (pIndex === i) {
                            const updatedMoons = pl.moons.map((mm, mmIdx) =>
                              mmIdx === mIdx ? { ...mm, texture: newTex } : mm
                            );
                            return { ...pl, moons: updatedMoons };
                          }
                          return pl;
                        })
                      );
                    }}
                    className="w-20 rounded border border-gray-500 bg-gray-600 px-1 py-0.5 focus:outline-none"
                  >
                    {Object.keys(MOON_TEXTURE_PATHS).map((mt) => (
                      <option key={mt} value={mt}>
                        {mt}
                      </option>
                    ))}
                  </select>
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
  );
}

/** A sub-component to handle Space Stations, Ship Wrecks, UFOs in a similar manner. */
function StationsUI({
  label,
  objects,
  setObjects,
  handleAdd,
  handleRemove
}: {
  label: string;
  objects: Array<{
    size: number;
    orbitRadius: number;
    orbitSpeed: number;
    spinSpeed: number;
    parentPlanetIndex: number | null;
  }>;
  setObjects: React.Dispatch<
    React.SetStateAction<
      {
        size: number;
        orbitRadius: number;
        orbitSpeed: number;
        spinSpeed: number;
        parentPlanetIndex: number | null;
      }[]
    >
  >;
  handleAdd: () => void;
  handleRemove: (idx: number) => void;
}) {
  return (
    <div className="rounded-md bg-white/5 p-4 shadow-md backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{label}</h2>
        <button
          onClick={handleAdd}
          className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-500"
        >
          + Add
        </button>
      </div>

      {objects.map((obj, i) => (
        <div key={i} className="mb-4 space-y-3 rounded bg-gray-800/50 p-3">
          <div className="flex flex-wrap gap-3">
            {/* size */}
            <div>
              <label className="mb-1 block text-sm">Size:</label>
              <input
                type="number"
                step="0.1"
                value={obj.size}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setObjects((prev) =>
                    prev.map((o, idx) => (idx === i ? { ...o, size: val } : o))
                  );
                }}
                className="w-16 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
              />
            </div>
            {/* orbit radius */}
            <div>
              <label className="mb-1 block text-sm">Orbit Radius:</label>
              <input
                type="number"
                step="1"
                value={obj.orbitRadius}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setObjects((prev) =>
                    prev.map((o, idx) => (idx === i ? { ...o, orbitRadius: val } : o))
                  );
                }}
                className="w-20 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
              />
            </div>
            {/* orbit speed */}
            <div>
              <label className="mb-1 block text-sm">Orbit Speed:</label>
              <input
                type="number"
                step="0.01"
                value={obj.orbitSpeed}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setObjects((prev) =>
                    prev.map((o, idx) => (idx === i ? { ...o, orbitSpeed: val } : o))
                  );
                }}
                className="w-16 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
              />
            </div>
            {/* spin speed */}
            <div>
              <label className="mb-1 block text-sm">Spin Speed:</label>
              <input
                type="number"
                step="0.001"
                value={obj.spinSpeed}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setObjects((prev) =>
                    prev.map((o, idx) => (idx === i ? { ...o, spinSpeed: val } : o))
                  );
                }}
                className="w-16 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
              />
            </div>
            {/* parent planet index */}
            <div>
              <label className="mb-1 block text-sm">Orbits Planet #:</label>
              <input
                type="number"
                step="1"
                value={
                  obj.parentPlanetIndex === null ? '' : obj.parentPlanetIndex.toString()
                }
                onChange={(e) => {
                  const valStr = e.target.value;
                  let val: number | null = parseInt(valStr);
                  if (Number.isNaN(val)) val = null;
                  // If user enters e.g. 0 => orbit planet 0, or no => 'null' => star
                  setObjects((prev) =>
                    prev.map((o, idx) => (idx === i ? { ...o, parentPlanetIndex: val } : o))
                  );
                }}
                className="w-16 rounded border border-gray-600 bg-gray-700 px-2 py-1 focus:outline-none"
              />
              <p className="text-xs text-gray-400">
                Leave blank or 'null' => orbits star
              </p>
            </div>

            <button
              onClick={() => handleRemove(i)}
              className="ml-auto rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
