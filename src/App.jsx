import { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  useEffect(() => {
    const applyMode = () => {
      const mode = localStorage.getItem('cybernest_theme_mode') || 'system';
      document.documentElement.dataset.themeMode = mode;
      document.documentElement.dataset.resolvedTheme = mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : mode === 'dark' ? 'dark' : 'light';
    };
    applyMode();
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    query.addEventListener?.('change', applyMode);
    window.addEventListener('storage', applyMode);
    return () => {
      query.removeEventListener?.('change', applyMode);
      window.removeEventListener('storage', applyMode);
    };
  }, []);
  return <ErrorBoundary><AppRoutes /></ErrorBoundary>;
}
