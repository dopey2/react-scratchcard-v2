import { useRef, useState } from 'react';
import ScratchCard, { Covers, type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function BlurAnimatedReveal() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  const trigger = () => {
    setComplete(true);
    ref.current?.revealAll({ duration: 1200, blockSize: 4 });
  };

  return (
    <Example
      title="Blur + animated reveal"
      description="CSS blur runs simultaneously with pixel-by-pixel erasure. Both effects combine on completion."
      complete={complete}
      controls={
        <>
          <button onClick={() => { ref.current?.reset(); setComplete(false); }}>Reset</button>
          <button onClick={trigger}>Reveal All</button>
        </>
      }
    >
      <ScratchCard
        ref={ref}
        width={320}
        height={226}
        cover={Covers.color('#0f172a')}
        finishPercent={70}
        lockOnComplete={false}
        onComplete={trigger}
        canvasProps={{
          style: {
            transition: 'filter 1.2s ease-out, opacity 1.2s ease-out',
            filter: complete ? 'blur(16px)' : 'none',
            opacity: complete ? 0 : 1,
          }
        }}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
