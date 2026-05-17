import { useRef, useState } from 'react';
import ScratchCard, { Covers, Regions, type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function CircleRegionRevealAll() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  const handleComplete = () => {
    ref.current?.revealAll({ duration: 2000, blockSize: 4 });
    setComplete(true);
  };

  const handleReset = () => {
    ref.current?.reset();
    setComplete(false);
  };

  return (
    <Example
      title="Circle region + reveal all"
      description="revealAll() only erases pixels inside the region — the outer ring is never touched."
      complete={complete}
      controls={
        <>
          <button onClick={handleReset}>Reset</button>
          <button onClick={handleComplete}>Reveal All</button>
        </>
      }
    >
      <ScratchCard
        ref={ref}
        width={320}
        height={226}
        cover={Covers.color('#f59e0b')}
        finishPercent={50}
        lockOnComplete={true}
        scratchRegion={Regions.circle(160, 113, 90)}
        onComplete={handleComplete}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
