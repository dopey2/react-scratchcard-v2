import ScratchCard, { Covers } from 'react-scratchcard-v2';
import img from '../assets/cover.jpg';

function Block({ label }: { label: string }) {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-100 text-xl text-slate-400 border-b border-slate-200">
      {label}
    </div>
  );
}

export default function ScrollTest() {
  return (
    <div>
      <Block label="↓ Scroll down to reach the scratch card" />

      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        <p className="text-slate-500 text-center max-w-sm text-sm leading-relaxed">
          <strong className="text-slate-700 font-semibold">Test:</strong> scratch the card on
          mobile. The page must{' '}
          <strong className="text-slate-700 font-semibold">not scroll</strong> while your finger
          is on the canvas. Scrolling means <code>e.preventDefault()</code> on{' '}
          <code>touchmove</code> is broken.
        </p>
        <ScratchCard
          width={320}
          height={226}
          cover={Covers.image(img)}
          finishPercent={80}
          onComplete={() => console.log('complete')}
        >
          <div className="flex w-full h-full items-center justify-center bg-white">
            <p className="text-slate-400 text-sm">Your content here</p>
          </div>
        </ScratchCard>
      </div>

      <Block label="↑ Scroll up to go back" />
    </div>
  );
}
