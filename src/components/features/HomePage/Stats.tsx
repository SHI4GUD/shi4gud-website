import React, { useEffect, useRef } from 'react';
import { StatsData } from '../../../types/types';

interface StatsProps {
  data: StatsData;
}

// Format number with K, M, B, T suffixes
const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'T';
  } else if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'B';
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'K';
  }
  return num.toLocaleString();
};

const Stats: React.FC<StatsProps> = ({ data }) => {
    const statsRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const animateValue = (element: HTMLElement, start: number, end: number, duration: number, prefix: string = '', suffix: string = '') => {
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const value = progress * (end - start) + start;
          element.innerHTML = prefix + formatNumber(Math.floor(value)) + suffix;
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
      };
  
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && statsRef.current) {
            const statItems = statsRef.current.querySelectorAll('.stat-value:not(.stat-date)');
            statItems.forEach((item) => {
              const element = item as HTMLElement;
              const endValue = parseInt(element.getAttribute('data-end-value') || '0', 10);
              const prefix = element.getAttribute('data-prefix') || '';
              const suffix = element.getAttribute('data-suffix') || '';
              if(element.getAttribute('data-end-value')?.includes('.')) {
                // special handling for floats if any
              } else {
                animateValue(element, 0, endValue, 2000, prefix, suffix);
              }
            });
            observer.unobserve(entry.target);
          }
        });
      });
  
      if (data && data.items && statsRef.current) {
        observer.observe(statsRef.current);
      }
  
      return () => {
        if (statsRef.current) {
          observer.unobserve(statsRef.current);
        }
      };
    }, [data]);
  
    // Default to an empty array to prevent map function from breaking
    const statItems = data?.items || [];

    return (
      <section className="max-w-[1200px] mx-auto px-5">
        <div className="bg-white/5 rounded-[20px] my-[60px] border border-white/10 px-5 py-[30px] md:p-10" id="stats" ref={statsRef}>
          <div className="flex flex-wrap justify-center gap-10 text-center">
            {statItems.map((item, index) => {
              const isDate = item.type === 'date' || (item.date && !item.value);
              const displayValue = isDate && item.date 
                ? (() => {
                    // Convert from YYYY-MM-DD (Sanity format) to MM/DD/YYYY
                    const [year, month, day] = item.date.split('-');
                    return `${month}/${day}/${year}`;
                  })()
                : item.value || '0';
              
              return (
                <div className="w-[200px]" key={index}>
                  {isDate ? (
                    <h3 className="stat-value stat-date text-4xl font-bold text-[#ff6b6b] mb-2">
                      {displayValue}
                    </h3>
                  ) : (
                    <h3 
                      className="stat-value text-4xl font-bold text-[#ff6b6b] mb-2" 
                      data-end-value={parseInt((item.value || '0').replace(/[^0-9]/g, '')) || 0} 
                      data-prefix={(item.value || '').startsWith('$') ? '$' : ''} 
                      data-suffix={(item.value || '').endsWith('%') ? '%' : ''}
                    >
                      0
                    </h3>
                  )}
                  <p className="opacity-80 text-lg">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };
  
  export default Stats; 