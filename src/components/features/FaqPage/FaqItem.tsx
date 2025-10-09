import React, { useState } from 'react';
import { PortableText, PortableTextMarkComponentProps } from '@portabletext/react';
import { ChevronDown } from 'lucide-react';
import { FaqItemData } from '../../../types/types';
import YouTubePlayer from '../../common/YouTubePlayer';

interface FaqItemProps {
  item: FaqItemData;
}

const FaqItem: React.FC<FaqItemProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { question, answer } = item;

  const components = {
    marks: {
      link: ({children, value}: PortableTextMarkComponentProps<{_type: 'link', href: string}>) => {
        const isExternal = value && value.href && !value.href.startsWith('/')
        const rel = isExternal ? 'noreferrer noopener' : undefined
        const target = isExternal ? '_blank' : undefined

        return (
          <a href={value?.href} rel={rel} target={target} className="text-[#ff6b6b] hover:underline">
            {children}
          </a>
        )
      },
    },
    list: {
      bullet: ({children}: any) => <ul className="list-disc space-y-3 my-5 pl-5 marker:text-[#ff6b6b]">{children}</ul>,
      number: ({children}: any) => <ol className="list-decimal space-y-3 my-5 pl-5 marker:text-[#ff6b6b]">{children}</ol>,
    },
    listItem: {
      bullet: ({children}: any) => <li className="text-white/90">{children}</li>,
      number: ({children}: any) => <li className="text-white/90">{children}</li>
    },
    types: {
      youtube: ({value}: any) => {
        if (!value?.url) return null;
        return <YouTubePlayer 
          url={value.url} 
          size={value.size || 'medium'} 
          alignment={value.alignment || 'center'} 
        />;
      },
    }
  }

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-5 text-left gap-4 text-lg sm:text-xl font-semibold tracking-wide text-white hover:text-[#ff6b6b] focus:outline-none cursor-pointer"
      >
        <span className="flex-grow">{question}</span>
        <ChevronDown 
          className={`transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          size={24} 
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        <div className="pt-2 pb-5 text-white/80 prose prose-invert max-w-none">
          <PortableText value={answer} components={components} />
        </div>
      </div>
    </div>
  );
};

export default FaqItem; 