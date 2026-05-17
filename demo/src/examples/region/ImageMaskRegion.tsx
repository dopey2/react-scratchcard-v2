import { useRef, useState } from 'react';
import ScratchCard, { Brushes, Covers, Regions, type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';
import coverImg from '../../assets/scratchCover.png';
import maskImg from '../../assets/scratchMask.png';

export default function ImageMaskRegion() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  const handleComplete = () => {
    ref.current?.revealAll({ duration: 800,  blockSize: 4 });
    setComplete(true);
  };

  return (
    <Example
      title="Image mask scratch region"
      description="Custom cover image with a PNG mask defining the scratchable zone. Opaque pixels in the mask allow scratching; transparent pixels block it."
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
        cover={Covers.image(coverImg)}
        brush={Brushes.circle(8)}
        finishPercent={70}
        lockOnComplete={true}
        scratchRegion={Regions.image(maskImg)}
        onComplete={handleComplete}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
