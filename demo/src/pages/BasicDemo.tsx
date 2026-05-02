import { useRef } from 'react';
import ScratchCard, { CUSTOM_BRUSH_PRESET, type ScratchCardRef } from 'react-scratchcard-v2';
import img from '../img.jpg';

export default function BasicDemo() {
  const ref = useRef<ScratchCardRef>(null);

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Basic Demo</h2>
      <button onClick={() => ref.current?.reset()} style={{ marginBottom: '0.5rem', display: 'block' }}>
        Reset
      </button>
      <button onClick={() => ref.current?.revealAll()} style={{ marginBottom: '1rem', display: 'block' }}>
        Reveal All
      </button>
      <ScratchCard
        ref={ref}
        width={320}
        height={226}
        image={img}
        finishPercent={80}
        onComplete={() => console.log('complete')}
        brushSize={30}
        customBrush={CUSTOM_BRUSH_PRESET}
      >
        <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <h2>You win!</h2>
        </div>
      </ScratchCard>
    </div>
  );
}
