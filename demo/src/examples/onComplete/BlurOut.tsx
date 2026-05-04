import { useRef, useState } from 'react';
import ScratchCard, { type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function BlurOut() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  return (
    <Example
      title="Blur out"
      description="CSS filter + opacity transition. The blur dissolves the cover before it disappears."
      complete={complete}
      controls={
        <>
          <button onClick={() => { ref.current?.reset(); setComplete(false); }}>Reset</button>
          <button onClick={() => { ref.current?.revealAll({ blockSize: 4 }); setComplete(true); }}>Reveal All</button>
        </>
      }
    >
      <ScratchCard
        ref={ref}
        width={320}
        height={226}
        coverColor="#8b5cf6"
        finishPercent={70}
        onComplete={() => setComplete(true)}
        canvasProps={{
          style: {
            transition: 'filter 0.6s ease-out, opacity 0.6s ease-out',
            filter: complete ? 'blur(12px)' : 'none',
            opacity: complete ? 0 : 1,
          }
        }}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
