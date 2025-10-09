import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import shi4gudLogo from '/assets/logos/shi4gud-white.svg';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="m-2 text-center bg-zinc-800/60 rounded-xl border border-zinc-700 p-8 max-w-md w-full">
        <div className="mb-6">
            <ShieldAlert className="text-pink-500 h-16 w-16 mx-auto" />
            <h1 className="text-3xl font-bold text-white mt-4">404 - Page Not Found</h1>
        </div>
        <p className="text-gray-300 mb-6">
          Oops! The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <div className="mb-6 flex justify-center">
          <img src={shi4gudLogo} alt="Shi4Gud Logo" className="h-12 w-auto" />
        </div>
        <Link
          to="/"
          className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors font-semibold"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 