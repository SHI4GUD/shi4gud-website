import React from 'react';
import shi4gudCoin from '/assets/logos/shi4gud-coin.svg';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900 z-50">
      <div className="flex flex-col items-center">
        <img 
          src={shi4gudCoin} 
          alt="SHI4GUD Coin" 
          className="h-24 w-24 animate-spin"
        />
      </div>
    </div>
  );
};

export default LoadingSpinner; 