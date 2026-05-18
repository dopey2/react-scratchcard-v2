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
      <span className="w-64 mr-5 text-sm font-semibold text-white tracking-tight">
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
      <div className="ml-auto">
        <a
          href="https://github.com/dopey2/react-scratchcard-v2"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded text-slate-400 hover:text-white transition-colors"
          aria-label="GitHub repository"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </a>
      </div>
    </header>
  );
}
