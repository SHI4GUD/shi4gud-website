import React from 'react';
import { HowItWorksData } from '../../../types/types';

interface HowItWorksProps {
  data: HowItWorksData;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ data }) => {
  const { title, steps = [] } = data || {};

  return (
    <section className="bg-white/[.02] py-[60px] md:py-[100px]" id="how-it-works">
      <div className="max-w-[1200px] mx-auto px-5">
        <h2 className="text-center font-bold mb-[60px] bg-gradient-to-r from-[#ff6b6b] to-[#ffd93d] bg-clip-text text-transparent text-[2rem] md:text-5xl leading-relaxed">{title}</h2>
        <div className="flex flex-wrap justify-center gap-10 mt-[60px]">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative w-[250px]">
              <div className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] w-15 h-15 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-5">{index + 1}</div>
              <h3 className="text-[1.3rem] mb-3 text-[#ff6b6b]">{step.title}</h3>
              <p className="opacity-80">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 