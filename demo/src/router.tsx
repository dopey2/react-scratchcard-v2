import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type RouterContextValue = {
  route: string;
  navigate: (path: string) => void;
};

const RouterContext = createContext<RouterContextValue>({
  route: '/',
  navigate: () => {},
});

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState(window.location.pathname);

  const navigate = useCallback((path: string) => {
    history.pushState(null, '', path);
    setRoute(path);
  }, []);

  useEffect(() => {
    const handler = () => setRoute(window.location.pathname);
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
