export interface HeroData {
  title: string;
  subtitle: string;
  body?: string;
  ctaButtonText: string;
  ctaButtonText2: string;
  image: {
    asset: {
      _ref: string;
    };
  };
}

export interface Stat {
  type?: 'number' | 'date';
  value?: string;
  date?: string;
  label: string;
}

export interface StatsData {
  items: Stat[];
}

export interface Feature {
  title: string;
  description: string;
  emoji: string;
}

export interface FeaturesData {
  title: string;
  subtitle: string;
  featureList: Feature[];
}

export interface HowItWorksStep {
  title: string;
  description: string;
}

export interface HowItWorksData {
  title: string;
  steps: HowItWorksStep[];
}

export interface CallToActionData {
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface HomePageData {
  hero: HeroData;
  stats: StatsData;
  features: FeaturesData;
  howItWorks: HowItWorksData;
  callToAction: CallToActionData;
}

export interface FaqItemData {
  _key: string;
  question: string;
  answer: any[];
}

export interface FaqSectionData {
  _key: string;
  subtitle: string;
  faqItems: FaqItemData[];
}

export interface FaqPageData {
  title: string;
  faqSections: FaqSectionData[];
}

export interface ContentBox {
  _key: string;
  title?: string;
  text?: any[];
}

export interface HowToData {
  title?: string;
  subtitle?: string;
  contentBoxes?: ContentBox[];
} 