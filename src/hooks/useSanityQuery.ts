import { useQuery } from '@tanstack/react-query';
import { sanityClient } from '../sanityClient';

/**
 * A custom hook to fetch data from Sanity using TanStack Query.
 * @param queryKey The key for the query, used for caching.
 * @param query The Sanity GROQ query string.
 * @returns The result object from `useQuery`, containing `data`, `isLoading`, `error`, etc.
 */
export function useSanityQuery<T>(queryKey: string[], query: string) {
  return useQuery<T>({
    queryKey,
    queryFn: () => sanityClient.fetch(query),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
} 