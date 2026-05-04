import { useRef, useState } from 'react';
import ScratchCard, { type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function ContinueOnComplete() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  return (
    <Example
      title="Continue on complete"
      description="Scratching keeps working after the threshold is reached. onComplete still fires only once."
      complete={complete}
      controls={
        <>
          <button onClick={() => { ref.current?.reset(); setComplete(false); }}>Reset</button>
          <button onClick={() => ref.current?.revealAll({ blockSize: 4 })}>Reveal All</button>
        </>
      }
    >
      <ScratchCard
        ref={ref}
        width={320}
        height={226}
        coverColor="#10b981"
        finishPercent={70}
        lockOnComplete={false}
        onComplete={() => setComplete(true)}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
