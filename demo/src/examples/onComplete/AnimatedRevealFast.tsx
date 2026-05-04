import { useRef, useState } from 'react';
import ScratchCard, { type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function AnimatedRevealFast() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  return (
    <Example
      title="Animated pixel reveal (fast)"
      description="Same as above but at 500ms — snappier feel, larger pixel batches per frame."
      complete={complete}
      controls={
        <>
          <button onClick={() => { ref.current?.reset(); setComplete(false); }}>Reset</button>
          <button onClick={() => ref.current?.revealAll({ duration: 500, blockSize: 4 })}>Reveal All</button>
        </>
      }
    >
      <ScratchCard
        ref={ref}
        width={320}
        height={226}
        coverColor="#0284c7"
        finishPercent={70}
        onComplete={() => { setComplete(true); ref.current?.revealAll({ duration: 500, blockSize: 4 }); }}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
