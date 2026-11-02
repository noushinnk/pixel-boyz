"use client";

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { PixelBoyRenderer } from '../components/PixelBoyRenderer';
import { CONTRACT_CONFIG } from '../contracts/config';

interface HomePageProps {
  navigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const {
    account,
    isConnected,
    connectWallet,
    nfts,
    totalMinted,
    userProfile,
    rewardsPoolBnb,
    activity,
    userClaimableBnb
  } = useWeb3();

  // Active character image selector (1st image default)
  const heroImages = [
    { src: '/assets/aistudio/pixil-frame-0__5__45747249.png', label: 'Pixel Boy Genesis' },
    { src: '/assets/aistudio/17_01ef732d.png', label: 'Pixel Boy First' },
    { src: '/assets/aistudio/18_6d72f8ce.png', label: 'Pixel Boy Captain' },
    { src: '/assets/aistudio/26_95acd707.png', label: 'Pixel Boy Nomad' },
    { src: '/assets/aistudio/35_3bc87fd1.png', label: 'Pixel Boy Pro' },
    { src: '/assets/aistudio/56_1643a0f0.png', label: 'Pixel Boy Operative' },
    { src: '/assets/aistudio/57_66af4ba5.png', label: 'Pixel Boy Synth' },
    { src: '/assets/aistudio/1005_8f11a7d5.png', label: 'Pixel Boy Centurion' },
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeHero = heroImages[activeImageIndex] || heroImages[0];

  // Real-time market listings
  const activeListings = nfts.filter((n) => n.isListed && n.price);
  const floorPrice = activeListings.length > 0
    ? Math.min(...activeListings.map((n) => parseFloat(n.price || '0'))).toFixed(3)
    : '—';

  return (
    <div className="min-h-screen bg-[#060813] text-white">
      {/* HERO SECTION - Responsive, Zero Cut-offs */}
      <section className="hero-grid relative pt-20 sm:pt-28 pb-12 sm:pb-20">
        {/* Glow Spheres */}
        <div className="absolute top-10 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 h-80 w-80 rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />

        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:gap-12 px-3 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          {/* Left Hero Content */}
          <div className="relative z-10 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3 py-1 text-[11px] sm:text-xs font-mono text-cyan-300 backdrop-blur-md">
              <span className="pulse-dot" />
              <span>BNB CHAIN ECOSYSTEM · 10,000 PIXEL BOYZ</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.95] tracking-tight">
              10,000 <br />
              <span className="gradient-text">unique</span> <br />
              characters.
            </h1>

            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-slate-300 font-sans">
              One decentralized universe on BNB Smart Chain. Collect, evolve through on-chain Forge burning, earn rewards, and trade directly on the real-time marketplace.
            </p>

            {/* Action CTAs: Exactly 2 clean buttons (No duplicate connect button) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/mint')}
                className="neon-button text-xs sm:text-sm py-3 px-6 sm:px-7"
              >
                MINT NOW <span>↗</span>
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="ghost-button text-xs sm:text-sm py-3 px-6 sm:px-7"
              >
                EXPLORE COLLECTION
              </button>
            </div>

            {/* Real Protocol Metrics: Responsive 2-to-3 columns so nothing overflows on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 pt-5 border-t border-white/10 text-xs font-mono">
              <div className="rounded-xl bg-white/[0.02] p-2.5 sm:p-0 sm:bg-transparent">
                <div className="text-slate-500 uppercase tracking-widest text-[9px] sm:text-[10px]">Mint Price</div>
                <div className="mt-0.5 font-display text-lg sm:text-xl font-bold text-white">—</div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold truncate">READ FROM CONTRACT</div>
              </div>
              <div className="rounded-xl bg-white/[0.02] p-2.5 sm:p-0 sm:bg-transparent">
                <div className="text-slate-500 uppercase tracking-widest text-[9px] sm:text-[10px]">Free Allocation</div>
                <div className="mt-0.5 font-display text-lg sm:text-xl font-bold text-white">6,000</div>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Merkle Verified</div>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-xl bg-white/[0.02] p-2.5 sm:p-0 sm:bg-transparent">
                <div className="text-slate-500 uppercase tracking-widest text-[9px] sm:text-[10px]">Network</div>
                <div className="mt-0.5 font-display text-lg sm:text-xl font-bold text-emerald-400">BNB Chain</div>
                <div className="text-[9px] sm:text-[10px] text-slate-400">Chain ID 56</div>
              </div>
            </div>
          </div>

          {/* Right Hero Artwork Composition: Clean, NO Rarity, NO TokenID as instructed */}
          <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[420px] lg:max-w-[440px]">
            <div className="relative rounded-3xl border border-cyan-400/40 bg-[#0c1228]/90 p-3 sm:p-4 shadow-2xl backdrop-blur-2xl">
              {/* Clean Character Frame without Rarity or TokenID */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-radial from-[#1e293b]/50 to-[#070a17] flex items-center justify-center p-3 sm:p-4">
                <div className="scanlines absolute inset-0 z-10 opacity-30 pointer-events-none" />
                <img
                  src={activeHero.src}
                  alt={activeHero.label}
                  className="pixel-art h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Character Selector Thumbnails Bar */}
              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
                  Select Model:
                </span>
                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
                  {heroImages.map((img, idx) => (
                    <button
                      key={img.src}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg overflow-hidden border transition-all shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-cyan-400 ring-2 ring-cyan-400/60 scale-105'
                          : 'border-white/15 opacity-60 hover:opacity-100 hover:border-white/40'
                      }`}
                      title={img.label}
                    >
                      <img src={img.src} alt={img.label} className="pixel-art h-full w-full object-contain bg-[#090d1f]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:gap-4 px-3 py-6 sm:grid-cols-4 sm:px-6 lg:px-8">
          <div className="stat-cell">
            <div className="font-display text-xl sm:text-3xl font-black text-white">10,000</div>
            <div className="mt-1 text-[10px] sm:text-[11px] tracking-widest text-slate-500 font-mono">TOTAL SUPPLY</div>
          </div>
          <div className="stat-cell">
            <div className="font-display text-xl sm:text-3xl font-black text-cyan-300">
              {totalMinted.toLocaleString()}
            </div>
            <div className="mt-1 text-[10px] sm:text-[11px] tracking-widest text-slate-500 font-mono">MINTED CHARACTERS</div>
          </div>
          <div className="stat-cell">
            <div className="font-display text-xl sm:text-3xl font-black text-purple-300">
              {activeListings.length}
            </div>
            <div className="mt-1 text-[10px] sm:text-[11px] tracking-widest text-slate-500 font-mono">ACTIVE MARKET LISTINGS</div>
          </div>
          <div className="stat-cell">
            <div className="font-display text-xl sm:text-3xl font-black text-emerald-400">
              {rewardsPoolBnb} BNB
            </div>
            <div className="mt-1 text-[10px] sm:text-[11px] tracking-widest text-slate-500 font-mono">COMMUNITY STAKING POOL</div>
          </div>
        </div>
      </section>

      {/* SECTION 1: NFT COLLECTION GALLERY */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-12 sm:py-20 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="eyebrow flex items-center gap-2">
              <span className="pulse-dot" />
              NFT COLLECTION
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-4xl font-bold uppercase">
              Authentic <span className="gradient-text">Pixel Boyz</span>
            </h2>
            <p className="mt-1 text-xs font-mono text-slate-400">
              On-chain ERC-721 digital collectibles deployed directly on BNB Smart Chain.
            </p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="ghost-button text-xs self-start sm:self-auto"
          >
            VIEW ALL CHARACTERS <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {nfts.slice(0, 4).map((nft) => (
            <div
              key={nft.id}
              onClick={() => navigate(`/nft/${nft.id}`)}
              className="cursor-pointer group rounded-3xl border border-white/10 bg-[#0c1022] p-4 transition-all duration-300 hover:border-cyan-400/50 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.6)]"
            >
              <PixelBoyRenderer nft={nft} size="md" />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h4 className="font-display text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {nft.name}
                  </h4>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {nft.traits.archetype} · LV.{nft.level}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    nft.isListed ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {nft.isListed && nft.price ? `${nft.price} BNB` : 'Unlisted'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: REAL-TIME MARKETPLACE & TRANSACTIONS */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-12 sm:py-16 lg:px-8 border-t border-white/10">
        <div className="rounded-3xl border border-cyan-400/30 bg-[#0d1226] p-5 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
            {/* Left Card: Real-time Market Card */}
            <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#080b18] p-4 sm:p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
                <span className="text-slate-400">Market Status</span>
                <span className="text-cyan-300 font-bold">2.5% Staking Fee</span>
              </div>

              <div className="mt-4">
                {nfts[1] || nfts[0] ? (
                  <PixelBoyRenderer nft={nfts[1] || nfts[0]} size="md" />
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-center font-mono text-xs text-slate-500">
                    LIVE INDEXER DATA REQUIRED
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl bg-white/[0.02] p-3 sm:p-4 border border-white/5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Floor Price</span>
                    <span className="font-display text-xl sm:text-2xl font-black text-cyan-300">{floorPrice} BNB</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Protocol Fee</span>
                    <span className="font-bold text-emerald-400">2.5% Pool</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="neon-button text-xs py-2.5"
                  >
                    BUY / BROWSE
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="ghost-button text-xs py-2.5"
                  >
                    LIST NFT
                  </button>
                </div>
              </div>
            </div>

            {/* Right Information: Real-Time Buy, Sell & Listing */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="eyebrow">DECENTRALIZED MARKETPLACE</div>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
                Fastest Real-Time Buy, Sell & Listings
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                Experience instant, non-custodial trading on BNB Smart Chain. When an operative is listed or purchased, ownership, listings, and the 2.5% community staking pool update synchronously in real-time.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 font-mono text-xs">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
                  <span className="text-slate-500 uppercase text-[9px] sm:text-[10px] block">Settlement Speed</span>
                  <div className="mt-1 font-display text-lg sm:text-xl font-bold text-white">Instant Block</div>
                  <span className="text-[9px] sm:text-[10px] text-cyan-400">Zero waiting lag</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
                  <span className="text-slate-500 uppercase text-[9px] sm:text-[10px] block">Community Share</span>
                  <div className="mt-1 font-display text-lg sm:text-xl font-bold text-emerald-400">100% Staked</div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400">Distributed via rewards</span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="neon-button text-xs py-3 px-6"
                >
                  ENTER MARKETPLACE ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: REAL-TIME ON-CHAIN ACTIVITY STREAM */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-12 sm:py-16 lg:px-8 border-t border-white/10">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <div className="eyebrow flex items-center gap-2">
              <span className="pulse-dot" />
              LIVE TELEMETRY
            </div>
            <h2 className="font-display text-xl sm:text-3xl font-bold uppercase mt-1">
              Real-Time On-Chain Transactions
            </h2>
          </div>
          <button
            onClick={() => navigate('/activity')}
            className="ghost-button text-xs"
          >
            VIEW FULL FEED →
          </button>
        </div>

        {activity.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 sm:p-12 text-center font-mono">
            <span className="text-3xl block mb-3">⚡</span>
            <h4 className="text-white text-sm font-bold uppercase">Ready For Real-Time Activity</h4>
            <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
              Transactions executed during minting, marketplace trading, and forge evolutions appear here in real time.
            </p>
            <div className="mt-4">
              <button
                onClick={() => navigate('/mint')}
                className="neon-button text-xs py-2 px-4"
              >
                Mint To Trigger First Transaction ↗
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {activity.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-white/10 bg-[#090d1f] p-3.5 sm:p-4 gap-2.5 sm:gap-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    act.type === 'mint_free' || act.type === 'mint_paid'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : act.type === 'sale'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {act.type.toUpperCase().replace('_', ' ')}
                  </span>
                  <span className="text-slate-300">
                    {act.wallet ? `${act.wallet.slice(0, 6)}...${act.wallet.slice(-4)}` : 'System'}
                  </span>
                  {act.tokenId && (
                    <span className="text-slate-400">
                      Token #{act.tokenId}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 text-right">
                  <span className="text-cyan-300 font-bold">{act.amount} BNB</span>
                  <a
                    href={`https://bscscan.com/tx/${act.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-cyan-400 text-[11px]"
                  >
                    BscScan ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER CTA */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 pb-20 sm:pb-28 pt-6 sm:pt-8 lg:px-8">
        <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-[#101e40] via-[#0b1022] to-[#060813] p-6 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid items-center gap-6 sm:gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <div className="eyebrow">JOIN THE UNIVERSE</div>
              <h2 className="mt-2 sm:mt-3 font-display text-2xl sm:text-5xl font-black uppercase tracking-tight">
                Your character <br />
                <span className="gradient-text">is waiting.</span>
              </h2>
              <p className="mt-2 sm:mt-3 max-w-md text-xs sm:text-sm text-slate-400 font-sans">
                Mint your Pixel Boy, connect with the community, and begin your journey on BNB Smart Chain today.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/mint')}
                className="neon-button text-xs py-3 px-6 sm:px-7"
              >
                ENTER MINT PORTAL <span>↗</span>
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="ghost-button text-xs py-3 px-6 sm:px-7"
              >
                BROWSE GALLERY
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
