import React, { useState } from 'react';
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
} from 'lucide-react';
import { BurnBank } from '../types/types';
import { BURN_BANKS, getDefaultBurnBank } from '../config/burnBanks';
import { useBurnData, TimeRange } from '../hooks/useBurnData';
import LoadingSpinner from '../components/common/LoadingSpinner';

const selectStyles = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    minHeight: '48px',
    boxShadow: 'none',
    cursor: 'pointer',
    '&:hover': {
      borderColor: '#ff6b6b',
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

const formatCompact = (num: number): string => {
  const format = (value: number, suffix: string) => {
    const formatted = value.toFixed(2);
    // Remove .00 if whole number - use rounded value, not floor
    if (formatted.endsWith('.00')) {
      return `${Math.round(value)}${suffix}`;
    }
    return `${formatted}${suffix}`;
  };
  
  if (num >= 1000000000000) return format(num / 1000000000000, 'T');
  if (num >= 1000000000) return format(num / 1000000000, 'B');
  if (num >= 1000000) return format(num / 1000000, 'M');
  if (num >= 1000) return format(num / 1000, 'K');
  return num % 1 === 0 ? num.toString() : num.toFixed(2);
};

const formatUsd = (num: number): string => {
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
  if (num >= 1) return `$${num.toFixed(2)}`;
  if (num >= 0.01) return `$${num.toFixed(4)}`;
  return `$${num.toFixed(8)}`;
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
        {usdValue && <p className="text-[#6bcf7f] text-sm">{formatUsd(usdValue)}</p>}
      </div>
    );
  }
  return null;
};

const BurnTrackerPage: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<BurnBank>(getDefaultBurnBank());
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useBurnData(
    selectedToken,
    timeRange
  );

  const tokenOptions = BURN_BANKS.map((token) => ({
    value: token.id,
    label: token.name,
    symbol: token.symbol,
    logo: token.logo,
    token,
  }));

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

  const stats = data?.stats;
  const chartData = data?.chartData || [];
  const allTransactions = data?.transactions || [];
  const priceUsd = data?.priceUsd;
  
  // Show 10 transactions initially, 20 when expanded
  const transactions = showAllTransactions 
    ? allTransactions.slice(0, 20) 
    : allTransactions.slice(0, 10);

  const burnPercentage = stats
    ? ((stats.totalBurned / stats.totalSupply) * 100).toFixed(4)
    : '0';
  const avgDailyBurn = stats ? Math.floor(stats.burned7d / 7) : 0;
  const totalBurnedUsd = stats && priceUsd ? stats.totalBurned * priceUsd : null;
  const burnedTodayUsd = stats && priceUsd ? stats.burnedToday * priceUsd : null;
  const burned7dUsd = stats && priceUsd ? stats.burned7d * priceUsd : null;
  const avgDailyBurnUsd = priceUsd ? avgDailyBurn * priceUsd : null;

  // Chart Y-axis domain: start from 0 for actual burns per period
  const chartYDomain: [number, 'auto'] = [0, 'auto'];

  return (
    <section className="py-8 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="w-10 h-10 text-[#ff6b6b]" />
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#ff6b6b] via-[#ffd93d] to-[#6bcf7f] bg-clip-text text-transparent">
              Burn Tracker
            </h1>
          </div>
          <p className="text-lg opacity-80 max-w-[600px] mx-auto">
            Track token burns in real-time across different burn banks
          </p>
        </div>

        {/* Controls Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="w-full md:w-80">
            <label className="block text-sm font-medium opacity-60 mb-2">Token</label>
            <Select
              options={tokenOptions}
              value={tokenOptions.find((opt) => opt.value === selectedToken.id)}
              onChange={(option) => {
                if (option?.token) {
                  setSelectedToken(option.token);
                }
              }}
              formatOptionLabel={(option) => (
                <div className="flex items-center gap-3">
                  <img 
                    src={option.logo} 
                    alt={option.label} 
                    className="w-6 h-6"
                  />
                  <span>{option.label} ({option.symbol})</span>
                </div>
              )}
              styles={selectStyles}
              isSearchable={false}
            />
          </div>

          <div className="flex gap-2 items-center">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                  timeRange === option.value
                    ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-[20px] p-6 mb-8 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Failed to load burn data</p>
              <p className="text-white/60 text-sm mt-1">
                {error.message || 'Please check your connection and try again.'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="ml-auto px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <LoadingSpinner />
            <p className="text-white/60 text-sm animate-pulse">
              Fetching burn data from blockchain...
            </p>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Burned */}
              <div className="bg-white/5 rounded-[20px] p-6 border border-white/10 hover:border-[#ff6b6b]/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-[#ff6b6b]" />
                  <p className="text-white/60 text-sm font-medium">Total Burned</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-[#ff6b6b]">
                  {formatCompact(stats.totalBurned)}
                </p>
                <p className="text-white/50 text-sm mt-1">{burnPercentage}% of supply</p>
                {totalBurnedUsd && (
                  <p className="text-[#6bcf7f] text-sm mt-1">
                    {formatUsd(totalBurnedUsd)}
                  </p>
                )}
              </div>

              {/* Burned Today */}
              <div className="bg-white/5 rounded-[20px] p-6 border border-white/10 hover:border-[#ff6b6b]/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-[#ffd93d]" />
                  <p className="text-white/60 text-sm font-medium">Burned Today</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-[#ffd93d]">
                  {formatCompact(stats.burnedToday)}
                </p>
                {burnedTodayUsd !== null && burnedTodayUsd > 0 && (
                  <p className="text-[#6bcf7f] text-sm mt-1">
                    {formatUsd(burnedTodayUsd)}
                  </p>
                )}
                {stats.burnRateChange !== undefined && (
                  <p
                    className={`text-sm mt-1 flex items-center gap-1 ${stats.burnRateChange > 0 ? 'text-[#6bcf7f]' : stats.burnRateChange < 0 ? 'text-red-400' : 'text-white/50'}`}
                  >
                    {stats.burnRateChange > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : stats.burnRateChange < 0 ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : null}
                    {stats.burnRateChange > 0 ? '+' : ''}
                    {stats.burnRateChange.toFixed(1)}% vs yesterday
                  </p>
                )}
              </div>

              {/* Burned 7d */}
              <div className="bg-white/5 rounded-[20px] p-6 border border-white/10 hover:border-[#ff6b6b]/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-[#6bcf7f]" />
                  <p className="text-white/60 text-sm font-medium">Burned (7D)</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-[#6bcf7f]">
                  {formatCompact(stats.burned7d)}
                </p>
                {burned7dUsd !== null && burned7dUsd > 0 && (
                  <p className="text-[#6bcf7f]/70 text-sm mt-1">
                    {formatUsd(burned7dUsd)}
                  </p>
                )}
                <p className="text-white/50 text-sm mt-1">
                  ~{formatCompact(avgDailyBurn)}/day avg
                  {avgDailyBurnUsd !== null && avgDailyBurnUsd > 0 && (
                    <span className="text-[#6bcf7f]/50"> ({formatUsd(avgDailyBurnUsd)})</span>
                  )}
                </p>
              </div>

              {/* Burn Progress */}
              <div className="bg-white/5 rounded-[20px] p-6 border border-white/10 hover:border-[#ff6b6b]/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-[#ff8e53]" />
                  <p className="text-white/60 text-sm font-medium">Burn Progress</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-[#ff8e53]">{burnPercentage}%</p>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(parseFloat(burnPercentage) * 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white/5 rounded-[20px] p-6 border border-white/10 mb-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="bg-gradient-to-r from-[#ff6b6b] to-[#ff8e53] bg-clip-text text-transparent">
                  {timeRange === '24h' ? 'Hourly Burns' : 'Daily Burns'}
                </span>
                {isFetching && !isLoading && (
                  <RefreshCw className="w-4 h-4 text-white/40 animate-spin" />
                )}
              </h2>
              <div style={{ width: '100%', height: 350, minHeight: 350 }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
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
                          // Show 6 evenly spaced ticks including first and last
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
                          // Use 2 decimals for better precision on close values
                          if (value >= 1000000000000) return `${(value / 1000000000000).toFixed(2)}T`;
                          if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
                          if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
                          if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
                          return value.toString();
                        }}
                        width={80}
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
                    No chart data available for this period
                  </div>
                )}
              </div>
            </div>

            {/* Latest Burn Transactions */}
            <div className="bg-white/5 rounded-[20px] p-6 border border-white/10 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#ff6b6b]" />
                  <h2 className="text-xl font-bold">Latest Burn Transactions</h2>
                </div>
                <a
                  href={`https://etherscan.io/token/${selectedToken.contractAddress}?a=${selectedToken.burnAddresses[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff6b6b] hover:text-[#ff8e53] text-sm flex items-center gap-1"
                >
                  View all <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {transactions.length > 0 ? (
                <>
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-4 gap-4 pb-3 border-b border-white/10 mb-2">
                    <p className="text-white/50 text-sm font-medium">Transaction</p>
                    <p className="text-white/50 text-sm font-medium">From</p>
                    <p className="text-white/50 text-sm font-medium">Date</p>
                    <p className="text-white/50 text-sm font-medium text-right">Amount</p>
                  </div>

                  {/* Table Rows */}
                  {transactions.map((tx, index) => (
                    <div
                      key={tx.txHash}
                      className={`grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 py-4 ${
                        index < transactions.length - 1 ? 'border-b border-white/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="md:hidden text-white/50 text-sm">Tx:</span>
                        <a
                          href={`https://etherscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff6b6b] hover:text-[#ff8e53] transition-colors flex items-center gap-1 font-mono text-sm"
                        >
                          {shortenTxHash(tx.txHash)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="md:hidden text-white/50 text-sm">From:</span>
                        {tx.from && (
                          <a
                            href={`https://etherscan.io/address/${tx.from}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/70 hover:text-white transition-colors font-mono text-sm"
                          >
                            {tx.fromEns || shortenAddress(tx.from)}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="md:hidden text-white/50 text-sm">Date:</span>
                        <p className="text-white/80 text-sm">{tx.date}</p>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-1">
                        <div className="flex items-center gap-2 md:justify-end">
                          <span className="md:hidden text-white/50 text-sm">Amount:</span>
                          <p className="text-[#ff6b6b] font-semibold">
                            {formatCompact(tx.amount)} {selectedToken.symbol}
                          </p>
                        </div>
                        {priceUsd && (
                          <p className="text-white/50 text-xs">{formatUsd(tx.amount * priceUsd)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Show More Button */}
                  {!showAllTransactions && allTransactions.length > 10 && (
                    <button
                      onClick={() => setShowAllTransactions(true)}
                      className="w-full mt-4 py-2 text-sm text-[#ff6b6b] hover:text-[#ff8e53] transition-colors cursor-pointer"
                    >
                      Show more ({allTransactions.length - 10} more)
                    </button>
                  )}
                  {showAllTransactions && allTransactions.length > 10 && (
                    <button
                      onClick={() => setShowAllTransactions(false)}
                      className="w-full mt-4 py-2 text-sm text-white/50 hover:text-white/70 transition-colors cursor-pointer"
                    >
                      Show less
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-white/50">
                  No recent burn transactions found
                </div>
              )}
            </div>
          </>
        )}

        {/* Contract Information */}
        <div className="bg-white/5 rounded-[20px] p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-4">Contract Information</h2>
          <div className="space-y-4">
            {/* Token Contract */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-white/50 text-sm min-w-[140px]">Token Contract:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`https://etherscan.io/token/${selectedToken.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff6b6b] hover:text-[#ff8e53] font-mono text-sm flex items-center gap-1"
                >
                  <span className="hidden sm:inline">{selectedToken.contractAddress}</span>
                  <span className="sm:hidden">{shortenAddress(selectedToken.contractAddress)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => copyToClipboard(selectedToken.contractAddress, 'contract')}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Copy address"
                >
                  {copiedAddress === 'contract' ? (
                    <Check className="w-4 h-4 text-[#6bcf7f]" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/50" />
                  )}
                </button>
              </div>
            </div>

            {/* Burn Address(es) */}
            {selectedToken.burnAddresses.length === 1 ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="text-white/50 text-sm min-w-[140px]">Burn Address:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`https://etherscan.io/address/${selectedToken.burnAddresses[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff6b6b] hover:text-[#ff8e53] font-mono text-sm flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">{selectedToken.burnAddresses[0]}</span>
                    <span className="sm:hidden">{shortenAddress(selectedToken.burnAddresses[0])}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => copyToClipboard(selectedToken.burnAddresses[0], 'burn-0')}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copy address"
                  >
                    {copiedAddress === 'burn-0' ? (
                      <Check className="w-4 h-4 text-[#6bcf7f]" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/50" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-white/50 text-sm">Burn Addresses:</span>
                <div className="space-y-2 pl-0 sm:pl-4">
                  {selectedToken.burnAddresses.map((address, index) => (
                    <div key={address} className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`https://etherscan.io/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ff6b6b] hover:text-[#ff8e53] font-mono text-sm flex items-center gap-1"
                      >
                        <span className="hidden sm:inline">{address}</span>
                        <span className="sm:hidden">{shortenAddress(address)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => copyToClipboard(address, `burn-${index}`)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                        title="Copy address"
                      >
                        {copiedAddress === `burn-${index}` ? (
                          <Check className="w-4 h-4 text-[#6bcf7f]" />
                        ) : (
                          <Copy className="w-4 h-4 text-white/50" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Token Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-white/50 text-sm min-w-[140px]">Token Decimals:</span>
              <span className="text-white/80 text-sm">{selectedToken.decimals}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-white/50 text-sm min-w-[140px]">Total Supply:</span>
              <span className="text-white/80 text-sm">
                {formatCompact(selectedToken.totalSupply)} {selectedToken.symbol}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BurnTrackerPage;
