import { useEffect } from 'react';
import { useRouter } from './router';
import TabBar from './components/TabBar';
import Sidebar from './components/Sidebar';
import ExamplePage from './components/ExamplePage';
import ScrollTest from './pages/ScrollTest';
import StateDemo from './pages/StateDemo';
import { EXAMPLES } from './registry';

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-slate-400 text-sm">Select an example from the sidebar</p>
    </div>
  );
}

export default function App() {
  const { route, navigate } = useRouter();

  if (route === '/' || route === '/demo') {
    navigate(`/demo/${EXAMPLES[0].slug}`, { replace: true });
  }

  const isDemo = route === '/demo' || route.startsWith('/demo/');
  const isScroll = route === '/scroll-test';
  const isState = route === '/state-test';

  const slug = route.startsWith('/demo/') ? route.slice(6) : null;
  const activeExample = slug ? (EXAMPLES.find((e) => e.slug === slug) ?? null) : null;

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900">
      <TabBar />

      {isDemo && (
        <div className="flex flex-1 min-h-0">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {activeExample ? <ExamplePage example={activeExample} /> : <EmptyState />}
          </main>
        </div>
      )}

      {isScroll && (
        <div className="flex-1 overflow-y-auto">
          <ScrollTest />
        </div>
      )}

      {isState && (
        <div className="flex-1 overflow-y-auto">
          <StateDemo />
        </div>
      )}
    </div>
  );
}
