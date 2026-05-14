import { useRef, useState } from 'react';
import ScratchCard, { type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function BrushSize() {
  const ref = useRef<ScratchCardRef>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [complete, setComplete] = useState(false);

  return (
    <Example
      title="Brush size"
      description="Controls the radius of the circular brush in pixels."
      complete={complete}
      controls={
        <>
          <label style={{ color: '#888', fontSize: '0.8rem' }}>
            Size: {brushSize}px
            <input
              type="range"
              min={5}
              max={60}
              value={brushSize}
              onChange={(e) => { setBrushSize(Number(e.target.value)); setComplete(false); }}
              style={{ width: '100%', marginTop: '0.25rem' }}
            />
          </label>
          <button onClick={() => { ref.current?.reset(); setComplete(false); }}>Reset</button>
        </>
      }
    >
      <ScratchCard
        key={brushSize}
        ref={ref}
        width={320}
        height={226}
        coverColor="#334155"
        brushSize={brushSize}
        finishPercent={70}
        onComplete={() => setComplete(true)}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
