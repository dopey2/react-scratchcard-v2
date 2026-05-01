import { useRef } from 'react';
import ScratchCard, { CUSTOM_BRUSH_PRESET } from 'react-scratchcard-v2';
import img from './img.jpg';

export default function App() {
  const ref = useRef<InstanceType<typeof ScratchCard>>(null);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>react-scratchcard-v2 demo</h1>
      <button onClick={() => ref.current?.reset()} style={{ marginBottom: '1rem', display: 'block' }}>
        Reset
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
