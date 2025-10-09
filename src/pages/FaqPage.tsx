import React from 'react';
import { FaqPageData } from '../types/types';
import { useSanityQuery } from '../hooks/useSanityQuery';
import FaqItem from '../components/features/FaqPage/FaqItem';
import LoadingSpinner from '../components/common/LoadingSpinner';

const faqQuery = `*[_type == "faq"][0]{
  title,
  faqSections[]{
    _key,
    subtitle,
    faqItems[]{
      _key,
      question,
      answer
    }
  }
}`;

const FaqPage: React.FC = () => {
  const { data, isLoading, error } = useSanityQuery<FaqPageData>(['faq'], faqQuery);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading content. Please try again later.</div>;
  if (!data) return <div>No FAQ content found.</div>;

  return (
    <div className="py-[60px] md:py-[100px]">
      <div className="max-w-[1000px] mx-auto px-5">
        <h1 className="text-center font-extrabold mb-12 bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent text-[3rem] md:text-6xl leading-tight">
          {data.title || 'Frequently Asked Questions'}
        </h1>
        <div className="bg-white/5 rounded-[20px] p-5 md:p-10 border border-white/10">
          {data.faqSections?.map((section) => (
            <div key={section._key} className="[&:not(:last-child)]:mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] via-[#98FB98] to-[#90EE90] bg-clip-text text-transparent">
                {section.subtitle}
              </h2>
              {section.faqItems?.map((item) => (
                <FaqItem key={item._key} item={item} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;