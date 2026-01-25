import { useQuery } from '@tanstack/react-query';
import { BurnBank, BurnDataPoint, BurnTransaction, BurnStats } from '../types/types';
import { fetchAllBurnData } from '../services/burnDataService';

export type TimeRange = '24h' | '7d' | '30d';

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
};

interface BurnDataResult {
  stats: BurnStats;
  chartData: BurnDataPoint[];
  transactions: BurnTransaction[];
  priceUsd: number | null;
}

export const useBurnData = (token: BurnBank, timeRange: TimeRange = '7d') => {
  const days = TIME_RANGE_DAYS[timeRange];

  return useQuery<BurnDataResult, Error>({
    queryKey: ['burnData', token.id, timeRange],
    queryFn: () => fetchAllBurnData(token, days),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useBurnedBalance = (token: BurnBank) => {
  return useQuery({
    queryKey: ['burnedBalance', token.id],
    queryFn: async () => {
      const { fetchBurnedBalance } = await import('../services/burnDataService');
      const { formatUnits } = await import('viem');
      const balance = await fetchBurnedBalance(token);
      return Number(formatUnits(balance, token.decimals));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
