import { useRef, useState } from 'react';
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
  const lockRef = useRef<ScratchCardRef>(null);
  const continueRef = useRef<ScratchCardRef>(null);
  const blurRef = useRef<ScratchCardRef>(null);
  const combinedRef = useRef<ScratchCardRef>(null);
  const fadeRevealRef = useRef<ScratchCardRef>(null);
  const pixelRevealRef = useRef<ScratchCardRef>(null);

  const [colorDone, setColorDone] = useState(false);
  const [blurDone, setBlurDone] = useState(false);
  const [combinedDone, setCombinedDone] = useState(false);
  const [fadeRevealDone, setFadeRevealDone] = useState(false);

  return (
    <div style={{ padding: '0 2rem' }}>

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
          finishPercent={70}
          onComplete={() => console.log('complete')}
          customBrush={CUSTOM_BRUSH_PRESET}
        >
          <Result />
        </ScratchCard>
      </Example>

      <Separator />

      <Example
        title="Color cover — fade out"
        description="Fade achieved via canvasProps + onComplete state. No internal CSS manipulation."
        controls={
          <>
            <button onClick={() => { colorRef.current?.reset(); setColorDone(false); }}>Reset</button>
            <button onClick={() => { colorRef.current?.revealAll(); setColorDone(true); }}>Reveal All</button>
          </>
        }
      >
        <ScratchCard
          ref={colorRef}
          width={320}
          height={226}
          coverColor="#f59e0b"
          finishPercent={70}
          onComplete={() => setColorDone(true)}
          canvasProps={{
            style: {
              transition: 'opacity 1s ease-out',
              opacity: colorDone ? 0 : 1,
            }
          }}
        >
          <Result />
        </ScratchCard>
      </Example>

      <Separator />

      <Example
        title="Lock on complete"
        description="Default behavior. Scratching becomes impossible once the threshold is reached."
        controls={
          <>
            <button onClick={() => lockRef.current?.reset()}>Reset</button>
            <button onClick={() => lockRef.current?.revealAll()}>Reveal All</button>
          </>
        }
      >
        <ScratchCard
          ref={lockRef}
          width={320}
          height={226}
          coverColor="#6366f1"
          finishPercent={60}
          lockOnComplete={true}
          onComplete={() => console.log('locked')}
        >
          <Result />
        </ScratchCard>
      </Example>

      <Separator />

      <Example
        title="Continue on complete"
        description="Scratching keeps working after the threshold is reached. onComplete still fires only once."
        controls={
          <>
            <button onClick={() => continueRef.current?.reset()}>Reset</button>
            <button onClick={() => continueRef.current?.revealAll()}>Reveal All</button>
          </>
        }
      >
        <ScratchCard
          ref={continueRef}
          width={320}
          height={226}
          coverColor="#10b981"
          finishPercent={70}
          lockOnComplete={false}
          onComplete={() => console.log('complete — scratching continues')}
        >
          <Result />
        </ScratchCard>
      </Example>

      <Separator />

      <Example
        title="Blur out on complete"
        description="Custom CSS animation via canvasProps. Full control over duration, easing, and effect."
        controls={
          <>
            <button onClick={() => { blurRef.current?.reset(); setBlurDone(false); }}>Reset</button>
            <button onClick={() => { blurRef.current?.revealAll(); setBlurDone(true); }}>Reveal All</button>
          </>
        }
      >
        <ScratchCard
          ref={blurRef}
          width={320}
          height={226}
          coverColor="#8b5cf6"
          finishPercent={70}
          onComplete={() => setBlurDone(true)}
          canvasProps={{
            style: {
              transition: 'filter 0.6s ease-out, opacity 0.6s ease-out',
              filter: blurDone ? 'blur(12px)' : 'none',
              opacity: blurDone ? 0 : 1,
            }
          }}
        >
          <Result />
        </ScratchCard>
      </Example>

      <Separator />

      <Example
        title="Blur + animated reveal"
        description="CSS blur on complete combined with animated pixel-by-pixel revealAll(). Both effects run simultaneously."
        controls={
          <>
            <button onClick={() => { combinedRef.current?.reset(); setCombinedDone(false); }}>Reset</button>
            <button onClick={() => { combinedRef.current?.revealAll({ duration: 1200 }); setCombinedDone(true); }}>Reveal All</button>
          </>
        }
      >
        <ScratchCard
          ref={combinedRef}
          width={320}
          height={226}
          coverColor="#0f172a"
          finishPercent={70}
          lockOnComplete={false}
          onComplete={() => { setCombinedDone(true); combinedRef.current?.revealAll({ duration: 1200 }); }}
          canvasProps={{
            style: {
              transition: 'filter 1.2s ease-out, opacity 1.2s ease-out',
              filter: combinedDone ? 'blur(16px)' : 'none',
              opacity: combinedDone ? 0 : 1,
            }
          }}
        >
          <Result />
        </ScratchCard>
      </Example>

      <Separator />

      <Example
        title="Animated pixel reveal"
        description="revealAll({ duration }) erases pixels progressively. No CSS animation — the reveal IS the animation."
        controls={
          <>
            <button onClick={() => pixelRevealRef.current?.reset()}>Reset</button>
            <button onClick={() => pixelRevealRef.current?.revealAll({ duration: 1200 })}>Reveal All</button>
          </>
        }
      >
        <ScratchCard
          ref={pixelRevealRef}
          width={320}
          height={226}
          coverColor="#0ea5e9"
          finishPercent={70}
          onComplete={() => pixelRevealRef.current?.revealAll({ duration: 1200 })}
        >
          <Result />
        </ScratchCard>
      </Example>

      <Separator />

      <Example
        title="Fade out + animated reveal"
        description="CSS fade runs simultaneously with pixel-by-pixel revealAll(). Simpler than blur but equally smooth."
        controls={
          <>
            <button onClick={() => { fadeRevealRef.current?.reset(); setFadeRevealDone(false); }}>Reset</button>
            <button onClick={() => { fadeRevealRef.current?.revealAll({ duration: 1200 }); setFadeRevealDone(true); }}>Reveal All</button>
          </>
        }
      >
        <ScratchCard
          ref={fadeRevealRef}
          width={320}
          height={226}
          coverColor="#e11d48"
          finishPercent={70}
          lockOnComplete={false}
          onComplete={() => { setFadeRevealDone(true); fadeRevealRef.current?.revealAll({ duration: 1200 }); }}
          canvasProps={{
            style: {
              transition: 'opacity 1.2s ease-out',
              opacity: fadeRevealDone ? 0 : 1,
            }
          }}
        >
          <Result />
        </ScratchCard>
      </Example>

    </div>
  );
}
