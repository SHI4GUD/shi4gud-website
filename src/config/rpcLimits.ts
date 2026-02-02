export const RPC_GETLOGS_LIMITS = {
  RESTRICTED: 10,
  UNLIMITED: Infinity,
  STANDARD: 10_000,
} as const;

export const GETLOGS_CHUNK_SIZES = [10_000, 2_000, 500] as const;
export const GETLOGS_CHUNK_SIZE = GETLOGS_CHUNK_SIZES[0];
