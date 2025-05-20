import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext';
import { UserProfileProvider } from './context/UserProfileContext';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <UserProfileProvider>
        <App />
      </UserProfileProvider>
    </AppProvider>
  </StrictMode>
);