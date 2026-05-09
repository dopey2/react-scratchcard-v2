import './particles.css';

interface ParticleProps {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  duration: number;
  rotation: number;
  onDone: () => void;
}

export default function Particle({ x, y, dx, dy, color, duration, rotation, onDone }: ParticleProps) {
  return (
    <svg
      style={{
        position: 'fixed',
        left: x,
        top: y,
        width: 0,
        height: 0,
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <g
        style={{
          '--dx': `${dx}px`,
          animation: `particle-x ${duration}ms linear forwards`,
        } as React.CSSProperties}
      >
        <g
          style={{
            '--dy': `${dy}px`,
            animation: `particle-y ${duration}ms ease-in forwards`,
          } as React.CSSProperties}
          onAnimationEnd={onDone}
        >
          <g transform={`rotate(${rotation} 2.5 2.5)`}>
            <polygon points="0,0 5,0 2.5,5" fill={color} />
          </g>
        </g>
      </g>
    </svg>
  );
}
