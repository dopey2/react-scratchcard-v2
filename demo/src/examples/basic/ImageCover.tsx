import { useRef, useState } from 'react';
import ScratchCard, { Covers, type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';
import img from '../../assets/cover.jpg';

export default function ImageCover() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  return (
    <Example
      title="Image cover"
      description="Any URL or base64 string. Fills the canvas — aspect ratio is not preserved."
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
        cover={Covers.image(img)}
        finishPercent={70}
        onComplete={() => setComplete(true)}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
