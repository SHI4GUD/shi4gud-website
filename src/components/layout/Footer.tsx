import React from 'react';
import Socials from '../common/Socials';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-8 pb-4 text-center border-t border-white/10 opacity-70">
      <div className="max-w-[1200px] mx-auto px-5">
        <Socials />
        <div className="flex justify-center mb-4 mt-6">
          <img
            src="/assets/logos/shi4gud-white.svg"
            alt="SHI4GUD Logo"
            width={160}
            height="auto"
            className="opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
        <p className="mb-4">&copy; {currentYear} SHI4GUD. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;