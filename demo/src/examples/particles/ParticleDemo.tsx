import { useRef, useState } from 'react';
import ScratchCard, { Covers, type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';
import ParticleSystem, { type ParticleSystemRef } from './ParticleSystem';
import img from '../../img.jpg';

export default function ParticleDemo() {
  const cardRef = useRef<ScratchCardRef>(null);
  const particleRef = useRef<ParticleSystemRef>(null);
  const prevPercentRef = useRef(0);
  const [complete, setComplete] = useState(false);

  return (
    <Example
      title="Particle system"
      description="SVG particles emitted at the brush position. ParticleSystem has no knowledge of the scratch card — wired via onScratch."
      complete={complete}
      controls={
        <button onClick={() => {
          cardRef.current?.reset();
          prevPercentRef.current = 0;
          setComplete(false);
        }}>Reset</button>
      }
    >
      <ScratchCard
        ref={cardRef}
        width={320}
        height={226}
        cover={Covers.image(img)}
        scratchInterval={0}
        lockOnComplete={false}
        onComplete={() => setComplete(true)}
        onScratch={(percent, _, globalPos) => {
          const delta = percent - prevPercentRef.current;
          prevPercentRef.current = percent;
          if (delta > 0) particleRef.current?.emit(globalPos, Math.ceil(delta * 4));
        }}
      >
        <Result />
      </ScratchCard>
      <ParticleSystem ref={particleRef} />
    </Example>
  );
}
