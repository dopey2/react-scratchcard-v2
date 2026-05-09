import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import type { Point } from 'react-scratchcard-v2';
import Particle from './Particle';

export interface ParticleSystemRef {
  emit: (position: Point, count: number) => void;
}

interface ParticleData {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  duration: number;
  rotation: number;
}

const COLORS = [
  '#fbbf24', '#f59e0b', '#fde68a', '#ffffff', '#fcd34d',
  '#4ade80', '#3b82f6', '#e879f9', '#22d3ee', '#f472b6',
];
const MAX_PARTICLES = 500;

const ParticleSystem = forwardRef<ParticleSystemRef, object>((_, ref) => {
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const nextId = useRef(0);

  const emit = useCallback((pos: Point, count: number) => {
    const burst: ParticleData[] = Array.from({ length: count }, () => ({
      id: nextId.current++,
      x: pos.x,
      y: pos.y,
      dx: (Math.random() - 0.5) * 300,
      dy: 80 + Math.random() * 300,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: 1600 + Math.random() * 1600,
      rotation: Math.random() * 360,
    }));

    setParticles(prev => {
      const combined = [...prev, ...burst];
      return combined.length > MAX_PARTICLES
        ? combined.slice(combined.length - MAX_PARTICLES)
        : combined;
    });
  }, []);

  useImperativeHandle(ref, () => ({ emit }), [emit]);

  const removeParticle = useCallback((id: number) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <>
      {particles.map(p => (
        <Particle
          key={p.id}
          x={p.x}
          y={p.y}
          dx={p.dx}
          dy={p.dy}
          color={p.color}
          duration={p.duration}
          rotation={p.rotation}
          onDone={() => removeParticle(p.id)}
        />
      ))}
    </>
  );
});

ParticleSystem.displayName = 'ParticleSystem';

export default ParticleSystem;
