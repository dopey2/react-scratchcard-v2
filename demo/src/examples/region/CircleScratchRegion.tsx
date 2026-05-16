import { useRef, useState } from 'react';
import ScratchCard, { Covers, Shape, type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function CircleScratchRegion() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  const handleComplete = () => {
    ref.current?.revealAll({ duration: 1000, blockSize: 4 });
    setComplete(true);
  };

  return (
    <Example
      title="Circle scratch region"
      description="Solid color cover with a circular scratch zone. On complete the main canvas fades out — the background canvas keeps the outer ring visible."
      complete={complete}
      controls={
        <>
          <button onClick={() => { ref.current?.reset(); setComplete(false); }}>Reset</button>
          <button onClick={handleComplete}>Reveal All</button>
        </>
      }
    >
      <ScratchCard
        ref={ref}
        width={320}
        height={226}
        cover={Covers.color('#e11d48')}
        finishPercent={50}
        lockOnComplete={true}
        scratchRegion={Shape.circle(160, 113, 90)}
        onComplete={handleComplete}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
