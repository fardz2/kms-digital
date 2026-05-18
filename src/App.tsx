import React from 'react';
import { BrowserRouter } from 'react-router-dom';
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
              <PWAUpdatePrompt />
              <PWAInstallPrompt />
            </BrowserRouter>
          </AntApp>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
