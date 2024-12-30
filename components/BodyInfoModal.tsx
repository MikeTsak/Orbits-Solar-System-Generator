// components/BodyInfoModal.tsx
import React from 'react';

interface BodyInfoModalProps {
  body: {
    name: string;
    scaleFactor: number;
    isStar?: boolean;
  };
  computeStats: (scaleFactor: number, isStar?: boolean) => {
    radiusMeters: number;
    circumferenceMeters: number;
    massKg: number;
    gravity: number;
  };
  onClose: () => void;
}

export default function BodyInfoModal({
  body,
  computeStats,
  onClose
}: BodyInfoModalProps) {
  const { name, scaleFactor, isStar } = body;

  const stats = computeStats(scaleFactor, isStar);

  // Earth references
  const EARTH_RADIUS_M = 6_371_000;
  const EARTH_CIRCUM = 2 * Math.PI * EARTH_RADIUS_M;
  const EARTH_MASS = 5.9722e24;
  const EARTH_GRAVITY = 9.81;

  // Compare
  const radiusFactor = stats.radiusMeters / EARTH_RADIUS_M;
  const circFactor = stats.circumferenceMeters / EARTH_CIRCUM;
  const massFactor = stats.massKg / EARTH_MASS;
  const gravFactor = stats.gravity / EARTH_GRAVITY;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded shadow-lg max-w-sm w-full relative">
        <button
          className="absolute top-2 right-2 text-white hover:text-gray-300"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">{name} Stats</h2>

        <div className="text-sm space-y-2">
          <p>
            <strong>Radius:</strong>{' '}
            {stats.radiusMeters.toExponential(3)} m (~{radiusFactor.toFixed(2)}× Earth)
          </p>
          <p>
            <strong>Circumference:</strong>{' '}
            {stats.circumferenceMeters.toExponential(3)} m (~{circFactor.toFixed(2)}× Earth)
          </p>
          <p>
            <strong>Mass:</strong>{' '}
            {stats.massKg.toExponential(3)} kg (~{massFactor.toFixed(2)}× Earth)
          </p>
          <p>
            <strong>Surface Gravity:</strong>{' '}
            {stats.gravity.toFixed(2)} m/s² (~{gravFactor.toFixed(2)}× Earth)
          </p>
        </div>
      </div>
    </div>
  );
}
