import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Copy,
  ExternalLink,
  Check,
  Clock,
  Zap,
  RefreshCw,
  AlertCircle,
  Gift,
  Heart,
  Layers,
  Trophy,
  Coins,
  LayoutDashboard,
} from 'lucide-react';
import { BurnBank, TopStaker, TopDonor, Winner } from '../types/types';
import { BURN_BANKS, getBurnBankById, getDefaultBurnBank, GUD_FUND_ADDRESS, GUD_FUND_URL } from '../config/burnBanks';
import { useBurnData, TimeRange } from '../hooks/useBurnData';
import { useKtv2Data } from '../hooks/useKtv2Data';
import { useTokenHolderCount } from '../hooks/useTokenHolderCount';
import { formatCompact, formatEth, formatUsd, formatCountdown } from '../utils/formatters';

type TabId = 'overview' | 'burns' | 'stakers' | 'donors' | 'winners';

const selectStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderWidth: '2px',
    borderRadius: '12px',
    minHeight: '54px',
    boxShadow: 'none',
    cursor: 'pointer',
    '&:hover': {
      borderColor: '#ff6b6b',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  }),
  option: (
    base: Record<string, unknown>,
    state: { isSelected: boolean; isFocused: boolean }
  ) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#ff6b6b'
      : state.isFocused
        ? 'rgba(255, 255, 255, 0.1)'
        : 'transparent',
    color: 'white',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#ff6b6b',
    },
  }),
  singleValue: (base: Record<string, unknown>) => ({
    ...base,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    padding: '4px 8px',
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    color: 'white',
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: 'rgba(255, 255, 255, 0.6)',
  }),
  dropdownIndicator: (base: Record<string, unknown>) => ({
    ...base,
    color: 'rgba(255, 255, 255, 0.6)',
    '&:hover': {
      color: '#ff6b6b',
    },
  }),
  indicatorSeparator: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }),
};

const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const shortenTxHash = (hash: string): string => {
  return `${hash.slice(0, 10)}...${hash.slice(-4)}`;
};

const CustomTooltip = ({
  active,
  payload,
  label,
  priceUsd,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  priceUsd?: number | null;
}) => {
  if (active && payload && payload.length) {
    const tokens = payload[0].value;
    const usdValue = priceUsd ? tokens * priceUsd : null;
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-3 shadow-lg">
        <p className="text-white/60 text-sm">{label}</p>
        <p className="text-[#ff6b6b] font-bold">{formatCompact(tokens)} burned</p>
        {usdValue && <p className="text-white/60 text-sm">{formatUsd(usdValue)}</p>}
      </div>
    );
  }
  return null;
};

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-white/50 font-mono w-6 text-center text-sm">{rank}</span>;
};

// Chart component to avoid duplication
const BurnChart: React.FC<{
  chartData: { date: string; totalBurned: number }[];
  timeRange: TimeRange;
  priceUsd: number | null | undefined;
  isFetching: boolean;
}> = ({ chartData, timeRange, priceUsd, isFetching }) => {
  const chartYDomain: [number, 'auto'] = [0, 'auto'];

  return (
    <div className="bg-white/5 rounded-[20px] p-6 border border-white/10 mb-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
        {timeRange === '24h' ? 'Hourly Burns' : 'Daily Burns'}
        {isFetching && <RefreshCw className="w-4 h-4 text-white/40 animate-spin" />}
      </h2>
      <div style={{ width: '100%', height: 300 }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="burnGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                dy={10}
                ticks={(() => {
                  const dates = chartData.map(d => d.date);
                  if (dates.length <= 7) return dates;
                  const tickCount = 6;
                  const ticks: string[] = [];
                  for (let i = 0; i < tickCount; i++) {
                    const index = Math.round((i / (tickCount - 1)) * (dates.length - 1));
                    ticks.push(dates[index]);
                  }
                  return ticks;
                })()}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000000000) return `${(value / 1000000000000).toFixed(1)}T`;
                  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                  return value.toString();
                }}
                width={70}
                domain={chartYDomain}
              />
              <Tooltip content={<CustomTooltip priceUsd={priceUsd} />} />
              <Area
                type="monotone"
                dataKey="totalBurned"
                stroke="#ff6b6b"
                strokeWidth={2}
                fill="url(#burnGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-white/50">
            No chart data available
          </div>
        )}
      </div>
    </div>
  );
};

const BurnBankPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get initial tab from location state (e.g., from /burn redirect)
  const initialTab = (location.state as { tab?: TabId } | null)?.tab || 'overview';
  
  const initialToken = tokenId ? getBurnBankById(tokenId) : getDefaultBurnBank();
  const [selectedToken, setSelectedToken] = useState<BurnBank>(initialToken || getDefaultBurnBank());
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const { data: burnData, error: burnError, isFetching: burnFetching } = useBurnData(
    selectedToken,
    timeRange
  );
  
  const { data: ktv2Data, isFetching: ktv2Fetching } = useKtv2Data(selectedToken);
  const { data: holderCount } = useTokenHolderCount(selectedToken);

  const tokenOptions = BURN_BANKS.map((token) => ({
    value: token.id,
    label: token.name,
    symbol: token.symbol,
    logo: token.logo,
    token,
  }));

  const handleTokenChange = (option: typeof tokenOptions[0] | null) => {
    if (option?.token) {
      setSelectedToken(option.token);
      navigate(`/bank/${option.token.id}`, { replace: true });
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2000);
  };


  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
  ];

  const tabs: { id: TabId; label: string; Icon: typeof LayoutDashboard; color: string }[] = [
    { id: 'overview', label: 'Overview', Icon: LayoutDashboard, color: 'text-purple-400' },
    { id: 'burns', label: 'Burns', Icon: Flame, color: 'text-orange-400' },
    { id: 'stakers', label: 'Top Stakers', Icon: Coins, color: 'text-cyan-400' },
    { id: 'donors', label: 'Top Donors', Icon: Gift, color: 'text-green-400' },
    { id: 'winners', label: 'Winners', Icon: Trophy, color: 'text-amber-400' },
  ];

  const stats = burnData?.stats;
  const chartData = burnData?.chartData || [];
  const allTransactions = burnData?.transactions || [];
  const priceUsd = burnData?.priceUsd;
  
  const transactions = showAllTransactions 
    ? allTransactions.slice(0, 20) 
    : allTransactions.slice(0, 10);

  // Limit leaderboards to top 10
  const topStakers = ktv2Data?.topStakers?.slice(0, 10) || [];
  const topDonors = ktv2Data?.topDonors?.slice(0, 10) || [];

  const burnPercentage = stats
    ? ((stats.totalBurned / stats.totalSupply) * 100).toFixed(4)
    : '0';
  const avgDailyBurn = stats ? Math.floor(stats.burned7d / 7) : 0;
  const totalBurnedUsd = stats && priceUsd ? stats.totalBurned * priceUsd : null;
  const burnedTodayUsd = stats && priceUsd ? stats.burnedToday * priceUsd : null;
  const burned7dUsd = stats && priceUsd ? stats.burned7d * priceUsd : null;
  const avgDailyBurnUsd = priceUsd ? avgDailyBurn * priceUsd : null;

  const isFetching = burnFetching || ktv2Fetching;

  const hasKtv2 = !!selectedToken.ktv2Address;

  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6 overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <img 
              src={selectedToken.logo} 
              alt={selectedToken.name} 
              className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white truncate">
                {selectedToken.name}
              </h1>
              <p className="text-white/50 text-sm sm:text-base">{selectedToken.symbol} Burn Bank</p>
            </div>
          </div>
          
          <div className="md:ml-auto w-full sm:w-auto">
            <div className="flex flex-col gap-1">
              <label className="text-white/50 text-xs font-medium uppercase tracking-wide">
                Switch Bank
              </label>
              <div className="w-full sm:w-56">
                <Select
                  options={tokenOptions}
                  value={tokenOptions.find((opt) => opt.value === selectedToken.id)}
                  onChange={handleTokenChange}
                  formatOptionLabel={(option) => (
                    <div className="flex items-center gap-3">
                      <img src={option.logo} alt={option.label} className="w-6 h-6" />
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs opacity-60">{option.symbol}</span>
                      </div>
                    </div>
                  )}
                  styles={selectStyles}
                  isSearchable={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Overview full width on mobile, others 2x2 grid; flex row on larger screens */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
          {tabs.map((tab) => {
            if (!hasKtv2 && ['stakers', 'donors', 'winners'].includes(tab.id)) {
              return null;
            }
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-4 sm:py-2 rounded-xl text-sm sm:text-base font-medium transition-all cursor-pointer ${
                  tab.id === 'overview' ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  activeTab === tab.id
                    ? 'bg-[#ff6b6b] text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                <tab.Icon className={`w-4 h-4 flex-shrink-0 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Error State */}
        {burnError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-[20px] p-6 mb-8 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Failed to load data</p>
              <p className="text-white/60 text-sm mt-1">
                {burnError.message || 'Please check your connection and reload the page.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {!burnError && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Ktv2 Stats Grid */}
                {hasKtv2 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {/* Current Rewards */}
                    <div className="bg-white/5 rounded-[20px] p-4 sm:p-5 border border-white/10">
                      {ktv2Data?.currentRewardsEth !== undefined ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-5 h-5 text-green-400" />
                            <p className="text-white text-sm">Current Rewards</p>
                          </div>
                          <p className="text-2xl font-bold text-green-400">
                            {formatEth(ktv2Data.currentRewardsEth)}
                          </p>
                          {ktv2Data.ethPriceUsd && (
                            <p className="text-white text-sm">
                              {formatUsd(ktv2Data.currentRewardsEth * ktv2Data.ethPriceUsd)}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 w-28 bg-white/10 rounded" />
                          <div className="h-7 w-24 bg-white/20 rounded" />
                          <div className="h-3 w-24 bg-white/5 rounded" />
                        </div>
                      )}
                    </div>

                    {/* Charity */}
                    <div className="bg-white/5 rounded-[20px] p-5 border border-white/10">
                      {ktv2Data?.stats ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-5 h-5 text-red-400" />
                            <p className="text-white text-sm">Charity</p>
                          </div>
                          <p className="text-2xl font-bold text-red-400">
                            {formatEth(ktv2Data.stats.totalGiven)}
                          </p>
                          {ktv2Data.ethPriceUsd && (
                            <p className="text-white text-sm">
                              {formatUsd(ktv2Data.stats.totalGiven * ktv2Data.ethPriceUsd)}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 w-28 bg-white/10 rounded" />
                          <div className="h-7 w-24 bg-white/20 rounded" />
                          <div className="h-3 w-24 bg-white/5 rounded" />
                        </div>
                      )}
                    </div>

                    {/* Total Burned via bank */}
                    <div className="bg-white/5 rounded-[20px] p-5 border border-white/10">
                      {ktv2Data?.stats ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <p className="text-white text-sm">Total Burned (Bank)</p>
                          </div>
                          <p className="text-2xl font-bold text-orange-400">
                            {formatCompact(ktv2Data.stats.totalBurnedViaKtv2)} {selectedToken.symbol}
                          </p>
                          {priceUsd && (
                            <p className="text-white text-sm">
                              {formatUsd(ktv2Data.stats.totalBurnedViaKtv2 * priceUsd)}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 w-28 bg-white/10 rounded" />
                          <div className="h-7 w-24 bg-white/20 rounded" />
                          <div className="h-3 w-24 bg-white/5 rounded" />
                        </div>
                      )}
                    </div>

                    {/* Total Staked */}
                    <div className="bg-white/5 rounded-[20px] p-4 sm:p-5 border border-white/10">
                      {ktv2Data?.stats ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Layers className="w-5 h-5 text-purple-400" />
                            <p className="text-white text-sm">Total Staked</p>
                          </div>
                          <p className="text-2xl font-bold text-purple-400">
                            {formatCompact(ktv2Data.stats.totalStaked)} {selectedToken.symbol}
                          </p>
                          {priceUsd && (
                            <p className="text-white text-sm">
                              {formatUsd(ktv2Data.stats.totalStaked * priceUsd)}
                            </p>
                          )}
                          <p className="text-lg font-semibold text-purple-400 mt-2">
                            {((ktv2Data.stats.totalStaked / selectedToken.totalSupply) * 100).toFixed(4)}% of total supply
                          </p>
                          {stats && stats.totalBurned < selectedToken.totalSupply && (
                            <p className="text-white text-sm mt-0.5">
                              {((ktv2Data.stats.totalStaked / (selectedToken.totalSupply - stats.totalBurned)) * 100).toFixed(4)}% of circulating (excl. burned)
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 w-28 bg-white/10 rounded" />
                          <div className="h-7 w-24 bg-white/20 rounded" />
                          <div className="h-3 w-24 bg-white/5 rounded" />
                        </div>
                      )}
                    </div>

                    {/* Unique Stakers */}
                    <div className="bg-white/5 rounded-[20px] p-4 sm:p-5 border border-white/10">
                      {ktv2Data?.uniqueStakerCount !== undefined ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Coins className="w-5 h-5 text-cyan-400" />
                            <p className="text-white text-sm">Unique Stakers</p>
                          </div>
                          <p className="text-2xl font-bold text-cyan-400">
                            {ktv2Data.uniqueStakerCount.toLocaleString()} wallets
                          </p>
                          {holderCount != null && holderCount > 0 && (
                            <>
                              <p className="text-lg font-semibold text-white mt-2">
                                {holderCount.toLocaleString()} total {selectedToken.symbol} holders
                              </p>
                              <p className="text-cyan-400/90 text-sm mt-0.5 font-medium">
                                {((ktv2Data.uniqueStakerCount / holderCount) * 100).toFixed(2)}% of holders staked
                              </p>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 w-28 bg-white/10 rounded" />
                          <div className="h-7 w-24 bg-white/20 rounded" />
                          <div className="h-3 w-24 bg-white/5 rounded" />
                        </div>
                      )}
                    </div>

                    {/* Epoch Interval & Next Epoch */}
                    <div className="bg-white/5 rounded-[20px] p-4 sm:p-5 border border-white/10">
                      {ktv2Data?.stats && ktv2Data.currentBlock !== undefined ? (
                        (() => {
                          const startBlock = ktv2Data.stats.currentEpochStart;
                          const { epochInterval } = ktv2Data.stats;
                          const currentBlock = ktv2Data.currentBlock;
                          const blocksSinceStart = currentBlock - startBlock;
                          const currentEpochNum = Math.floor(blocksSinceStart / epochInterval) + 1;
                          const nextEpochBlock = startBlock + currentEpochNum * epochInterval;
                          const blocksUntilNext = nextEpochBlock - currentBlock;
                          const secondsUntilNext = Math.max(0, blocksUntilNext * 12);
                          return (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-yellow-400" />
                                <p className="text-white text-sm">Epoch</p>
                              </div>
                              <p className="text-2xl font-bold text-yellow-400">
                                {formatCountdown(ktv2Data.stats.epochInterval * 12)} interval
                              </p>
                              <p className="text-white text-sm mt-1">
                                {ktv2Data.stats.epochInterval.toLocaleString()} blocks
                              </p>
                              <p className="text-xl font-bold text-yellow-400 mt-3">
                                {formatCountdown(secondsUntilNext)} to next
                              </p>
                              <p className="text-white text-sm mt-0.5">
                                Block {nextEpochBlock.toLocaleString()}
                              </p>
                            </>
                          );
                        })()
                      ) : ktv2Data?.stats ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <p className="text-white text-sm">Epoch Interval</p>
                          </div>
                          <p className="text-2xl font-bold text-yellow-400">
                            {formatCountdown(ktv2Data.stats.epochInterval * 12)}
                          </p>
                          <p className="text-white text-sm mt-1">
                            {ktv2Data.stats.epochInterval.toLocaleString()} blocks
                          </p>
                        </>
                      ) : (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 w-28 bg-white/10 rounded" />
                          <div className="h-7 w-24 bg-white/20 rounded" />
                          <div className="h-3 w-24 bg-white/5 rounded" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contract Info */}
                <div className="bg-white/5 rounded-[20px] p-4 sm:p-5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Contract Info</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-white/50 text-sm min-w-[120px]">Token:</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://etherscan.io/token/${selectedToken.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff6b6b] hover:underline font-mono text-sm flex items-center gap-1"
                        >
                          {shortenAddress(selectedToken.contractAddress)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => copyToClipboard(selectedToken.contractAddress, 'contract')}
                          className="p-1 rounded hover:bg-white/10 cursor-pointer"
                        >
                          {copiedAddress === 'contract' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/40" />}
                        </button>
                      </div>
                    </div>
                    {selectedToken.ktv2Address && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-white/50 text-sm min-w-[120px]">Burn Bank:</span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://etherscan.io/address/${selectedToken.ktv2Address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ff6b6b] hover:underline font-mono text-sm flex items-center gap-1"
                          >
                            {shortenAddress(selectedToken.ktv2Address)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => copyToClipboard(selectedToken.ktv2Address!, 'ktv2')}
                            className="p-1 rounded hover:bg-white/10 cursor-pointer"
                          >
                            {copiedAddress === 'ktv2' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/40" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {hasKtv2 && ktv2Data?.stats?.charityAddress && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-white/50 text-sm min-w-[120px]">Charity:</span>
                        <div className="flex items-center gap-2">
                          {ktv2Data.stats.charityAddress.toLowerCase() === GUD_FUND_ADDRESS.toLowerCase() ? (
                            <a
                              href={GUD_FUND_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#ff6b6b] hover:underline font-medium text-sm flex items-center gap-1"
                            >
                              Gud Fund managed by Endaoment
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <a
                              href={`https://etherscan.io/address/${ktv2Data.stats.charityAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#ff6b6b] hover:underline font-mono text-sm flex items-center gap-1"
                            >
                              {shortenAddress(ktv2Data.stats.charityAddress)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={() => copyToClipboard(ktv2Data.stats.charityAddress!, 'charity')}
                            className="p-1 rounded hover:bg-white/10 cursor-pointer"
                          >
                            {copiedAddress === 'charity' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/40" />}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-white/50 text-sm min-w-[120px]">Total Supply:</span>
                      <span className="text-white/80 text-sm">{formatCompact(selectedToken.totalSupply)} {selectedToken.symbol}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Burns Tab */}
            {activeTab === 'burns' && (
              <>
                {/* Burn Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  {/* Total Burned Card */}
                  <div className="bg-white/5 rounded-[20px] p-5 border border-white/10">
                    {stats ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="w-5 h-5 text-[#ff6b6b]" />
                          <p className="text-white text-sm">Total Burned (All Time)</p>
                        </div>
                        <p className="text-2xl font-bold text-[#ff6b6b]">
                          {formatCompact(stats.totalBurned)}
                        </p>
                        <p className="text-white text-sm mt-1">{burnPercentage}% of supply</p>
                        {totalBurnedUsd && (
                          <p className="text-white text-sm">{formatUsd(totalBurnedUsd)}</p>
                        )}
                        {hasKtv2 && ktv2Data?.stats && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-white text-xs mb-1">Via Burn Bank</p>
                            <p className="text-[#ff6b6b] font-semibold">
                              {formatCompact(ktv2Data.stats.totalBurnedViaKtv2)}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="h-7 w-24 bg-white/20 rounded" />
                        <div className="h-3 w-40 bg-white/5 rounded" />
                        <div className="h-3 w-24 bg-white/5 rounded" />
                      </div>
                    )}
                  </div>

                  {/* Burned Today Card */}
                  <div className="bg-white/5 rounded-[20px] p-4 sm:p-5 border border-white/10">
                    {stats ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-[#ff6b6b]" />
                          <p className="text-white text-sm">Burned Today</p>
                        </div>
                        <p className="text-2xl font-bold text-[#ff6b6b]">
                          {formatCompact(stats.burnedToday)}
                        </p>
                        {burnedTodayUsd !== null && burnedTodayUsd > 0 && (
                          <p className="text-white text-sm">{formatUsd(burnedTodayUsd)}</p>
                        )}
                        {stats.burnRateChange !== undefined && (
                          <p className={`text-sm mt-1 flex items-center gap-1 ${stats.burnRateChange > 0 ? 'text-[#6bcf7f]' : stats.burnRateChange < 0 ? 'text-red-400' : 'text-white/50'}`}>
                            {stats.burnRateChange > 0 ? <TrendingUp className="w-4 h-4" /> : stats.burnRateChange < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                            {stats.burnRateChange > 0 ? '+' : ''}{stats.burnRateChange.toFixed(1)}% vs yesterday
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="h-7 w-24 bg-white/20 rounded" />
                        <div className="h-3 w-32 bg-white/5 rounded" />
                        <div className="h-3 w-28 bg-white/5 rounded" />
                      </div>
                    )}
                  </div>

                  {/* Burned 7D Card */}
                  <div className="bg-white/5 rounded-[20px] p-4 sm:p-5 border border-white/10">
                    {stats ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-5 h-5 text-[#ff6b6b]" />
                          <p className="text-white text-sm">Burned (7D)</p>
                        </div>
                        <p className="text-2xl font-bold text-[#ff6b6b]">
                          {formatCompact(stats.burned7d)}
                        </p>
                        {burned7dUsd !== null && burned7dUsd > 0 && (
                          <p className="text-white text-sm">{formatUsd(burned7dUsd)}</p>
                        )}
                        <p className="text-white text-sm mt-1">
                          ~{formatCompact(avgDailyBurn)}/day
                          {avgDailyBurnUsd !== null && avgDailyBurnUsd > 0 && (
                            <span> ({formatUsd(avgDailyBurnUsd)})</span>
                          )}
                        </p>
                      </>
                    ) : (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="h-7 w-24 bg-white/20 rounded" />
                        <div className="h-3 w-32 bg-white/5 rounded" />
                        <div className="h-3 w-40 bg-white/5 rounded" />
                      </div>
                    )}
                  </div>

                  {/* Burn Progress Card */}
                  <div className="bg-white/5 rounded-[20px] p-5 border border-white/10">
                    {stats ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-[#ff6b6b]" />
                          <p className="text-white text-sm">Burn Progress</p>
                        </div>
                        <p className="text-2xl font-bold text-[#ff6b6b]">{burnPercentage}%</p>
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#ff6b6b] rounded-full transition-all"
                            style={{ width: `${Math.min(parseFloat(burnPercentage) * 10, 100)}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="h-7 w-20 bg-white/20 rounded" />
                        <div className="mt-4 h-2 bg-white/10 rounded-full" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Range (affects chart only) */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeRange(option.value)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                        timeRange === option.value
                          ? 'bg-[#ff6b6b] text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Chart */}
                <BurnChart 
                  chartData={chartData} 
                  timeRange={timeRange} 
                  priceUsd={priceUsd} 
                  isFetching={isFetching} 
                />

                {/* Transactions */}
                <div className="bg-white/5 rounded-[20px] p-4 sm:p-6 border border-white/10 overflow-x-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 min-w-0">
                    <h2 className="text-lg font-bold text-white">Recent Burns</h2>
                    <a
                      href={`https://etherscan.io/token/${selectedToken.contractAddress}?a=${selectedToken.burnAddresses[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ff6b6b] hover:underline text-sm flex items-center gap-1"
                    >
                      View all <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {burnFetching && transactions.length === 0 ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 py-3 border-b border-white/5 animate-pulse"
                        >
                          <div className="h-4 w-32 bg-white/10 rounded" />
                          <div className="h-4 w-40 bg-white/10 rounded" />
                          <div className="h-4 w-24 bg-white/10 rounded" />
                          <div className="h-4 w-28 bg-white/10 rounded md:ml-auto" />
                        </div>
                      ))}
                    </div>
                  ) : transactions.length > 0 ? (
                    <>
                      <div className="hidden md:grid grid-cols-4 gap-4 pb-3 border-b border-white/10 mb-2">
                        <p className="text-white/50 text-sm">Transaction</p>
                        <p className="text-white/50 text-sm">From</p>
                        <p className="text-white/50 text-sm">Date</p>
                        <p className="text-white/50 text-sm text-right">Amount</p>
                      </div>

                      {transactions.map((tx, index) => (
                        <div
                          key={tx.txHash}
                          className={`grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 py-3 ${
                            index < transactions.length - 1 ? 'border-b border-white/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://etherscan.io/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#ff6b6b] hover:underline font-mono text-sm flex items-center gap-1"
                            >
                              {shortenTxHash(tx.txHash)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div>
                            {tx.from && (
                              <a
                                href={`https://etherscan.io/address/${tx.from}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/70 hover:text-white font-mono text-sm"
                              >
                                {tx.fromEns || shortenAddress(tx.from)}
                              </a>
                            )}
                          </div>
                          <div className="text-white/60 text-sm">{tx.date}</div>
                          <div className="text-right">
                            <p className="text-white font-medium">
                              {formatCompact(tx.amount)} {selectedToken.symbol}
                            </p>
                            {priceUsd && (
                              <p className="text-white/40 text-xs">{formatUsd(tx.amount * priceUsd)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {!showAllTransactions && allTransactions.length > 10 && (
                        <button
                          onClick={() => setShowAllTransactions(true)}
                          className="w-full mt-4 py-2 text-sm text-[#ff6b6b] hover:underline cursor-pointer"
                        >
                          Show more ({allTransactions.length - 10} more)
                        </button>
                      )}
                      {showAllTransactions && allTransactions.length > 10 && (
                        <button
                          onClick={() => setShowAllTransactions(false)}
                          className="w-full mt-4 py-2 text-sm text-white/50 hover:text-white/70 cursor-pointer"
                        >
                          Show less
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-white/50">
                      No recent burns found
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Top Stakers Tab */}
            {activeTab === 'stakers' && hasKtv2 && (
              <div className="bg-white/5 rounded-[20px] p-4 sm:p-6 border border-white/10 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#6bcf7f]" />
                    Top 10 Stakers
                  </h2>
                  {ktv2Fetching && <RefreshCw className="w-4 h-4 text-white/40 animate-spin" />}
                </div>

                {ktv2Fetching && topStakers.length === 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-3 border-b border-white/5 animate-pulse"
                      >
                        <div className="col-span-1 h-5 w-7 bg-white/10 rounded-full" />
                        <div className="col-span-5 h-4 w-40 bg-white/10 rounded" />
                        <div className="col-span-2 h-4 w-10 bg-white/10 rounded mx-auto" />
                        <div className="col-span-4 h-4 w-24 bg-white/10 rounded md:ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : topStakers.length > 0 ? (
                  <>
                    <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-white/10 mb-2">
                      <p className="text-white/50 text-sm col-span-1">#</p>
                      <p className="text-white/50 text-sm col-span-5">Address</p>
                      <p className="text-white/50 text-sm col-span-2 text-center">Stakes</p>
                      <p className="text-white/50 text-sm col-span-4 text-right">Amount</p>
                    </div>

                    {topStakers.map((staker: TopStaker, index: number) => {
                      const usdValue = priceUsd ? staker.stakedAmount * priceUsd : null;
                      return (
                        <div
                          key={staker.address}
                          className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-12 gap-2 md:gap-4 py-3 items-center ${
                            index < topStakers.length - 1 ? 'border-b border-white/5' : ''
                          }`}
                        >
                          <div className="flex items-center md:col-span-1">
                            <RankBadge rank={staker.rank} />
                          </div>
                          <div className="min-w-0 md:col-span-5">
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://etherscan.io/address/${staker.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-white font-mono text-sm cursor-pointer truncate"
                              >
                                {staker.ensName || shortenAddress(staker.address)}
                              </a>
                              <button
                                onClick={() => copyToClipboard(staker.address, `staker-${index}`)}
                                className="p-1 rounded hover:bg-white/10 cursor-pointer flex-shrink-0"
                              >
                                {copiedAddress === `staker-${index}` ? <Check className="w-3 h-3 text-[#6bcf7f]" /> : <Copy className="w-3 h-3 text-white/30" />}
                              </button>
                            </div>
                            <p className="text-white/40 text-xs mt-0.5 md:hidden">
                              {staker.stakeCount} stake{staker.stakeCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="hidden md:flex col-span-2 text-center text-white/60 text-sm justify-center">
                            {staker.stakeCount}
                          </div>
                          <div className="text-right md:col-span-4">
                            <p className="text-[#6bcf7f] font-medium">
                              {formatCompact(staker.stakedAmount)} {selectedToken.symbol}
                            </p>
                            {usdValue && (
                              <p className="text-white text-xs">{formatUsd(usdValue)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center py-8 text-white/50">No stakers found</div>
                )}
              </div>
            )}

            {/* Top Donors Tab */}
            {activeTab === 'donors' && hasKtv2 && (
              <div className="bg-white/5 rounded-[20px] p-4 sm:p-6 border border-white/10 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#ffd93d]" />
                    Top 10 Donors
                  </h2>
                  {ktv2Fetching && <RefreshCw className="w-4 h-4 text-white/40 animate-spin" />}
                </div>

                {ktv2Fetching && topDonors.length === 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-3 border-b border-white/5 animate-pulse"
                      >
                        <div className="col-span-1 h-5 w-7 bg-white/10 rounded-full" />
                        <div className="col-span-5 h-4 w-40 bg-white/10 rounded" />
                        <div className="col-span-2 h-4 w-10 bg-white/10 rounded mx-auto" />
                        <div className="col-span-4 h-4 w-24 bg-white/10 rounded md:ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : topDonors.length > 0 ? (
                  <>
                    <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-white/10 mb-2">
                      <p className="text-white/50 text-sm col-span-1">#</p>
                      <p className="text-white/50 text-sm col-span-5">Address</p>
                      <p className="text-white/50 text-sm col-span-2 text-center">Donations</p>
                      <p className="text-white/50 text-sm col-span-4 text-right">Total Given</p>
                    </div>

                    {topDonors.map((donor: TopDonor, index: number) => {
                      const donorUsdValue = ktv2Data?.ethPriceUsd ? donor.totalGiven * ktv2Data.ethPriceUsd : null;
                      return (
                        <div
                          key={donor.address}
                          className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-12 gap-2 md:gap-4 py-3 items-center ${
                            index < topDonors.length - 1 ? 'border-b border-white/5' : ''
                          }`}
                        >
                          <div className="flex items-center md:col-span-1">
                            <RankBadge rank={donor.rank} />
                          </div>
                          <div className="min-w-0 md:col-span-5">
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://etherscan.io/address/${donor.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-white font-mono text-sm cursor-pointer truncate"
                              >
                                {donor.ensName || shortenAddress(donor.address)}
                              </a>
                              <button
                                onClick={() => copyToClipboard(donor.address, `donor-${index}`)}
                                className="p-1 rounded hover:bg-white/10 cursor-pointer flex-shrink-0"
                              >
                                {copiedAddress === `donor-${index}` ? <Check className="w-3 h-3 text-[#ffd93d]" /> : <Copy className="w-3 h-3 text-white/30" />}
                              </button>
                            </div>
                            <p className="text-white/40 text-xs mt-0.5 md:hidden">
                              {donor.donationCount} donation{donor.donationCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="hidden md:flex col-span-2 text-center text-white/60 text-sm justify-center">
                            {donor.donationCount}
                          </div>
                          <div className="text-right md:col-span-4">
                            <p className="text-[#ffd93d] font-medium">
                              {formatEth(donor.totalGiven)}
                            </p>
                            {donorUsdValue && (
                              <p className="text-white text-xs">{formatUsd(donorUsdValue)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center py-8 text-white/50">No donors found</div>
                )}
              </div>
            )}

            {/* Winners Tab */}
            {activeTab === 'winners' && hasKtv2 && (
              <div className="bg-white/5 rounded-[20px] p-4 sm:p-6 border border-white/10 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#ff8e53]" />
                    Recent Winners
                  </h2>
                  {ktv2Fetching && <RefreshCw className="w-4 h-4 text-white/40 animate-spin" />}
                </div>

                {ktv2Fetching && (!ktv2Data?.recentWinners || ktv2Data.recentWinners.length === 0) ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 py-3 border-b border-white/5 animate-pulse"
                      >
                        <div className="h-4 w-24 bg-white/10 rounded" />
                        <div className="h-4 w-40 bg-white/10 rounded" />
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="h-4 w-20 bg-white/10 rounded md:ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : ktv2Data?.recentWinners && ktv2Data.recentWinners.length > 0 ? (
                  <>
                    <div className="hidden md:grid grid-cols-4 gap-4 pb-3 border-b border-white/10 mb-2">
                      <p className="text-white/50 text-sm">Date</p>
                      <p className="text-white/50 text-sm">Winner</p>
                      <p className="text-white/50 text-sm">Transaction</p>
                      <p className="text-white/50 text-sm text-right">Reward</p>
                    </div>

                    {ktv2Data.recentWinners.map((winner: Winner, index: number) => {
                      const rewardUsdValue = ktv2Data.ethPriceUsd ? winner.reward * ktv2Data.ethPriceUsd : null;
                      return (
                        <div
                          key={winner.txHash}
                          className={`grid grid-cols-[1fr_auto] md:grid-cols-4 gap-3 md:gap-4 py-3 items-start md:items-center ${
                            index < ktv2Data.recentWinners.length - 1 ? 'border-b border-white/5' : ''
                          }`}
                        >
                          <div className="min-w-0 space-y-1 md:contents">
                            <div className="text-white/60 text-sm">
                              {winner.date || `Block ${winner.blockNumber}`}
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <Trophy className="w-4 h-4 text-[#ff8e53] flex-shrink-0" />
                              <a
                                href={`https://etherscan.io/address/${winner.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/80 hover:text-white font-mono text-sm cursor-pointer truncate"
                              >
                                {winner.ensName || shortenAddress(winner.address)}
                              </a>
                            </div>
                            <a
                              href={`https://etherscan.io/tx/${winner.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#ff6b6b] hover:underline font-mono text-xs sm:text-sm flex items-center gap-1 cursor-pointer truncate"
                            >
                              {shortenTxHash(winner.txHash)}
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </div>
                          <div className="text-right flex-shrink-0 md:col-span-1">
                            <p className="text-[#ff8e53] font-medium text-sm sm:text-base">{formatEth(winner.reward)}</p>
                            {rewardUsdValue && (
                              <p className="text-white text-xs">{formatUsd(rewardUsdValue)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="text-center py-8 text-white/50">No winners found yet</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default BurnBankPage;
