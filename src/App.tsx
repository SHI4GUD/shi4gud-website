import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

const HomePage = React.lazy(() => import('./pages/HomePage'));
const FaqPage = React.lazy(() => import('./pages/FaqPage'));
const HowToPage = React.lazy(() => import('./pages/HowToPage'));
const BurnBankPage = React.lazy(() => import('./pages/BurnBankPage'));
const ListingPage = React.lazy(() => import('./pages/ListingPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/how-to" element={<HowToPage />} />
          <Route path="/listing" element={<ListingPage />} />
          <Route path="/bank/:tokenId" element={<BurnBankPage />} />
          <Route path="/bank" element={<Navigate to="/bank/shi" replace />} />
          <Route path="/burn" element={<Navigate to="/bank/shi" state={{ tab: 'burns' }} replace />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;