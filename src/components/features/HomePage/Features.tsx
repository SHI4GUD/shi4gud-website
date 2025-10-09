import React from 'react';
import { FeaturesData } from '../../../types/types';

interface FeaturesProps {
  data: FeaturesData;
}

const Features: React.FC<FeaturesProps> = ({ data }) => {
  const { title, subtitle, featureList = [] } = data || {};

  return (
    <section className="py-[60px]" id="features">
      <div className="max-w-[1200px] mx-auto px-5">
        <h2 className="text-center font-bold mb-5 bg-gradient-to-r from-[#ff6b6b] to-[#ffd93d] bg-clip-text text-transparent text-[2rem] md:text-5xl leading-relaxed">{title}</h2>
        {subtitle && <p className="text-center text-lg md:text-xl mb-[60px] opacity-80 max-w-3xl mx-auto">{subtitle}</p>}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10">
          {featureList.map((feature, index) => (
            <div key={index} className="bg-white/5 rounded-[20px] p-10 border border-white/10 transition-transform duration-300 ease-in-out hover:-translate-y-2.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
              <div className="text-5xl mb-5">{feature.emoji || '✨'}</div>
              <h3 className="text-2xl mb-4 text-[#ff6b6b]">{feature.title}</h3>
              <p className="opacity-80 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 