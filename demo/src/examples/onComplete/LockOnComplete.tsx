import { useRef, useState } from 'react';
import ScratchCard, { Covers, type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function LockOnComplete() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  return (
    <Example
      title="Lock on complete"
      description="Default behavior. Scratching becomes impossible once the threshold is reached."
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
        cover={Covers.color('#6366f1')}
        finishPercent={60}
        lockOnComplete={true}
        onComplete={() => setComplete(true)}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
