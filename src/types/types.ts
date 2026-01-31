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
}export interface HeroData {
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

// Burn Tracker Types
export interface BurnBank {
  id: string;
  name: string;
  symbol: string;
  contractAddress: `0x${string}`;
  burnAddresses: `0x${string}`[];
  logo?: string;
  decimals: number;
  totalSupply: number;
  chainId: number;
  ktv2Address?: `0x${string}`;
  ktv2StartBlock?: number;
}

export interface BurnDataPoint {
  date: string;
  totalBurned: number;
}

export interface BurnTransaction {
  txHash: string;
  date: string;
  amount: number;
  from?: string;
  fromEns?: string;
}

export interface BurnStats {
  totalBurned: number;
  totalSupply: number;
  burnedToday: number;
  burned7d: number;
  burnRateChange?: number; // percentage change
}

// Ktv2 Leaderboard Types
export interface TopStaker {
  rank: number;
  address: string;
  ensName?: string;
  stakedAmount: number;
  stakeCount: number;
}

export interface TopDonor {
  rank: number;
  address: string;
  ensName?: string;
  totalGiven: number; // in ETH
  donationCount: number;
}

export interface Winner {
  address: string;
  ensName?: string;
  reward: number; // in ETH
  blockNumber: number;
  txHash: string;
  date?: string;
}

export interface Ktv2Stats {
  totalStaked: number;
  totalGiven: number;
  totalBurnedViaKtv2: number;
  epochInterval: number;
  currentEpochStart: number;
  charityAddress?: `0x${string}`;
}

export interface Ktv2Data {
  stats: Ktv2Stats;
  topStakers: TopStaker[];
  topDonors: TopDonor[];
  recentWinners: Winner[];
  ethPriceUsd: number | null;
  currentBlock?: number;
  currentRewardsEth?: number;
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

// Burn Tracker Types
export interface BurnBank {
  id: string;
  name: string;
  symbol: string;
  contractAddress: `0x${string}`;
  burnAddresses: `0x${string}`[];
  logo?: string;
  decimals: number;
  totalSupply: number;
  chainId: number;
}

export interface BurnDataPoint {
  date: string;
  totalBurned: number;
}

export interface BurnTransaction {
  txHash: string;
  date: string;
  amount: number;
  from?: string;
  fromEns?: string;
}

export interface BurnStats {
  totalBurned: number;
  totalSupply: number;
  burnedToday: number;
  burned7d: number;
  burnRateChange?: number; // percentage change
}