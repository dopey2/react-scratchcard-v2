import {useCallback, useRef, useState} from 'react';
import ScratchCard, { Covers, type Point, type ScratchCardRef } from 'react-scratchcard-v2';
import { Example, Result } from '../shared';
import ParticleSystem, { type ParticleSystemRef } from './ParticleSystem';
import img from '../../assets/cover.jpg';

export default function ParticleDemo() {
  const cardRef = useRef<ScratchCardRef>(null);
  const particleRef = useRef<ParticleSystemRef>(null);
  const prevPercentRef = useRef(0);
  const [complete, setComplete] = useState(false);


  // percent is cumulative (0–100). We derive a delta since the last call and scale it
  // into a particle count — more pixels erased in one move = more particles emitted.
  const onScratch = useCallback((percent: number, _position: Point, globalPos: Point) => {
    const delta = percent - prevPercentRef.current;
    prevPercentRef.current = percent;
    if (delta > 0) {
      const particleCount = Math.ceil(delta * 4);
      particleRef.current?.emit(globalPos, particleCount);
    }
  }, [])

  return (
    <Example
      title="Particle system"
      description="SVG particles emitted at the brush position. ParticleSystem is not part of the library, this demo shows how onScratch can drive any external effect."
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
        onScratch={onScratch}
      >
        <Result />
      </ScratchCard>
      <ParticleSystem ref={particleRef} />
    </Example>
  );
}
