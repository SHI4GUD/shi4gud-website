import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { globalToastOptions } from './config/toastConfig';
import ErrorBoundary from './components/common/ErrorBoundary';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster 
              position="bottom-center" 
              reverseOrder={false}
              toastOptions={globalToastOptions}
            /> 
          </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);