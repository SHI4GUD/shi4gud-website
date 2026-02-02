import { formatEther, formatUnits, parseAbiItem } from 'viem';
import { getViemClient } from '../config/rpcProvider';
import { BurnBank, TopStaker, TopDonor, Winner, Ktv2Stats, Ktv2Data } from '../types/types';
import { resolveEnsName } from './burnDataService';
import { GETLOGS_CHUNK_SIZES } from '../config/rpcLimits';

// Chainlink ETH/USD price feed
const WETH_USD_CHAINLINK_ADDRESS = '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419' as const;

// Ktv2 Contract Events
const STAKED_EVENT = parseAbiItem('event Staked(address indexed user, uint256 amount)');
const WITHDREW_EVENT = parseAbiItem('event Withdrew(address indexed user, uint256 amount)');
const GAVE_EVENT = parseAbiItem('event Gave(address indexed user, uint256 amount)');
const RWD_EVENT = parseAbiItem('event Rwd(address indexed user, uint256 amount)');

// Ktv2 Contract ABI (view functions only)
const KTV2_ABI = [
  {
    inputs: [],
    name: 'totalStk',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalGvn',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalBurned',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'epochInterval',
    outputs: [{ name: '', type: 'uint16' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'startBlock',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'dest',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Cache keys for localStorage
const CACHE_KEY_PREFIX = 'ktv2_cache_';
const STAKERS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const DONORS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const WINNERS_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ETH_PRICE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData<T> {
  data: T;
  timestamp: number;
  lastBlock: number;
}

const getCacheKey = (tokenId: string, type: string) => `${CACHE_KEY_PREFIX}${tokenId}_${type}`;

const getFromCache = <T>(tokenId: string, type: string, maxAge: number): CachedData<T> | null => {
  try {
    const cached = localStorage.getItem(getCacheKey(tokenId, type));
    if (!cached) return null;
    
    const parsed: CachedData<T> = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > maxAge) return null;
    
    return parsed;
  } catch {
    return null;
  }
};

const setCache = <T>(tokenId: string, type: string, data: T, lastBlock: number) => {
  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      lastBlock,
    };
    localStorage.setItem(getCacheKey(tokenId, type), JSON.stringify(cacheData));
  } catch {
    // localStorage might be full, ignore
  }
};

// Batch resolve ENS names for addresses
const resolveEnsNames = async (addresses: string[]): Promise<Map<string, string | null>> => {
  const results = new Map<string, string | null>();
  const uniqueAddresses = [...new Set(addresses.map(a => a.toLowerCase()))];
  
  // Resolve in parallel with small batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < uniqueAddresses.length; i += batchSize) {
    const batch = uniqueAddresses.slice(i, i + batchSize);
    const ensResults = await Promise.all(batch.map(addr => resolveEnsName(addr)));
    batch.forEach((addr, idx) => results.set(addr, ensResults[idx]));
  }
  
  return results;
};

// Fetch Ktv2 contract stats via view functions
export const fetchKtv2Stats = async (token: BurnBank): Promise<Ktv2Stats | null> => {
  if (!token.ktv2Address) return null;
  
  const client = getViemClient();
  
  try {
    const [totalStk, totalGvn, totalBurned, epochInterval, startBlock, dest] = await Promise.all([
      client.readContract({
        address: token.ktv2Address,
        abi: KTV2_ABI,
        functionName: 'totalStk',
      }),
      client.readContract({
        address: token.ktv2Address,
        abi: KTV2_ABI,
        functionName: 'totalGvn',
      }),
      client.readContract({
        address: token.ktv2Address,
        abi: KTV2_ABI,
        functionName: 'totalBurned',
      }),
      client.readContract({
        address: token.ktv2Address,
        abi: KTV2_ABI,
        functionName: 'epochInterval',
      }),
      client.readContract({
        address: token.ktv2Address,
        abi: KTV2_ABI,
        functionName: 'startBlock',
      }),
      client.readContract({
        address: token.ktv2Address,
        abi: KTV2_ABI,
        functionName: 'dest',
      }),
    ]);
    
    return {
      totalStaked: Number(formatUnits(totalStk, token.decimals)),
      totalGiven: Number(formatEther(totalGvn)),
      totalBurnedViaKtv2: Number(formatUnits(totalBurned, token.decimals)),
      epochInterval: Number(epochInterval),
      currentEpochStart: Number(startBlock),
      charityAddress: dest as `0x${string}`,
    };
  } catch (error) {
    console.error('Failed to fetch Ktv2 stats:', error);
    return null;
  }
};

export interface TopStakersResult {
  topStakers: TopStaker[];
  uniqueStakerCount: number;
}

type LogResult = { args: { user?: string; amount?: bigint }; blockNumber?: bigint };

/** Fetch getLogs in chunks with progressive fallback (10k→2k→500) */
const getLogsChunked = async (
  address: `0x${string}`,
  event: typeof STAKED_EVENT | typeof WITHDREW_EVENT,
  fromBlock: bigint,
  toBlock: bigint,
  chunkSizeIndex: number = 0
): Promise<LogResult[]> => {
  const client = getViemClient();
  const chunkSize = BigInt(GETLOGS_CHUNK_SIZES[chunkSizeIndex] ?? 500);
  const rangeBlocks = toBlock - fromBlock + 1n;

  if (rangeBlocks <= chunkSize) {
    try {
      return await client.getLogs({
        address,
        event,
        fromBlock,
        toBlock,
      }) as LogResult[];
    } catch {
      if (chunkSizeIndex < GETLOGS_CHUNK_SIZES.length - 1) {
        const mid = fromBlock + (toBlock - fromBlock) / 2n;
        const [a, b] = await Promise.all([
          getLogsChunked(address, event, fromBlock, mid, chunkSizeIndex + 1),
          getLogsChunked(address, event, mid + 1n, toBlock, chunkSizeIndex + 1),
        ]);
        return [...a, ...b];
      }
      throw new Error('getLogs failed after chunk retries');
    }
  }

  const allLogs: LogResult[] = [];
  let currentFrom = fromBlock;
  while (currentFrom <= toBlock) {
    const currentTo = currentFrom + chunkSize - 1n > toBlock ? toBlock : currentFrom + chunkSize - 1n;
    const chunkLogs = await getLogsChunked(address, event, currentFrom, currentTo, chunkSizeIndex);
    allLogs.push(...chunkLogs);
    currentFrom = currentTo + 1n;
  }
  return allLogs;
};

// Fetch and aggregate staker data from events (counts ALL unique stakers, returns top N)
export const fetchTopStakers = async (
  token: BurnBank,
  limit: number = 10
): Promise<TopStakersResult> => {
  const empty = { topStakers: [], uniqueStakerCount: 0 };
  if (!token.ktv2Address || !token.ktv2StartBlock) return empty;
  
  // Check cache first
  const cached = getFromCache<TopStakersResult>(token.id, 'stakers', STAKERS_CACHE_DURATION);
  if (cached && !Array.isArray(cached.data)) return cached.data;
  
  const client = getViemClient();
  const latestBlock = await client.getBlockNumber();
  const fromBlock = BigInt(token.ktv2StartBlock);
  
  let stakedLogs: LogResult[];
  let withdrewLogs: LogResult[];
  
  try {
    // Try full range first (Alchemy unlimited)
    [stakedLogs, withdrewLogs] = await Promise.all([
      client.getLogs({
        address: token.ktv2Address,
        event: STAKED_EVENT,
        fromBlock,
        toBlock: latestBlock,
      }) as Promise<LogResult[]>,
      client.getLogs({
        address: token.ktv2Address,
        event: WITHDREW_EVENT,
        fromBlock,
        toBlock: latestBlock,
      }) as Promise<LogResult[]>,
    ]);
  } catch {
    // Fallback: chunk with progressive sizes (10k→2k→500)
    try {
      [stakedLogs, withdrewLogs] = await Promise.all([
        getLogsChunked(token.ktv2Address, STAKED_EVENT, fromBlock, latestBlock, 0),
        getLogsChunked(token.ktv2Address, WITHDREW_EVENT, fromBlock, latestBlock, 0),
      ]);
    } catch (error) {
      console.error('Failed to fetch top stakers:', error);
      return empty;
    }
  }
  
  try {
    // Aggregate stakes by address
    const stakeTotals = new Map<string, { amount: bigint; count: number }>();
    
    for (const log of stakedLogs) {
      const address = (log.args.user as string).toLowerCase();
      const amount = log.args.amount as bigint;
      const current = stakeTotals.get(address) || { amount: 0n, count: 0 };
      stakeTotals.set(address, {
        amount: current.amount + amount,
        count: current.count + 1,
      });
    }
    
    // Subtract withdrawals
    for (const log of withdrewLogs) {
      const address = (log.args.user as string).toLowerCase();
      const amount = log.args.amount as bigint;
      const current = stakeTotals.get(address);
      if (current) {
        stakeTotals.set(address, {
          amount: current.amount - amount,
          count: current.count,
        });
      }
    }
    
    // Filter to active stakers (positive balance) - this is ALL unique stakers
    const activeStakers = [...stakeTotals.entries()]
      .filter(([, data]) => data.amount > 0n)
      .sort((a, b) => (b[1].amount > a[1].amount ? 1 : -1));
    
    const uniqueStakerCount = activeStakers.length;
    const topStakersSlice = activeStakers.slice(0, limit);
    
    // Resolve ENS names for top stakers only
    const addresses = topStakersSlice.map(([addr]) => addr);
    const ensNames = await resolveEnsNames(addresses);
    
    const topStakers: TopStaker[] = topStakersSlice.map(([address, data], index) => ({
      rank: index + 1,
      address,
      ensName: ensNames.get(address) || undefined,
      stakedAmount: Number(formatUnits(data.amount, token.decimals)),
      stakeCount: data.count,
    }));
    
    const result: TopStakersResult = { topStakers, uniqueStakerCount };
    setCache(token.id, 'stakers', result, Number(latestBlock));
    
    return result;
  } catch (error) {
    console.error('Failed to fetch top stakers:', error);
    return empty;
  }
};

// Fetch and aggregate donor data from Gave events
export const fetchTopDonors = async (
  token: BurnBank,
  limit: number = 10
): Promise<TopDonor[]> => {
  if (!token.ktv2Address || !token.ktv2StartBlock) return [];
  
  // Check cache first
  const cached = getFromCache<TopDonor[]>(token.id, 'donors', DONORS_CACHE_DURATION);
  if (cached) return cached.data;
  
  const client = getViemClient();
  const latestBlock = await client.getBlockNumber();
  
  try {
    const gaveLogs = await client.getLogs({
      address: token.ktv2Address,
      event: GAVE_EVENT,
      fromBlock: BigInt(token.ktv2StartBlock),
      toBlock: latestBlock,
    });
    
    // Aggregate donations by address
    const donorTotals = new Map<string, { amount: bigint; count: number }>();
    
    for (const log of gaveLogs) {
      const address = (log.args.user as string).toLowerCase();
      const amount = log.args.amount as bigint;
      const current = donorTotals.get(address) || { amount: 0n, count: 0 };
      donorTotals.set(address, {
        amount: current.amount + amount,
        count: current.count + 1,
      });
    }
    
    // Sort by total given and limit
    const sortedDonors = [...donorTotals.entries()]
      .sort((a, b) => (b[1].amount > a[1].amount ? 1 : -1))
      .slice(0, limit);
    
    // Resolve ENS names for top donors
    const addresses = sortedDonors.map(([addr]) => addr);
    const ensNames = await resolveEnsNames(addresses);
    
    const topDonors: TopDonor[] = sortedDonors.map(([address, data], index) => ({
      rank: index + 1,
      address,
      ensName: ensNames.get(address) || undefined,
      totalGiven: Number(formatEther(data.amount)),
      donationCount: data.count,
    }));
    
    // Cache the results
    setCache(token.id, 'donors', topDonors, Number(latestBlock));
    
    return topDonors;
  } catch (error) {
    console.error('Failed to fetch top donors:', error);
    return [];
  }
};

// Fetch recent winners from Rwd events
export const fetchRecentWinners = async (
  token: BurnBank,
  limit: number = 10
): Promise<Winner[]> => {
  if (!token.ktv2Address || !token.ktv2StartBlock) return [];
  
  // Check cache first (long cache for winners since they only change weekly)
  const cached = getFromCache<Winner[]>(token.id, 'winners', WINNERS_CACHE_DURATION);
  if (cached) return cached.data;
  
  const client = getViemClient();
  const latestBlock = await client.getBlockNumber();
  
  try {
    const rwdLogs = await client.getLogs({
      address: token.ktv2Address,
      event: RWD_EVENT,
      fromBlock: BigInt(token.ktv2StartBlock),
      toBlock: latestBlock,
    });
    
    // Sort by block number (most recent first) and limit
    const sortedLogs = rwdLogs
      .sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))
      .slice(0, limit);
    
    if (sortedLogs.length === 0) return [];
    
    // Fetch block timestamps for dates
    const uniqueBlocks = [...new Set(sortedLogs.map(log => log.blockNumber!))];
    const blockResults = await Promise.all(
      uniqueBlocks.map(blockNum => client.getBlock({ blockNumber: blockNum }).catch(() => null))
    );
    
    const blockTimestamps = new Map<bigint, number>();
    uniqueBlocks.forEach((blockNum, i) => {
      if (blockResults[i]) {
        blockTimestamps.set(blockNum, Number(blockResults[i]!.timestamp) * 1000);
      }
    });
    
    // Resolve ENS names
    const addresses = sortedLogs.map(log => (log.args.user as string).toLowerCase());
    const ensNames = await resolveEnsNames(addresses);
    
    const winners: Winner[] = sortedLogs.map(log => {
      const address = (log.args.user as string).toLowerCase();
      const timestamp = blockTimestamps.get(log.blockNumber!);
      
      return {
        address,
        ensName: ensNames.get(address) || undefined,
        reward: Number(formatEther(log.args.amount as bigint)),
        blockNumber: Number(log.blockNumber),
        txHash: log.transactionHash!,
        date: timestamp
          ? new Date(timestamp).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : undefined,
      };
    });
    
    // Cache the results
    setCache(token.id, 'winners', winners, Number(latestBlock));
    
    return winners;
  } catch (error) {
    console.error('Failed to fetch recent winners:', error);
    return [];
  }
};

// Fetch current ETH balance of Ktv2 contract (rewards pool)
export const fetchKtv2EthBalance = async (token: BurnBank): Promise<number> => {
  if (!token.ktv2Address) return 0;
  const client = getViemClient();
  try {
    const balance = await client.getBalance({ address: token.ktv2Address });
    return Number(formatEther(balance));
  } catch {
    return 0;
  }
};

// Fetch ETH price in USD from Chainlink
export const fetchEthPriceUsd = async (): Promise<number | null> => {
  // Check cache first (shared across all tokens)
  const cached = getFromCache<number>('global', 'ethPrice', ETH_PRICE_CACHE_DURATION);
  if (cached) return cached.data;
  
  const client = getViemClient();
  
  try {
    const ethUsdPrice = await client.readContract({
      address: WETH_USD_CHAINLINK_ADDRESS,
      abi: [{
        inputs: [],
        name: 'latestAnswer',
        outputs: [{ name: '', type: 'int256' }],
        stateMutability: 'view',
        type: 'function',
      }],
      functionName: 'latestAnswer',
    });
    
    const price = Number(ethUsdPrice) / 1e8;
    setCache('global', 'ethPrice', price, 0);
    return price;
  } catch {
    return null;
  }
};

// Fetch all Ktv2 data in parallel (optimized)
export const fetchAllKtv2Data = async (token: BurnBank): Promise<Ktv2Data | null> => {
  if (!token.ktv2Address) return null;
  
  const client = getViemClient();
  const latestBlock = await client.getBlockNumber();
  const currentBlock = Number(latestBlock);
  
  // Check if we have cached stats
  const cachedStats = getFromCache<Ktv2Stats>(token.id, 'stats', STATS_CACHE_DURATION);
  
  // Fetch all data in parallel (including ETH price and contract balance)
  const [stats, stakersResult, topDonors, recentWinners, ethPriceUsd, currentRewardsEth] = await Promise.all([
    cachedStats ? Promise.resolve(cachedStats.data) : fetchKtv2Stats(token),
    fetchTopStakers(token),
    fetchTopDonors(token),
    fetchRecentWinners(token),
    fetchEthPriceUsd(),
    fetchKtv2EthBalance(token),
  ]);
  
  if (!stats) return null;
  
  // Cache stats if freshly fetched
  if (!cachedStats) {
    setCache(token.id, 'stats', stats, currentBlock);
  }
  
  return {
    stats,
    topStakers: stakersResult.topStakers,
    topDonors,
    recentWinners,
    ethPriceUsd,
    currentBlock,
    currentRewardsEth,
    uniqueStakerCount: stakersResult.uniqueStakerCount,
  };
};

// Clear cache for a specific token (useful for manual refresh)
export const clearKtv2Cache = (tokenId: string) => {
  ['stakers', 'donors', 'winners', 'stats'].forEach(type => {
    localStorage.removeItem(getCacheKey(tokenId, type));
  });
};
