import React from 'react';
import { CallToActionData } from '../../../types/types';

interface CallToActionProps {
  data: CallToActionData;
}

const CallToAction: React.FC<CallToActionProps> = ({ data }) => {
  const { title = "Ready to Make an Impact?", subtitle = "Join the Shina Inu community...", buttonText = "Launch App" } = data || {};
  const launchAppUrl = import.meta.env.VITE_APP_LAUNCH_URL || "https://app.shi4gud.com";

  return (
    <section className="text-center py-[60px] md:py-[100px]">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="bg-gradient-to-r from-[rgba(255,107,107,0.1)] to-[rgba(255,142,83,0.1)] border border-[rgba(255,107,107,0.3)] rounded-[30px] p-[25px] sm:p-[60px]">
          <h2 className="text-4xl mb-5 text-[#ff6b6b]">{title}</h2>
          <p className="text-[1.2rem] mb-10 opacity-90">{subtitle}</p>
          <a href={launchAppUrl} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] py-4 px-8 rounded-[30px] no-underline text-white font-semibold text-lg transition-all duration-300 ease-in-out border-none cursor-pointer hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(255,107,107,0.4)]">{buttonText}</a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 