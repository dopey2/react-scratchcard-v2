import { useEffect, useRef, useState } from 'react';
import ScratchCard, { type ScratchCardRef } from 'react-scratchcard-v2';
import img from '../img.jpg';

type Release = 'inside' | 'outside' | null;

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.4rem 0',
  borderBottom: '1px solid #2a2a2a',
};

const labelStyle: React.CSSProperties = {
  width: 140,
  color: '#888',
  fontFamily: 'monospace',
  fontSize: '0.9rem',
};

const valueStyle = (color: string): React.CSSProperties => ({
  fontFamily: 'monospace',
  fontSize: '0.95rem',
  fontWeight: 700,
  color,
});

export default function StateDemo() {
  const cardRef = useRef<ScratchCardRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const releasedInsideRef = useRef(false);

  const [isScratching, setIsScratching] = useState(false);
  const [percent, setPercent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [lastRelease, setLastRelease] = useState<Release>(null);

  useEffect(() => {
    const handleWindowMouseUp = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      releasedInsideRef.current = wrapperRef.current.contains(e.target as Node);
    };
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, []);

  const handleScratchEnd = () => {
    setIsScratching(false);
    setTimeout(() => {
      setLastRelease(releasedInsideRef.current ? 'inside' : 'outside');
      releasedInsideRef.current = false;
    }, 0);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>State Demo</h2>

      <div style={{ marginBottom: '1.5rem', maxWidth: 360, borderTop: '1px solid #2a2a2a' }}>
        <div style={rowStyle}>
          <span style={labelStyle}>isScratching</span>
          <span style={valueStyle(isScratching ? '#4c4' : '#c44')}>
            {String(isScratching)}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>percent</span>
          <span style={valueStyle('#eee')}>{percent}%</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>isComplete</span>
          <span style={valueStyle(isComplete ? '#4c4' : '#c44')}>
            {String(isComplete)}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>lastRelease</span>
          <span style={valueStyle(lastRelease === 'outside' ? '#e94' : lastRelease === 'inside' ? '#4c4' : '#555')}>
            {lastRelease ?? '—'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => {
          cardRef.current?.reset();
          setPercent(0);
          setIsComplete(false);
          setLastRelease(null);
        }}>Reset</button>
        <button onClick={() => cardRef.current?.revealAll()}>Reveal All</button>
        <button onClick={() => cardRef.current?.revealAll({ duration: 1500 })}>Reveal (animated)</button>
      </div>

      <div
        ref={wrapperRef}
        style={{ display: 'inline-block' }}
        onMouseDown={() => setIsScratching(true)}
        onTouchStart={() => setIsScratching(true)}
      >
        <ScratchCard
          ref={cardRef}
          width={320}
          height={226}
          coverImage={img}
          finishPercent={80}
          onScratch={setPercent}
          onScratchEnd={handleScratchEnd}
          onComplete={() => setIsComplete(true)}
        >
          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>Your content here</p>
          </div>
        </ScratchCard>
      </div>
    </div>
  );
}
