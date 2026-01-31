// Shared formatting utilities

export const formatCompact = (num: number): string => {
    const format = (value: number, suffix: string) => {
      const formatted = value.toFixed(2);
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
  
  export const formatEth = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K ETH`;
    if (num >= 1) return `${num.toFixed(4)} ETH`;
    if (num >= 0.0001) return `${num.toFixed(6)} ETH`;
    return `${num.toFixed(8)} ETH`;
  };
  
  export const formatUsd = (num: number): string => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    if (num >= 1) return `$${num.toFixed(2)}`;
    if (num >= 0.01) return `$${num.toFixed(4)}`;
    return `$${num.toFixed(8)}`;
  };
  
  /** Format block count to human-readable duration (~12 sec/block) */
  export const formatBlocksToTime = (blocks: number): string => {
    const seconds = blocks * 12;
    if (seconds >= 86400 * 7) return `~${(seconds / 86400 / 7).toFixed(1)} weeks`;
    if (seconds >= 86400) return `~${(seconds / 86400).toFixed(1)} days`;
    if (seconds >= 3600) return `~${(seconds / 3600).toFixed(1)} hours`;
    if (seconds >= 60) return `~${(seconds / 60).toFixed(0)} min`;
    return `~${seconds}s`;
  };
  
  /** Format seconds to countdown string (e.g. "2d 5h 12m") */
  export const formatCountdown = (seconds: number): string => {
    if (seconds <= 0) return 'Now';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0 || parts.length === 0) parts.push(`${m}m`);
    return parts.join(' ');
  };
  