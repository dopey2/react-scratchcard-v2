import { useEffect, useRef, useState } from 'react';
import ScratchCard, { Covers, type ScratchCardRef } from 'react-scratchcard-v2';
import img from '../assets/cover.jpg';

type Release = 'inside' | 'outside' | null;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-2 border-b border-slate-200">
      <span className="w-36 font-mono text-sm text-slate-500">{label}</span>
      {children}
    </div>
  );
}

export default function StateDemo() {
  const cardRef = useRef<ScratchCardRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const releasedInsideRef = useRef(false);

  const [isScratching, setIsScratching] = useState(false);
  const [percent, setPercent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [lastRelease, setLastRelease] = useState<Release>(null);

  useEffect(() => {
    const handleWindowMouseUp = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      releasedInsideRef.current = wrapperRef.current.contains(e.target as Node);
    };
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, []);

  const handleScratchEnd = (p: number) => {
    setIsScratching(false);
    setPercent(p);
    setTimeout(() => {
      setLastRelease(releasedInsideRef.current ? 'inside' : 'outside');
      releasedInsideRef.current = false;
    }, 0);
  };

  return (
    <div className="p-8">
      <div className="mb-6 max-w-sm border-t border-slate-200">
        <Row label="isScratching">
          <span className={`font-mono font-bold text-sm ${isScratching ? 'text-emerald-600' : 'text-red-400'}`}>
            {String(isScratching)}
          </span>
        </Row>
        <Row label="percent">
          <span className="font-mono font-bold text-sm text-slate-900">{percent}%</span>
        </Row>
        <Row label="isComplete">
          <span className={`font-mono font-bold text-sm ${isComplete ? 'text-emerald-600' : 'text-red-400'}`}>
            {String(isComplete)}
          </span>
        </Row>
        <Row label="lastRelease">
          <span
            className={`font-mono font-bold text-sm ${
              lastRelease === 'outside'
                ? 'text-amber-500'
                : lastRelease === 'inside'
                  ? 'text-emerald-600'
                  : 'text-slate-300'
            }`}
          >
            {lastRelease ?? '—'}
          </span>
        </Row>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            cardRef.current?.reset();
            setPercent(0);
            setIsComplete(false);
            setLastRelease(null);
          }}
        >
          Reset
        </button>
        <button onClick={() => cardRef.current?.revealAll({ blockSize: 4 })}>Reveal All</button>
        <button onClick={() => cardRef.current?.revealAll({ duration: 1500, blockSize: 4 })}>
          Reveal (animated)
        </button>
      </div>

      <div
        ref={wrapperRef}
        className="inline-block"
        onMouseDown={() => setIsScratching(true)}
        onTouchStart={() => setIsScratching(true)}
      >
        <ScratchCard
          ref={cardRef}
          width={320}
          height={226}
          cover={Covers.image(img)}
          finishPercent={80}
          onScratch={setPercent}
          onScratchEnd={handleScratchEnd}
          onComplete={() => setIsComplete(true)}
        >
          <div className="flex w-full h-full items-center justify-center bg-white">
            <p className="text-slate-400 text-sm">Your content here</p>
          </div>
        </ScratchCard>
      </div>
    </div>
  );
}
