import { useRef, useState } from 'react';
import ScratchCard, { type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function AnimatedReveal() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  return (
    <Example
      title="Animated pixel reveal"
      description="revealAll({ duration }) erases remaining pixels progressively. No CSS — the reveal IS the animation."
      complete={complete}
      controls={
        <>
          <button onClick={() => { ref.current?.reset(); setComplete(false); }}>Reset</button>
          <button onClick={() => ref.current?.revealAll({ duration: 1200 })}>Reveal All</button>
        </>
      }
    >
      <ScratchCard
        ref={ref}
        width={320}
        height={226}
        coverColor="#0ea5e9"
        finishPercent={70}
        onComplete={() => { setComplete(true); ref.current?.revealAll({ duration: 1200 }); }}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
