import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { useEndaomentGrantsMade } from '../../../hooks/useEndaomentGrantsMade';
import type { EndaomentGrantTransfer } from '../../../services/endaomentService';

const LOGO_FALLBACKS: Record<string, string> = {
  'American Heart Association': 'https://www.heart.org/-/media/Images/Logos/Global-Do-No-Edit/Header/AHA_Full.svg',
};

const USDC_DECIMALS = 6n;
const USDC_BASE = 10n ** USDC_DECIMALS;

function shortenHash(hash: string, head = 6, tail = 4) {
  if (!hash) return '';
  if (hash.length <= head + tail) return hash;
  return `${hash.slice(0, head)}...${hash.slice(-tail)}`;
}

function safeToBigInt(value: string): bigint {
  try {
    if (!value) return 0n;
    return BigInt(value);
  } catch {
    return 0n;
  }
}

function formatUsdc(raw: string | bigint | undefined) {
  const val = typeof raw === 'bigint' ? raw : safeToBigInt(raw ?? '');
  const integer = val / USDC_BASE;
  const frac = val % USDC_BASE;
  if (frac === 0n) return integer.toString();

  const frac2 = (frac * 100n) / USDC_BASE;
  const fracStr = frac2.toString().padStart(2, '0');
  return `${integer.toString()}.${fracStr}`;
}

function formatDate(utcIso: string | undefined) {
  if (!utcIso) return '';
  const date = new Date(utcIso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

function GrantsCarouselCard({ grant }: { grant: EndaomentGrantTransfer }) {
  const orgName = grant.destinationOrg?.name || 'Unknown org';
  const website = grant.destinationOrg?.website || '';
  const grantedRaw = safeToBigInt(grant.netAmount);
  const [logoSrc, setLogoSrc] = useState(grant.destinationOrg?.logo ?? null);

  const endaomentUrl = grant.destinationOrg?.ein
    ? `https://app.endaoment.org/orgs/${grant.destinationOrg.ein}`
    : null;

  return (
    <div
      data-grant-card="true"
      className="snap-start flex-shrink-0 w-[300px] sm:w-[340px] md:w-[360px] bg-white/5 border border-white/10 rounded-[22px] p-5 sm:p-6 flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.25)]"
    >
      {/* Header: logo + name + website */}
      <div className="flex items-center gap-3">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={`${orgName} logo`}
            className="h-16 w-16 rounded-xl object-contain bg-white p-1 shrink-0"
            loading="lazy"
            onError={() => setLogoSrc(LOGO_FALLBACKS[orgName] ?? null)}
          />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-white/40 text-xs">Logo</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-white leading-tight overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{orgName}</h3>
          {website && (
            <a
              href={/^https?:\/\//i.test(website) ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white/60 hover:text-white/90 text-sm transition mt-0.5"
              title="Visit website"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate max-w-[140px]">{website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
        </div>
      </div>

      {/* Description — full width */}
      <div className="flex-grow overflow-hidden mt-3">
        {grant.destinationOrg?.description && (
          <p className="text-white/55 text-xs leading-relaxed overflow-hidden">
            {grant.destinationOrg.description.slice(0, 120).trimEnd()}…
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="mt-2 pt-4 border-t border-white/10">
        <p className="text-white text-xs">Total granted</p>
        <p className="text-2xl md:text-3xl font-bold text-green-400">${formatUsdc(grantedRaw)}</p>
      </div>

      {/* Date + Tx with inline Etherscan link */}
      <div className="mt-3 text-xs text-white/50 space-y-1">
        <div>{formatDate(grant.createdAtUtc)}</div>
        <div className="flex items-center gap-1.5">
          <span>Etherscan:</span>
          <a
            href={grant.transactionHash ? `https://etherscan.io/tx/${grant.transactionHash}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-white/70 hover:text-white transition"
            title="View on Etherscan"
          >
            <span>{shortenHash(grant.transactionHash)}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Org Details button — Endaoment */}
      {endaomentUrl && (
        <a
          href={endaomentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-[14px] bg-gradient-to-r from-[rgba(255,107,107,0.12)] to-[rgba(255,142,83,0.12)] border border-[rgba(255,107,107,0.25)] text-[#ff6b6b] text-sm font-semibold hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200"
          aria-label="View org on Endaoment"
        >
          Organization details
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}


const GrantsMadeSection: React.FC = () => {
  const { data: grants, isLoading, error } = useEndaomentGrantsMade();

  const sortedGrants = useMemo(
    () =>
      [...(grants ?? [])].sort((a, b) => {
        const ta = Date.parse(a.createdAtUtc || '');
        const tb = Date.parse(b.createdAtUtc || '');
        return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
      }),
    [grants],
  );

  const shouldCenterCards = sortedGrants.length > 0 && sortedGrants.length <= 2;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [cardStepPx, setCardStepPx] = useState(340);

  useEffect(() => {
    if (shouldCenterCards) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLDivElement>('[data-grant-card="true"]');
    if (card) {
      const width = card.getBoundingClientRect().width;
      setCardStepPx(Math.round(width + 16)); // 16 = gap-4
    }
  }, [sortedGrants.length, shouldCenterCards]);

  const scrollByStep = (direction: 'left' | 'right') => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: direction === 'left' ? -cardStepPx : cardStepPx, behavior: 'smooth' });
  };

  const navButtons = (
    <>
      <button
        type="button"
        onClick={() => scrollByStep('left')}
        className="p-2 rounded-full bg-white/5 border border-white/10 text-white/90 hover:text-white hover:bg-white/10 transition"
        aria-label="Previous grants"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByStep('right')}
        className="p-2 rounded-full bg-white/5 border border-white/10 text-white/90 hover:text-white hover:bg-white/10 transition"
        aria-label="Next grants"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </>
  );

  return (
    <section className="bg-white/[.02] py-[60px] px-4 sm:px-6" id="grants-made">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-center font-bold mb-1 bg-gradient-to-r from-[#ff6b6b] to-[#ffd93d] bg-clip-text text-transparent text-[2rem] md:text-5xl leading-relaxed">
          Charity
        </h2>
        <p className="text-center text-white/80 text-lg md:text-xl font-medium mb-4">Check out the gud we've accomplished!</p>
        <div className="flex justify-center mb-8">
          <a
            href="https://app.endaoment.org/gud"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[rgba(255,107,107,0.1)] to-[rgba(255,142,83,0.1)] border border-[rgba(255,107,107,0.3)] py-2 px-5 rounded-[30px] text-[#ff6b6b] text-sm font-semibold transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5"
          >
            Visit the Gud Fund on Endaoment
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {!shouldCenterCards && (
          <div className="hidden md:flex items-center justify-end gap-3 mb-4">{navButtons}</div>
        )}

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden pb-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="snap-start flex-shrink-0 w-[320px] sm:w-[360px] bg-white/5 border border-white/10 rounded-[22px] p-5 sm:p-6 animate-pulse"
              >
                <div className="h-14 w-14 rounded-xl bg-white/10 mb-4" />
                <div className="h-5 w-2/3 bg-white/10 rounded mb-2" />
                <div className="h-4 w-full bg-white/10 rounded mb-3" />
                <div className="h-4 w-1/2 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-white/70">
            Failed to load grants. Please try again later.
          </div>
        ) : sortedGrants.length === 0 ? (
          <div className="py-8 text-center text-white/70">
            No approved grants found for Gud Fund yet.
          </div>
        ) : shouldCenterCards ? (
          <div className="flex flex-wrap items-stretch justify-center gap-4">
            {sortedGrants.map((grant) => (
              <GrantsCarouselCard key={grant.id} grant={grant} />
            ))}
          </div>
        ) : (
          <>
            <div
              ref={scrollerRef}
              className="overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex gap-4 snap-x snap-mandatory">
                {sortedGrants.map((grant) => (
                  <GrantsCarouselCard key={grant.id} grant={grant} />
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-white/50">{sortedGrants.length} approved grants</p>
              <div className="md:hidden flex items-center gap-3">{navButtons}</div>
              <p className="text-xs text-white/50 hidden md:block">Scroll to browse</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default GrantsMadeSection;
