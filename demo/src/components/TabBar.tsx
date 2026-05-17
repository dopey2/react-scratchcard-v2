import { useRouter } from '../router';

const TABS = [
  { label: 'Demo', path: '/demo' },
  { label: 'Scroll test', path: '/scroll-test' },
  { label: 'State test', path: '/state-test' },
] as const;

export default function TabBar() {
  const { route, navigate } = useRouter();

  const isActive = (path: string) =>
    path === '/demo'
      ? route === '/demo' || route.startsWith('/demo/')
      : route === path;

  return (
    <header className="shrink-0 flex items-center gap-1 px-5 h-12 bg-slate-800 border-b border-slate-700">
      <span className="mr-5 text-sm font-semibold text-white tracking-tight">
        react-scratchcard-v2
      </span>
      {TABS.map(({ label, path }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className={[
            'h-full px-3 py-0 inline-flex items-center',
            'bg-transparent rounded-none border-0 border-b-2',
            'text-xs font-medium cursor-pointer transition-colors',
            isActive(path)
              ? 'text-white border-sky-400'
              : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </header>
  );
}
