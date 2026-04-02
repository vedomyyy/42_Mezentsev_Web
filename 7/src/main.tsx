import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';

// Предзагрузка данных до рендера приложения
import { useStore } from './store';

const { loadThreads, loadProfile } = useStore.getState();

Promise.all([loadThreads(), loadProfile()]).catch(() => {
  // Ошибки обрабатываются внутри стора — страницы покажут статус-тосты
});

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);