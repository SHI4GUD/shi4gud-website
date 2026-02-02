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

// Listing Page Types
export interface ListingPageHero {
  title?: string;
  subtitle?: string;
}

export interface ListingPageWhatWeOfferItem {
  text?: string;
}

export interface ListingPageWhatWeOffer {
  title?: string;
  description?: string;
  items?: ListingPageWhatWeOfferItem[];
}

export interface ListingCriteriaItem {
  icon?: string;
  title?: string;
  description?: string;
}

export interface ListingPagePdfSection {
  title?: string;
  description?: string;
  buttonText?: string;
  pdfUrl?: string; // from GROQ projection pdfFile.asset->url
  pdfFile?: {
    asset?: {
      _ref?: string;
      url?: string;
    };
  };
}

export interface ListingPageListingCriteria {
  title?: string;
  introText?: string;
  criteriaItems?: ListingCriteriaItem[];
  supportedChainsLabel?: string;
  supportedChains?: string;
  pdfSection?: ListingPagePdfSection;
}

export interface FormFieldSelectOption {
  value?: string;
  label?: string;
}

export interface ListingPageFormField {
  name?: string;
  label?: string;
  placeholder?: string;
  inputType?: 'text' | 'email' | 'url' | 'select' | 'textarea';
  required?: boolean;
  selectOptions?: FormFieldSelectOption[];
  selectPlaceholder?: string;
  textareaRows?: number;
  fullWidth?: boolean;
}

export interface ListingPageFormSection {
  title?: string;
  introText?: string;
  successMessage?: string;
  errorMessagePrefix?: string;
  contactEmail?: string;
  formFields?: ListingPageFormField[];
  submitButtonText?: string;
  submittingButtonText?: string;
}

export interface ListingPageFooter {
  questionsText?: string;
  contactEmail?: string;
}

export interface ListingPageData {
  hero?: ListingPageHero;
  whatWeOffer?: ListingPageWhatWeOffer;
  listingCriteria?: ListingPageListingCriteria;
  formSection?: ListingPageFormSection;
  footer?: ListingPageFooter;
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
  holderCount?: number;
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
  uniqueStakerCount?: number;
}