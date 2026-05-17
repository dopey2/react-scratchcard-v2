import { useRef, useState } from 'react';
import ScratchCard, { Covers, type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';

export default function FadeOut() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  return (
    <Example
      title="Fade out"
      description="CSS opacity transition via canvasProps + onComplete state. Full control over duration and easing."
      complete={complete}
      controls={
        <>
          <button onClick={() => { ref.current?.reset(); setComplete(false); }}>Reset</button>
          <button onClick={() => setComplete(true)}>Trigger</button>
        </>
      }
    >
      <ScratchCard
        ref={ref}
        width={320}
        height={226}
        cover={Covers.color('#f59e0b')}
        finishPercent={70}
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
