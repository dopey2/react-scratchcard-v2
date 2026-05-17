import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from './router';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </StrictMode>
);
