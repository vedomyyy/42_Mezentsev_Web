import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store';
import { Header } from './components/layout/Header';
import { ThreadsPage } from './pages/ThreadsPage';
import { NewsPage } from './pages/NewsPage';
import { ProfilePage } from './pages/ProfilePage';

function RouterWatcher() {
  const location = useLocation();
  const closePanel = useStore((s) => s.closePanel);

  useEffect(() => {
    closePanel();
  }, [location.pathname]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <RouterWatcher />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ThreadsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}