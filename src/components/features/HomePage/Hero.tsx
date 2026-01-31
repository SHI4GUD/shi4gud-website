import React, { useEffect, useState } from 'react';
import { HeroData } from '../../../types/types';
import shiBurnBankWebm from '/assets/tokens/shi/shi_burn_bank.webm';
import shiBurnBankGif from '/assets/tokens/shi/shi_burn_bank.gif';

interface HeroProps {
  data: HeroData;
}

const Hero: React.FC<HeroProps> = ({ data }) => {
  // Provide default values to prevent errors if data is not yet loaded
  const { 
    title = "Charity Burn Mechanism", 
    subtitle = "Donate. Create Impact.", 
    /* body = "Join Shina Inu's revolutionary platform that combines charity with community. Donate to worthy causes, and earn rewards while making a difference.", */
    ctaButtonText = "Start Donating Now", 
    ctaButtonText2 = "Learn About CBM", 
  } = data || {};

  const launchAppUrl = import.meta.env.VITE_APP_LAUNCH_URL || "https://app.shi4gud.com";

  // Prefer GIF by default; use WebM only when not on iOS/Safari
  const [useWebm, setUseWebm] = useState(false);

  useEffect(() => {
    try {
      const userAgent = navigator.userAgent || "";
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (userAgent.includes("Mac") && "ontouchend" in document);
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      setUseWebm(!(isIOS || isSafari));
    } catch (_err) {
      setUseWebm(false);
    }
  }, []);

  const renderTitleLines = (value?: string) => {
    if (!value) return null;
    const normalized = value
      .replace(/\[br\]/gi, "\n")
      .replace(/\\n/g, "\n");
    const lines = normalized.split("\n");
    return lines.map((line, idx) => (
      <span key={idx} className="block">{line}</span>
    ));
  };

  return (
    <section className="hero relative sm:pt-10 pt-8 pb-16 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-5 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:justify-center gap-8 lg:gap-12 mb-12">
          <div className="flex-shrink-0">
            {useWebm ? (
              <video autoPlay loop muted playsInline poster={shiBurnBankGif} className="w-auto h-50 md:h-70 lg:h-52 xl:h-56 pointer-events-none mix-blend-screen">
                <source src={shiBurnBankWebm} type="video/webm" />
              </video>
            ) : (
              <img src={shiBurnBankGif} alt="SHI Burn Bank" className="w-auto h-50 md:h-70 lg:h-52 xl:h-56 pointer-events-none mix-blend-screen" />
            )}
          </div>
          <div className="flex flex-col justify-center text-center">
            <h1 className="text-[clamp(2rem,6vw,5rem)] lg:text-[clamp(1.75rem,4vw,3.25rem)] font-extrabold mb-3 bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent leading-tight">{renderTitleLines(title)}</h1>
            <p className="text-xl md:text-2xl lg:text-xl opacity-90">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-5 justify-center flex-wrap flex-col md:flex-row items-center">
          <a href={launchAppUrl} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] py-4 px-8 rounded-[30px] no-underline text-white font-semibold text-lg transition-all duration-300 ease-in-out border-none cursor-pointer hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(255,107,107,0.4)]">{ctaButtonText}</a>
          <a href="/faq" className="bg-white/10 py-4 px-8 rounded-[30px] no-underline text-white font-semibold text-lg transition-all duration-300 ease-in-out border-2 border-white/20 hover:bg-white/20 hover:-translate-y-1">{ctaButtonText2}</a>
        </div>
      </div>
      <div className="floating-element floating-1">🔥</div>
      <div className="floating-element floating-2">💎</div>
      <div className="floating-element floating-3">⚡</div>
      <div className="floating-element floating-4">💰</div>
      <div className="floating-element floating-5">❤️</div>
    </section>
  );
};

export default Hero; 