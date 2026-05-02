import { useState } from 'react';
import BasicDemo from './pages/BasicDemo';
import ScrollTest from './pages/ScrollTest';

const PAGES = {
  basic: 'Basic Demo',
  scroll: 'Scroll Test',
} as const;

type Page = keyof typeof PAGES;

const navStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 10,
  display: 'flex',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  background: '#1a1a1a',
  borderBottom: '1px solid #333',
};

const btnStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.4rem 1rem',
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  fontWeight: active ? 700 : 400,
  background: active ? '#fff' : '#333',
  color: active ? '#1a1a1a' : '#aaa',
});

export default function App() {
  const [page, setPage] = useState<Page>('basic');

  return (
    <div>
      <nav style={navStyle}>
        {(Object.entries(PAGES) as [Page, string][]).map(([key, label]) => (
          <button key={key} style={btnStyle(page === key)} onClick={() => setPage(key)}>
            {label}
          </button>
        ))}
      </nav>
      {page === 'basic' && <BasicDemo />}
      {page === 'scroll' && <ScrollTest />}
    </div>
  );
}
