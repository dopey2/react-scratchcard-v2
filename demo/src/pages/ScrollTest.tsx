import ScratchCard from 'react-scratchcard-v2';
import img from '../img.jpg';

const Block = ({ label }: { label: string }) => (
  <div style={{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f0f0',
    fontSize: '1.5rem',
    color: '#999',
    borderBottom: '1px solid #ddd',
  }}>
    {label}
  </div>
);

export default function ScrollTest() {
  return (
    <div>
      <Block label="↓ Scroll down to reach the scratch card" />

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        background: '#fff',
      }}>
        <p style={{ color: '#555', textAlign: 'center', maxWidth: 340 }}>
          <strong>Test:</strong> scratch the card on mobile.<br />
          The page must <strong>not scroll</strong> while your finger is on the canvas.
          Scrolling means <code>e.preventDefault()</code> on <code>touchmove</code> is broken.
        </p>
        <ScratchCard
          width={320}
          height={226}
          coverImage={img}
          finishPercent={80}
          onComplete={() => console.log('complete')}
        >
          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>Your content here</p>
          </div>
        </ScratchCard>
      </div>

      <Block label="↑ Scroll up to go back" />
    </div>
  );
}
