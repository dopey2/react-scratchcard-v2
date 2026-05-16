import { useRef, useState } from 'react';
import ScratchCard, {Brushes, Covers, type ScratchCardRef} from 'react-scratchcard-v2';
import { Example, Result } from '../shared';
import { brushImageBase64 } from "./customBrushImage";

const imageBrush = Brushes.image(brushImageBase64, 30, 30)
const coloredCover = Covers.color('#475569')

export default function CustomBrush() {
  const ref = useRef<ScratchCardRef>(null);
  const [complete, setComplete] = useState(false);

  return (
    <Example
      title="Custom brush"
      description="Replaces the circle brush with an image. CUSTOM_BRUSH_PRESET is the built-in star shape."
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
        cover={coloredCover}
        brush={imageBrush}
        finishPercent={70}
        onComplete={() => setComplete(true)}
      >
        <Result />
      </ScratchCard>
    </Example>
  );
}
