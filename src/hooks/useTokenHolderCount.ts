import { useQuery } from '@tanstack/react-query';
import { BurnBank } from '../types/types';
import { fetchTokenHolderCount } from '../services/ethplorerService';

const HOLDER_COUNT_STALE_TIME = 60 * 60 * 1000;

export const useTokenHolderCount = (token: BurnBank | null) => {
  return useQuery<number | null>({
    queryKey: ['tokenHolderCount', token?.contractAddress],
    queryFn: () =>
      token ? fetchTokenHolderCount(token.contractAddress) : Promise.resolve(null),
    enabled: !!token?.contractAddress,
    staleTime: HOLDER_COUNT_STALE_TIME,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
