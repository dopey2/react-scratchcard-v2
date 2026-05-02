// ── Shared layout primitives ──────────────────────────────────────────────────

export type ExampleProps = {
  title: string;
  description: string;
  complete?: boolean;
  controls?: React.ReactNode;
  children: React.ReactNode;
};

export function Example({ title, description, complete, controls, children }: ExampleProps) {
  return (
    <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', padding: '2rem 0' }}>
      {children}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', margin: 0 }}>{title}</h3>
        <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>{description}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 120, marginTop: '0.5rem' }}>
          {controls}
        </div>
        {complete !== undefined && (
          <div style={{ fontSize: '0.75rem', color: complete ? '#4ade80' : '#555', marginTop: '0.25rem' }}>
            {complete ? '● complete' : '○ pending'}
          </div>
        )}
      </div>
    </div>
  );
}

export function Result() {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#555', fontSize: '0.9rem', margin: 0 }}>Your content here</p>
    </div>
  );
}

export function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #2a2a2a', margin: 0 }} />;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#555',
        margin: 0,
        padding: '1.5rem 0 0',
        borderTop: '2px solid #333',
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
