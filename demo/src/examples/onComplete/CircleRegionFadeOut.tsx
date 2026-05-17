import { useRef, useState } from 'react';
import ScratchCard, { Covers, Regions, type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function CircleRegionFadeOut() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  const handleReset = () => {
    ref.current?.reset();
    setComplete(false);
  };

  return (
    <Example
      title="Circle region + fade out"
      description="coverBackground renders a second canvas behind the main one. When the main canvas fades out via CSS, the outer ring stays visible — without coverBackground it would disappear with the cover."
      complete={complete}
      controls={
        <>
          <button onClick={handleReset}>Reset</button>
          <button onClick={() => setComplete(true)}>Trigger</button>
        </>
      }
    >
      <ScratchCard
        ref={ref}
        width={320}
        height={226}
        cover={Covers.color('#0ea5e9')}
        finishPercent={50}
        lockOnComplete={true}
        scratchRegion={Regions.circle(160, 113, 90)}
        coverBackground={true}
        onComplete={() => setComplete(true)}
        canvasProps={{
          style: {
            transition: 'opacity 1s ease-out',
            opacity: complete ? 0 : 1,
          }
        }}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
