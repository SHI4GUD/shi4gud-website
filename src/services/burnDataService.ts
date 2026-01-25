import { formatUnits, parseAbiItem } from 'viem';
import { getViemClient } from '../config/rpcProvider';
import { BurnBank, BurnDataPoint, BurnTransaction, BurnStats } from '../types/types';
import { 
  PRICE_ORACLE_ADDRESS, 
  WETH_USD_CHAINLINK_ADDRESS, 
  getPoolAddress,
  ENABLE_TRANSACTION_FETCHING,
  ENABLE_PRICE_FETCHING,
} from '../config/burnBanks';

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const TRANSFER_EVENT = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)'
);

const ensCache = new Map<string, string | null>();
const REQUEST_DELAY = 50;
const BLOCKS_PER_DAY = 7200n;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const resolveEnsName = async (address: string): Promise<string | null> => {
  const lowerAddress = address.toLowerCase();
  
  if (ensCache.has(lowerAddress)) {
    return ensCache.get(lowerAddress) || null;
  }
  
  const client = getViemClient();
  
  try {
    await delay(REQUEST_DELAY);
    const ensName = await client.getEnsName({ address: address as `0x${string}` });
    ensCache.set(lowerAddress, ensName);
    return ensName;
  } catch {
    ensCache.set(lowerAddress, null);
    return null;
  }
};

const resolveEnsNames = async (addresses: string[]): Promise<Map<string, string | null>> => {
  const results = new Map<string, string | null>();
  const uniqueAddresses = [...new Set(addresses.map(a => a.toLowerCase()))];
  
  for (const address of uniqueAddresses) {
    const ens = await resolveEnsName(address);
    results.set(address, ens);
  }
  
  return results;
};

export const fetchBurnedBalance = async (token: BurnBank): Promise<bigint> => {
  const client = getViemClient();

  try {
    const balances = await Promise.all(
      token.burnAddresses.map((address) =>
        client.readContract({
          address: token.contractAddress,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address],
        })
      )
    );
    return balances.reduce((total, balance) => total + balance, 0n);
  } catch {
    throw new Error('Failed to fetch burned balance');
  }
};

const fetchBurnLogs = async (
  token: BurnBank,
  days: number
): Promise<Array<{ blockNumber: bigint; value: bigint; from: string; txHash: string }>> => {
  const client = getViemClient();
  const latestBlock = await client.getBlockNumber();
  
  const totalBlocks = BLOCKS_PER_DAY * BigInt(days);
  const fromBlock = latestBlock - totalBlocks > 0n ? latestBlock - totalBlocks : 0n;
  
  const allLogs: Array<{ blockNumber: bigint; value: bigint; from: string; txHash: string }> = [];
  
  for (const burnAddress of token.burnAddresses) {
    try {
      const logs = await client.getLogs({
        address: token.contractAddress,
        event: TRANSFER_EVENT,
        args: { to: burnAddress },
        fromBlock,
        toBlock: latestBlock,
      });
      
      for (const log of logs) {
        allLogs.push({
          blockNumber: log.blockNumber!,
          value: log.args.value!,
          from: log.args.from!,
          txHash: log.transactionHash!,
        });
      }
    } catch {
      return fetchBurnLogsChunked(token, latestBlock, fromBlock);
    }
  }
  
  return allLogs;
};

const fetchBurnLogsChunked = async (
  token: BurnBank,
  latestBlock: bigint,
  fromBlock: bigint
): Promise<Array<{ blockNumber: bigint; value: bigint; from: string; txHash: string }>> => {
  const client = getViemClient();
  const chunkSize = 500n;
  const allLogs: Array<{ blockNumber: bigint; value: bigint; from: string; txHash: string }> = [];
  let currentFrom = fromBlock;
  
  while (currentFrom < latestBlock) {
    const currentTo = currentFrom + chunkSize > latestBlock ? latestBlock : currentFrom + chunkSize;
    
    for (const burnAddress of token.burnAddresses) {
      try {
        await delay(REQUEST_DELAY);
        
        const logs = await client.getLogs({
          address: token.contractAddress,
          event: TRANSFER_EVENT,
          args: { to: burnAddress },
          fromBlock: currentFrom,
          toBlock: currentTo,
        });
        
        for (const log of logs) {
          allLogs.push({
            blockNumber: log.blockNumber!,
            value: log.args.value!,
            from: log.args.from!,
            txHash: log.transactionHash!,
          });
        }
      } catch {
        // Skip failed chunk
      }
    }
    
    currentFrom = currentTo + 1n;
  }
  
  return allLogs;
};

const aggregateBurnsByDay = (
  logs: Array<{ blockNumber: bigint; value: bigint }>,
  latestBlock: bigint,
  decimals: number,
  days: number
): Map<string, number> => {
  const burnsByDay = new Map<string, number>();
  const now = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    burnsByDay.set(dateKey, 0);
  }
  
  for (const log of logs) {
    const blocksAgo = latestBlock - log.blockNumber;
    const daysAgo = Number(blocksAgo / BLOCKS_PER_DAY);
    
    if (daysAgo < days) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const amount = Number(formatUnits(log.value, decimals));
      const current = burnsByDay.get(dateKey) || 0;
      burnsByDay.set(dateKey, current + amount);
    }
  }
  
  return burnsByDay;
};

const aggregateBurnsByHour = (
  logs: Array<{ blockNumber: bigint; value: bigint }>,
  latestBlock: bigint,
  decimals: number
): Map<string, number> => {
  const burnsByHour = new Map<string, number>();
  const now = new Date();
  const blocksPerHour = BLOCKS_PER_DAY / 24n;
  
  for (let i = 0; i < 24; i++) {
    const date = new Date(now);
    date.setHours(date.getHours() - i, 0, 0, 0);
    const hourKey = `${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    burnsByHour.set(hourKey, 0);
  }
  
  for (const log of logs) {
    const blocksAgo = latestBlock - log.blockNumber;
    const hoursAgo = Number(blocksAgo / blocksPerHour);
    
    if (hoursAgo < 24) {
      const date = new Date(now);
      date.setHours(date.getHours() - hoursAgo, 0, 0, 0);
      const hourKey = `${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
      
      const amount = Number(formatUnits(log.value, decimals));
      const current = burnsByHour.get(hourKey) || 0;
      burnsByHour.set(hourKey, current + amount);
    }
  }
  
  return burnsByHour;
};

const buildTransactionsFromLogs = async (
  logs: Array<{ blockNumber: bigint; value: bigint; from: string; txHash: string }>,
  token: BurnBank,
  limit: number = 20
): Promise<BurnTransaction[]> => {
  const client = getViemClient();
  
  const sortedLogs = logs
    .sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))
    .slice(0, limit);

  if (sortedLogs.length === 0) return [];

  const uniqueBlocks = [...new Set(sortedLogs.map(log => log.blockNumber))];
  const fromAddresses = sortedLogs.map(log => log.from);
  
  const [blockResults, ensNames] = await Promise.all([
    Promise.all(uniqueBlocks.map(blockNum => 
      client.getBlock({ blockNumber: blockNum }).catch(() => null)
    )),
    resolveEnsNames(fromAddresses),
  ]);

  const blockTimestamps = new Map<bigint, number>();
  uniqueBlocks.forEach((blockNum, i) => {
    if (blockResults[i]) {
      blockTimestamps.set(blockNum, Number(blockResults[i]!.timestamp) * 1000);
    }
  });

  const transactions: BurnTransaction[] = [];
  for (const log of sortedLogs) {
    const timestamp = blockTimestamps.get(log.blockNumber);
    if (!timestamp) continue;

    const amount = Number(formatUnits(log.value, token.decimals));
    const date = new Date(timestamp);

    transactions.push({
      txHash: log.txHash,
      date: date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      amount,
      from: log.from,
      fromEns: ensNames.get(log.from.toLowerCase()) || undefined,
    });
  }

  return transactions;
};

export const fetchTokenPriceUsd = async (token: BurnBank): Promise<number | null> => {
  const client = getViemClient();

  try {
    const poolAddress = getPoolAddress(token.id);
    if (!poolAddress) return null;

    const priceInWeth = await client.readContract({
      address: PRICE_ORACLE_ADDRESS,
      abi: [{
        inputs: [{ name: 'poolAddr', type: 'address' }],
        name: 'price',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      }],
      functionName: 'price',
      args: [poolAddress],
    });

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

    const priceInWethNumber = Number(formatUnits(priceInWeth, 18));
    const ethUsdNumber = Number(ethUsdPrice) / 1e8;

    return priceInWethNumber * ethUsdNumber;
  } catch {
    return null;
  }
};

export const generateChartData = (
  dailyBurns: Map<string, number>,
  hourlyBurns: Map<string, number>,
  days: number
): BurnDataPoint[] => {
  const now = new Date();
  const chartData: BurnDataPoint[] = [];

  if (days === 1) {
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now);
      date.setHours(date.getHours() - i, 0, 0, 0);
      const dateKey = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const hourKey = `${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
      
      chartData.push({
        date: dateKey,
        totalBurned: hourlyBurns.get(hourKey) || 0,
      });
    }
  } else {
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayBurn = dailyBurns.get(dateKey) || 0;

      chartData.unshift({
        date: dateKey,
        totalBurned: dayBurn,
      });
    }
  }

  return chartData;
};

export const fetchAllBurnData = async (
  token: BurnBank,
  days: number = 7
): Promise<{
  stats: BurnStats;
  chartData: BurnDataPoint[];
  transactions: BurnTransaction[];
  priceUsd: number | null;
}> => {
  const client = getViemClient();
  
  const burnedBalanceRaw = await fetchBurnedBalance(token);
  const totalBurned = Number(formatUnits(burnedBalanceRaw, token.decimals));

  const fetchDays = Math.max(days, 7);
  const latestBlock = await client.getBlockNumber();
  const logs = await fetchBurnLogs(token, fetchDays);
  
  const dailyBurns = aggregateBurnsByDay(logs, latestBlock, token.decimals, fetchDays);
  
  const hourlyBurns = days === 1 
    ? aggregateBurnsByHour(logs, latestBlock, token.decimals)
    : new Map<string, number>();

  const transactions = ENABLE_TRANSACTION_FETCHING 
    ? await buildTransactionsFromLogs(logs, token, 20) 
    : [];

  const priceUsd = ENABLE_PRICE_FETCHING 
    ? await fetchTokenPriceUsd(token) 
    : null;

  const now = new Date();
  const todayKey = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const burnedToday = dailyBurns.get(todayKey) || 0;
  
  let burned7d = 0;
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    burned7d += dailyBurns.get(dateKey) || 0;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const burnedYesterday = dailyBurns.get(yesterdayKey) || 0;
  
  const burnRateChange = burnedYesterday > 0 
    ? ((burnedToday - burnedYesterday) / burnedYesterday) * 100 
    : undefined;

  const stats: BurnStats = {
    totalBurned,
    totalSupply: token.totalSupply,
    burnedToday,
    burned7d,
    burnRateChange,
  };

  const chartData = generateChartData(dailyBurns, hourlyBurns, days);

  return {
    stats,
    chartData,
    transactions,
    priceUsd,
  };
};
