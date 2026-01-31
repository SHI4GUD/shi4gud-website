import { useQuery } from '@tanstack/react-query';
import { BurnBank, Ktv2Data } from '../types/types';
import { 
  fetchAllKtv2Data, 
  fetchTopStakers, 
  fetchTopDonors, 
  fetchRecentWinners,
} from '../services/ktv2Service';

// Stale times for React Query (complement localStorage cache)
const STAKERS_STALE_TIME = 30 * 60 * 1000; // 30 minutes
const DONORS_STALE_TIME = 30 * 60 * 1000; // 30 minutes
const WINNERS_STALE_TIME = 60 * 60 * 1000; // 1 hour (localStorage caches 24h)

// Hook to fetch all Ktv2 data at once
export const useKtv2Data = (token: BurnBank | null) => {
  return useQuery<Ktv2Data | null>({
    queryKey: ['ktv2Data', token?.id],
    queryFn: () => (token ? fetchAllKtv2Data(token) : Promise.resolve(null)),
    enabled: !!token?.ktv2Address,
    staleTime: STAKERS_STALE_TIME,
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false,
  });
};

// Individual hooks for granular control
export const useTopStakers = (token: BurnBank | null, limit: number = 10) => {
  return useQuery({
    queryKey: ['topStakers', token?.id, limit],
    queryFn: () => (token ? fetchTopStakers(token, limit) : Promise.resolve([])),
    enabled: !!token?.ktv2Address,
    staleTime: STAKERS_STALE_TIME,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useTopDonors = (token: BurnBank | null, limit: number = 10) => {
  return useQuery({
    queryKey: ['topDonors', token?.id, limit],
    queryFn: () => (token ? fetchTopDonors(token, limit) : Promise.resolve([])),
    enabled: !!token?.ktv2Address,
    staleTime: DONORS_STALE_TIME,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useRecentWinners = (token: BurnBank | null, limit: number = 10) => {
  return useQuery({
    queryKey: ['recentWinners', token?.id, limit],
    queryFn: () => (token ? fetchRecentWinners(token, limit) : Promise.resolve([])),
    enabled: !!token?.ktv2Address,
    staleTime: WINNERS_STALE_TIME,
    gcTime: 24 * 60 * 60 * 1000, // Keep winners in cache for 24h
    refetchOnWindowFocus: false,
  });
};
