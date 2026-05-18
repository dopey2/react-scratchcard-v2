import { useRouter } from '../router';
import { EXAMPLES, EXAMPLE_GROUPS } from '../registry';

function ChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
      <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Sidebar() {
  const { route, navigate } = useRouter();
  const activeSlug = route.startsWith('/demo/') ? route.slice(6) : null;

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 overflow-y-auto bg-slate-100">
      <nav className="p-3 pt-4">
        {EXAMPLE_GROUPS.map((group) => (
          <div key={group} className="mb-5">
            <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-widest text-slate-600">
              {group}
            </p>
            {EXAMPLES.filter((e) => e.group === group).map((example) => (
              <button
                key={example.slug}
                onClick={() => navigate(`/demo/${example.slug}`)}
                className={[
                  'flex items-center justify-between w-full px-2 py-1.5',
                  'bg-transparent border-0 rounded-md',
                  'text-sm cursor-pointer transition-colors',
                  activeSlug === example.slug
                    ? 'bg-white text-slate-900 font-medium shadow-sm'
                    : 'text-slate-400 hover:bg-white/70 hover:text-slate-700',
                ].join(' ')}
              >
                {example.title}
                <ChevronRight />
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
