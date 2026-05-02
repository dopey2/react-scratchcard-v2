import { useRef } from 'react';
import ScratchCard, { CUSTOM_BRUSH_PRESET, type ScratchCardRef } from 'react-scratchcard-v2';
import img from '../img.jpg';

// ── Layout ────────────────────────────────────────────────────────────────────

type ExampleProps = {
  title: string;
  description: string;
  controls?: React.ReactNode;
  children: React.ReactNode;
};

function Example({ title, description, controls, children }: ExampleProps) {
  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', padding: '2rem 0' }}>
      {children}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{title}</h2>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{description}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 120 }}>
          {controls}
        </div>
      </div>
    </div>
  );
}

const Separator = () => (
  <hr style={{ border: 'none', borderTop: '1px solid #2a2a2a', margin: 0 }} />
);

const Result = () => (
  <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
    <p style={{ color: '#555', fontSize: '0.9rem' }}>Your content here</p>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BasicDemo() {
  const imageRef = useRef<ScratchCardRef>(null);
  const colorRef = useRef<ScratchCardRef>(null);

  return (
    <div style={{ padding: '0 2rem' }}>

      {/* coverImage — URL or base64, drawn with drawImage */}
      <Example
        title="Image cover"
        description="Any URL or base64 string. Fills the canvas — aspect ratio is not preserved."
        controls={
          <>
            <button onClick={() => imageRef.current?.reset()}>Reset</button>
            <button onClick={() => imageRef.current?.revealAll()}>Reveal All</button>
          </>
        }
      >
        <ScratchCard
          ref={imageRef}
          width={320}
          height={226}
          coverImage={img}
          finishPercent={80}
          onComplete={() => console.log('complete')}
          customBrush={CUSTOM_BRUSH_PRESET}
        >
          <Result />
        </ScratchCard>
      </Example>

      <Separator />

      {/* coverColor — CSS color string, renders instantly without image loading */}
      <Example
        title="Color cover"
        description="Any CSS color string. No image loading — renders instantly."
        controls={
          <>
            <button onClick={() => colorRef.current?.reset()}>Reset</button>
            <button onClick={() => colorRef.current?.revealAll()}>Reveal All</button>
          </>
        }
      >
        <ScratchCard
          ref={colorRef}
          width={320}
          height={226}
          coverColor="#f59e0b"
          finishPercent={80}
          onComplete={() => console.log('complete')}
        >
          <Result />
        </ScratchCard>
      </Example>

    </div>
  );
}
