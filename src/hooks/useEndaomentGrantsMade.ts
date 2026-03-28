import { useQuery } from '@tanstack/react-query';
import { fetchApprovedGrantsForGudFund, type EndaomentGrantTransfer } from '../services/endaomentService';

export function useEndaomentGrantsMade() {
  return useQuery<EndaomentGrantTransfer[], Error>({
    queryKey: ['endaoment', 'gud-fund', 'approved-grants'],
    queryFn: fetchApprovedGrantsForGudFund,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

