import { useRef, useState } from 'react';
import ScratchCard, { CUSTOM_BRUSH_PRESET, type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function CustomBrush() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  return (
    <Example
      title="Custom brush"
      description="Replaces the circle brush with an image. CUSTOM_BRUSH_PRESET is the built-in star shape."
      complete={complete}
      controls={
        <>
          <button onClick={() => { ref.current?.reset(); setComplete(false); }}>Reset</button>
          <button onClick={() => ref.current?.revealAll()}>Reveal All</button>
        </>
      }
    >
      <ScratchCard
        ref={ref}
        width={320}
        height={226}
        coverColor="#475569"
        finishPercent={70}
        customBrush={CUSTOM_BRUSH_PRESET}
        onComplete={() => setComplete(true)}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
