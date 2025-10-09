import React from 'react';
import { PortableText, PortableTextMarkComponentProps } from '@portabletext/react';
import { HowToData } from '../types/types';
import { useSanityQuery } from '../hooks/useSanityQuery';
import LoadingSpinner from '../components/common/LoadingSpinner';
import YouTubePlayer from '../components/common/YouTubePlayer';

const howToQuery = `*[_type == "howTo"][0]`;

const portableTextComponents = {
  types: {
    youtube: ({ value }: { value: { url: string } }) => {
      if (!value.url) return null;
      return <YouTubePlayer url={value.url} />;
    },
  },
  marks: {
    link: ({ children, value }: PortableTextMarkComponentProps<{ _type: 'link'; href: string }>) => {
      const isExternal = value && value.href && !value.href.startsWith('/');
      const rel = isExternal ? 'noreferrer noopener' : undefined;
      const target = isExternal ? '_blank' : undefined;
      return (
        <a href={value?.href} rel={rel} target={target} className="text-[#ff6b6b] hover:underline">
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc space-y-3 my-5 pl-5 marker:text-[#ff6b6b]">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal space-y-3 my-5 pl-5 marker:text-[#ff6b6b]">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li className="text-white/90">{children}</li>,
    number: ({ children }: any) => <li className="text-white/90">{children}</li>
  }
};

const HowToPage: React.FC = () => {
  const { data, isLoading, error } = useSanityQuery<HowToData>(['howTo'], howToQuery);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading content. Please try again later.</div>;
  if (!data) return <div>No content found for this page.</div>;

  const { title = "How It Works", subtitle, contentBoxes = [] } = data;

  return (
    <section className="py-[60px] md:py-[100px]">
      <div className="max-w-[1200px] mx-auto px-5">
        <h1 className="text-center font-extrabold mb-5 bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent text-[3rem] md:text-6xl leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-center text-lg md:text-xl mb-[60px] opacity-80 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10">
          {contentBoxes.map((box) => (
            <div key={box._key} className="bg-white/5 rounded-[20px] py-2 px-4 md:py-4 md:px-6 border border-white/10 transition-transform duration-300 ease-in-out hover:-translate-y-2.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
              <h3 className="text-2xl mb-4 text-[#ff6b6b]">{box.title}</h3>
              <div className="text-white/80 prose prose-invert max-w-none">
                {box.text && <PortableText value={box.text} components={portableTextComponents} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToPage; 