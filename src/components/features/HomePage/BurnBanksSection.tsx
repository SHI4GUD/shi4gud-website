import React from 'react';
import { Link } from 'react-router-dom';
import {
  Gift,
  Heart,
  Layers,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { BURN_BANKS } from '../../../config/burnBanks';
import { useBurnData } from '../../../hooks/useBurnData';
import { useKtv2Data } from '../../../hooks/useKtv2Data';
import LoadingSpinner from '../../common/LoadingSpinner';
import { formatCompact, formatEth, formatUsd } from '../../../utils/formatters';

// Aggregated stats component
const AggregatedStats: React.FC = () => {
  // Fetch data for all banks
  const bankData = BURN_BANKS.map(token => {
    const { data: burnData, isLoading: burnLoading } = useBurnData(token, '7d');
    const { data: ktv2Data, isLoading: ktv2Loading } = useKtv2Data(token);
    return { token, burnData, ktv2Data, isLoading: burnLoading || ktv2Loading };
  });

  const isLoading = bankData.some(d => d.isLoading);
  
  // While loading, show skeleton cards in place of stats
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white/5 rounded-[20px] p-4 sm:p-6 border border-white/10 animate-pulse space-y-4"
          >
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-8 w-28 bg-white/20 rounded" />
            <div className="h-3 w-40 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Calculate totals and get ETH price once data is available
  const totals = bankData.reduce(
    (acc, { burnData, ktv2Data }) => {
      if (burnData?.stats) {
        acc.totalBurned += burnData.stats.totalBurned;
        acc.burned7d += burnData.stats.burned7d;
      }
      if (ktv2Data?.stats) {
        acc.totalDonated += ktv2Data.stats.totalGiven;
        acc.totalStaked += ktv2Data.stats.totalStaked;
        acc.totalBurnedViaBurnBank += ktv2Data.stats.totalBurnedViaKtv2;
        // Calculate USD values
        if (burnData?.priceUsd) {
          acc.totalStakedUsd += ktv2Data.stats.totalStaked * burnData.priceUsd;
          acc.totalBurnedViaBurnBankUsd += ktv2Data.stats.totalBurnedViaKtv2 * burnData.priceUsd;
        }
      }
      if (ktv2Data?.recentWinners) {
        acc.totalRewardsDistributed += ktv2Data.recentWinners.reduce((sum, w) => sum + w.reward, 0);
      }
      if (ktv2Data?.ethPriceUsd && !acc.ethPriceUsd) {
        acc.ethPriceUsd = ktv2Data.ethPriceUsd;
      }
      return acc;
    },
    {
      totalBurned: 0,
      burned7d: 0,
      totalDonated: 0,
      totalStaked: 0,
      totalStakedUsd: 0,
      totalBurnedViaBurnBank: 0,
      totalBurnedViaBurnBankUsd: 0,
      totalRewardsDistributed: 0,
      ethPriceUsd: null as number | null,
    }
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <LoadingSpinner />
        <p className="text-white/60 text-sm animate-pulse">
          Loading stats...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
      {/* Total Donated to Charity */}
      <div className="bg-white/5 rounded-[20px] p-5 sm:p-7 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-red-400" />
          <p className="text-white text-sm font-medium">Total Donated to Charity</p>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-red-400">
          {formatEth(totals.totalDonated)}
        </p>
        {totals.ethPriceUsd && (
          <p className="text-white text-sm">{formatUsd(totals.totalDonated * totals.ethPriceUsd)}</p>
        )}
        <p className="text-white/40 text-sm mt-1">Across all Burn Banks</p>
      </div>

      {/* Burned via Burn Banks */}
      <div className="bg-white/5 rounded-[20px] p-5 sm:p-7 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <p className="text-white text-sm font-medium">Total Tokens Burned</p>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-orange-400">
          {formatCompact(totals.totalBurnedViaBurnBank)}
        </p>
        {totals.totalBurnedViaBurnBankUsd > 0 && (
          <p className="text-white text-sm">{formatUsd(totals.totalBurnedViaBurnBankUsd)}</p>
        )}
        <p className="text-white/40 text-sm mt-1">Across all Burn Banks</p>
      </div>

      {/* Total Staked */}
      <div className="bg-white/5 rounded-[20px] p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <p className="text-white text-sm font-medium">Total Tokens Staked</p>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-purple-400">
          {formatCompact(totals.totalStaked)}
        </p>
        {totals.totalStakedUsd > 0 && (
          <p className="text-white text-sm">{formatUsd(totals.totalStakedUsd)}</p>
        )}
        <p className="text-white/40 text-sm mt-1">Across all Burn Banks</p>
      </div>

      {/* Rewards Distributed */}
      <div className="bg-white/5 rounded-[20px] p-5 sm:p-7 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-green-400" />
          <p className="text-white text-sm font-medium">Rewards Distributed</p>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-green-400">
          {formatEth(totals.totalRewardsDistributed)}
        </p>
        {totals.ethPriceUsd && (
          <p className="text-white text-sm">{formatUsd(totals.totalRewardsDistributed * totals.ethPriceUsd)}</p>
        )}
        <p className="text-white/40 text-sm mt-1">Across all Burn Banks</p>
      </div>
    </div>
  );
};

const BurnBanksSection: React.FC = () => {
  return (
    <section className="bg-white/[.02] py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-center font-bold mb-10 sm:mb-12 bg-gradient-to-r from-[#ff6b6b] to-[#ffd93d] bg-clip-text text-transparent text-[2rem] md:text-5xl leading-relaxed">
          Burn Bank Stats
        </h2>
        {/* Aggregated Stats */}
        <AggregatedStats />

        {/* Link to Burn Banks page */}
        <div className="text-center pt-2">
          <Link
            to="/bank"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[rgba(255,107,107,0.1)] to-[rgba(255,142,83,0.1)] border border-[rgba(255,107,107,0.3)] py-3 px-6 rounded-[30px] no-underline text-[#ff6b6b] font-semibold transition-all duration-300 ease-in-out hover:brightness-110 hover:-translate-y-1 cursor-pointer"
          >
            View Details
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BurnBanksSection;
