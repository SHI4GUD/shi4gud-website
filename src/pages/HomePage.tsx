import React from 'react';
import { HomePageData } from '../types/types';
import { useSanityQuery } from '../hooks/useSanityQuery';
import Hero from '../components/features/HomePage/Hero';
import Stats from '../components/features/HomePage/Stats';
import Features from '../components/features/HomePage/Features';
import HowItWorks from '../components/features/HomePage/HowItWorks';
import CallToAction from '../components/features/HomePage/CallToAction';
import LoadingSpinner from '../components/common/LoadingSpinner';

const homepageQuery = `*[_type == "homepage"][0]`;

const HomePage: React.FC = () => {
  const { data: homepageData, isLoading, error } = useSanityQuery<HomePageData>(['homepage'], homepageQuery);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error loading page content.</div>;
  }
  
  if (!homepageData) {
    return <div>No content found for the homepage.</div>;
  }

  return (
    <div>
      <main>
        <Hero data={homepageData.hero} />
        <Stats data={homepageData.stats} />
        <Features data={homepageData.features} />
        <HowItWorks data={homepageData.howItWorks} />
        <CallToAction data={homepageData.callToAction} />
      </main>
    </div>
  );
};

export default HomePage;