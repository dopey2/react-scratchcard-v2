import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type NavigateOptions = { replace?: boolean };

type RouterContextValue = {
  route: string;
  navigate: (path: string, options?: NavigateOptions) => void;
};

const RouterContext = createContext<RouterContextValue>({
  route: '/',
  navigate: () => {},
});

// Vite base URL — '/' in dev, '/react-scratchcard-v2/' on GitHub Pages.
// Strip it so the router always works with logical paths (/demo/foo, not /react-scratchcard-v2/demo/foo).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // '/react-scratchcard-v2' or ''

function toLogical(pathname: string): string {
  return pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname;
}

function toHistory(logicalPath: string): string {
  return BASE + logicalPath;
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState(() => toLogical(window.location.pathname));

  const navigate = useCallback((path: string, { replace = false }: NavigateOptions = {}) => {
    if (replace) history.replaceState(null, '', toHistory(path));
    else history.pushState(null, '', toHistory(path));
    setRoute(path);
  }, []);

  useEffect(() => {
    const handler = () => setRoute(toLogical(window.location.pathname));
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
