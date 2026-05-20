import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import idID from 'antd/locale/id_ID';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';
import TourProvider from './features/tour/TourProvider';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import PWAInstallPrompt from './components/PWAInstallPrompt';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

const theme = {
  token: {
    colorPrimary: '#FF7070',
    fontFamily: 'Sen, Inter, system-ui, sans-serif',
    borderRadius: 8,
  },
};

function AppPrompts() {
  const location = useLocation();
  const hidePrompts = location.pathname.startsWith('/user-guide');

  if (hidePrompts) return null;

  return (
    <>
      <PWAUpdatePrompt />
      <PWAInstallPrompt />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={theme} locale={idID}>
          <AntApp>
            <BrowserRouter>
              <TourProvider>
                <AppRoutes />
              </TourProvider>
              <AppPrompts />
            </BrowserRouter>
          </AntApp>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
