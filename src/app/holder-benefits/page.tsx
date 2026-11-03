import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ShieldAlert, Sparkles } from 'lucide-react';

type Slice = {
  label: string;
  percentage: number;
  tokens: number;
  color: string;
};

const MAX_SUPPLY = 21_000_000;

const supplyAllocation: Slice[] = [
  { label: 'Presale', percentage: 25, tokens: 5_250_000, color: '#22d3ee' },
  { label: 'NFT rarity rewards', percentage: 20, tokens: 4_200_000, color: '#a3e635' },
  { label: 'Marketing', percentage: 20, tokens: 4_200_000, color: '#fb7185' },
  { label: 'Team', percentage: 15, tokens: 3_150_000, color: '#fbbf24' },
  { label: 'Liquidity', percentage: 10, tokens: 2_100_000, color: '#60a5fa' },
  { label: 'Community participation', percentage: 5, tokens: 1_050_000, color: '#c084fc' },
  { label: 'Future ecosystem rewards', percentage: 5, tokens: 1_050_000, color: '#34d399' },
];

const communityAllocation: Slice[] = [
  { label: 'NFT rarity rewards', percentage: 66.6667, tokens: 4_200_000, color: '#a3e635' },
  { label: 'Community participation', percentage: 16.66665, tokens: 1_050_000, color: '#c084fc' },
  { label: 'Future ecosystem rewards', percentage: 16.66665, tokens: 1_050_000, color: '#34d399' },
];

const tgeAllocation: Slice[] = [
  { label: 'Presale unlocked', percentage: 25, tokens: 5_250_000, color: '#22d3ee' },
  { label: 'Community unlocked', percentage: 9, tokens: 1_890_000, color: '#a3e635' },
  { label: 'Team unlocked', percentage: 0.75, tokens: 157_500, color: '#fbbf24' },
  { label: 'Liquidity reserve', percentage: 10, tokens: 2_100_000, color: '#60a5fa' },
  { label: 'Other locked allocations', percentage: 55.25, tokens: 11_602_500, color: '#fb7185' },
];

function formatTokens(tokens: number) {
  return new Intl.NumberFormat('en-US').format(tokens);
}

function pieStyle(slices: Slice[]): CSSProperties {
  let stop = 0;
  const gradient = slices.map((slice) => {
    const start = stop;
    stop += slice.percentage;
    return `${slice.color} ${start}% ${stop}%`;
  }).join(', ');

  return { background: `conic-gradient(${gradient})` };
}

function AllocationChart({
  title,
  description,
  slices,
  centerTop,
  centerBottom,
}: {
  title: string;
  description: string;
  slices: Slice[];
  centerTop: string;
  centerBottom: string;
}) {
  return (
    <section className="border-t border-white/10 pt-5">
      <h3 className="font-display text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 min-h-10 text-sm leading-5 text-slate-400">{description}</p>
      <div className="mt-5 grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(190px,0.8fr)_1fr]">
        <div
          role="img"
          aria-label={`${title}: ${slices.map((slice) => `${slice.label} ${slice.percentage}%`).join(', ')}`}
          className="relative mx-auto aspect-square w-full max-w-[230px] rounded-full"
          style={pieStyle(slices)}
        >
          <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full border border-white/10 bg-[#080b18] text-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{centerTop}</span>
            <span className="mt-1 font-display text-xl font-black text-white">{centerBottom}</span>
          </div>
        </div>
        <ul className="space-y-3">
          {slices.map((slice) => (
            <li key={slice.label} className="grid grid-cols-[10px_1fr_auto] items-start gap-2 text-sm">
              <span className="mt-1.5 h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: slice.color }} />
              <span className="leading-5 text-slate-300">{slice.label}</span>
              <span className="text-right font-mono text-xs text-white">
                {slice.percentage}%<span className="block text-slate-500">{formatTokens(slice.tokens)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function HolderBenefitsPage() {
  return (
    <div className="min-h-screen bg-[#060813] pb-20 pt-28 text-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/mint" className="inline-flex items-center gap-2 font-mono text-xs font-bold text-slate-400 transition-colors hover:text-white">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          BACK TO MINT
        </Link>

        <header className="mt-7 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-emerald-300">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            Community token proposal
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-3xl font-black uppercase sm:text-5xl">
            Holder benefits <span className="text-emerald-300">& distribution</span>
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
            The proposed token plan reserves 30% of its maximum supply for NFT holders and community rewards. The allocations and release schedule below are proposals, not evidence of a deployed token or currently claimable rewards.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 font-mono text-xs">
            <span className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-slate-300">BNB Smart Chain · BEP-20 proposed</span>
            <span className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-slate-300">Maximum supply · {formatTokens(MAX_SUPPLY)}</span>
          </div>
        </header>

        <section className="grid gap-8 border-b border-white/10 py-8 md:grid-cols-3">
          <article>
            <p className="font-mono text-xs font-bold uppercase text-lime-300">01 / NFT holder rewards</p>
            <h2 className="mt-2 font-display text-2xl font-black">4,200,000 tokens</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">20% of maximum supply is proposed for rarity-based NFT rewards. Higher rarity may receive a higher multiplier.</p>
          </article>
          <article>
            <p className="font-mono text-xs font-bold uppercase text-violet-300">02 / Community participation</p>
            <h2 className="mt-2 font-display text-2xl font-black">1,050,000 tokens</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">5% is proposed for competitions, contributor incentives, events, ambassador programs, and educational initiatives.</p>
          </article>
          <article>
            <p className="font-mono text-xs font-bold uppercase text-emerald-300">03 / Future ecosystem</p>
            <h2 className="mt-2 font-display text-2xl font-black">1,050,000 tokens</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">5% is reserved in the proposal for future ecosystem development, partnerships, and participation incentives.</p>
          </article>
        </section>

        <section className="grid gap-10 py-9 lg:grid-cols-2">
          <AllocationChart
            title="Maximum supply allocation"
            description="Detailed allocation across the full proposed 21 million token supply. Community-related categories total 30%; marketing is a separate 20% category."
            slices={supplyAllocation}
            centerTop="Total supply"
            centerBottom="21.0M"
          />
          <AllocationChart
            title="Community pool composition"
            description="The 6.3 million community allocation is split between NFT rarity rewards, participation, and future ecosystem programs."
            slices={communityAllocation}
            centerTop="Community pool"
            centerBottom="6.3M"
          />
        </section>

        <section className="grid gap-10 border-t border-white/10 py-9 lg:grid-cols-2">
          <AllocationChart
            title="Planned TGE allocation"
            description="The TGE amounts sum to the full supply. Liquidity tokens are a reserve for a pool, not necessarily freely circulating tokens."
            slices={tgeAllocation}
            centerTop="At TGE plan"
            centerBottom="21.0M"
          />
          <div className="self-center border-l-2 border-emerald-300/60 pl-5">
            <p className="font-mono text-xs font-bold uppercase text-emerald-300">Proposed community release</p>
            <h2 className="mt-2 font-display text-2xl font-black">30% at TGE</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Of the 6,300,000-token community pool, 1,890,000 tokens are proposed to unlock at TGE and 4,410,000 to be distributed progressively under published reward and treasury policies.
            </p>
            <dl className="mt-5 space-y-3 font-mono text-xs">
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><dt className="text-slate-400">NFT rarity rewards at TGE</dt><dd className="text-white">1,260,000</dd></div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><dt className="text-slate-400">Community participation at TGE</dt><dd className="text-white">315,000</dd></div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><dt className="text-slate-400">Future ecosystem at TGE</dt><dd className="text-white">315,000</dd></div>
            </dl>
          </div>
        </section>

        <aside className="border-t border-amber-300/20 py-7">
          <div className="flex items-start gap-3 text-sm leading-6 text-amber-100/80">
            <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <p>
              These are proposed tokenomics, not active holder entitlements. The token contract, reward eligibility, NFT collection addresses, snapshot, rarity multipliers, claim timing, and distribution controls must be finalized and published before any rewards can be claimed. NFT ownership does not guarantee a token amount or financial return.
            </p>
          </div>
        </aside>

        <Link href="/mint" className="inline-flex items-center gap-2 border-b border-emerald-300/50 pb-1 font-mono text-xs font-bold text-emerald-200 transition-colors hover:text-white">
          Return to mint <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </main>
    </div>
  );
}