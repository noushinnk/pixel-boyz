"use client";

import React, { useState, useMemo } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { PixelBoyRenderer } from '../components/PixelBoyRenderer';
import { PixelBoyNFT, RarityTier } from '../types/nft';
import { CONTRACT_CONFIG } from '../contracts/config';

interface ExplorePageProps {
  navigate: (route: string) => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ navigate }) => {
  const { nfts, isConnected, connectWallet, buyNftFromMarketplace } = useWeb3();

  // Active featured character (default to Genesis #0001)
  const [featuredNft, setFeaturedNft] = useState<PixelBoyNFT>(() => nfts[0] || {} as PixelBoyNFT);
  const [isFavorited, setIsFavorited] = useState(false);

  // Filters & State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rarity_desc' | 'id_asc'>('id_asc');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Filtered and Sorted list
  const filteredNfts = useMemo(() => {
    return nfts
      .filter((nft) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = nft.name.toLowerCase().includes(query) || nft.tokenId.toLowerCase().includes(query);
          const matchTrait = Object.values(nft.traits).some((v) => String(v).toLowerCase().includes(query));
          if (!matchName && !matchTrait) return false;
        }
        if (selectedRarity !== 'all' && nft.rarity !== selectedRarity) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return parseFloat(a.price || '999') - parseFloat(b.price || '999');
        if (sortBy === 'price_desc') return parseFloat(b.price || '0') - parseFloat(a.price || '0');
        if (sortBy === 'rarity_desc') return b.rarityScore - a.rarityScore;
        return a.id - b.id;
      });
  }, [nfts, searchQuery, selectedRarity, sortBy]);

  const activeFloor = '0.001';

  return (
    <div className="min-h-screen bg-[#070913] text-white pt-24 pb-24 selection:bg-pink-500/30 selection:text-pink-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. HERO BANNER & STATS STRIP (MATCHES PHOTO HEADER)                       */}
        {/* ========================================================================= */}
        <div className="relative pt-6 pb-10">
          <div className="space-y-4 max-w-3xl">
            {/* Live Collection Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-950/30 px-3.5 py-1 text-xs font-mono font-bold text-pink-300">
              <span className="h-2 w-2 rounded-full bg-pink-400 animate-ping" />
              <span>GENESIS COLLECTION LIVE</span>
            </div>

            {/* Giant Title */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white">
              PIXEL <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">BOYZ</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              10,000 unique cybernetic operative warriors forged on BNB Smart Chain. Each character features evolvable armor upgrades, holographic weapons, on-chain Forge burning, and authentic pixel rarity.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate('/mint')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:brightness-110 hover:-translate-y-0.5 transition-all"
              >
                ⚡ Mint Now
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('collection-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-slate-200 hover:border-white/30 hover:bg-white/10 transition-all"
              >
                View Collection
              </button>
            </div>
          </div>

          {/* Stat Cells (Matches 10K, Floor, Owners, Vol in Photo) */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-6 font-mono">
            <div className="border-r border-white/10 pr-4">
              <div className="font-display text-2xl sm:text-3xl font-black text-white">10K</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">Total Supply</div>
            </div>
            <div className="border-r border-white/10 pr-4">
              <div className="font-display text-2xl sm:text-3xl font-black text-cyan-300">{activeFloor} BNB</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">Floor Price</div>
            </div>
            <div className="border-r border-white/10 pr-4">
              <div className="font-display text-2xl sm:text-3xl font-black text-purple-300">8.2K</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">Owners</div>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl font-black text-emerald-400">45 BNB</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 mt-0.5">Volume</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. FEATURED DROP SHOWCASE (MATCHES PHOTO SPOTLIGHT)                       */}
        {/* ========================================================================= */}
        <section className="mt-6 rounded-3xl border border-white/15 bg-[#0b0e1e]/90 p-4 sm:p-7 shadow-2xl backdrop-blur-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Card: Artwork & Character Footer (Matches Rogue Samurai #4129) */}
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-white/15 bg-[#070a17]">
              {/* Top Badge */}
              <div className="absolute top-3 left-3 z-20">
                <span className="rounded-lg bg-red-600/90 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-lg flex items-center gap-1.5">
                  👑 {featuredNft.rarity || 'LEGENDARY'}
                </span>
              </div>

              {/* Main Artwork */}
              <div className="aspect-square w-full p-4 flex items-center justify-center">
                <PixelBoyRenderer
                  nft={featuredNft}
                  size="md"
                  showBadge={false}
                  hideTokenId={true}
                  hideRarity={true}
                />
              </div>

              {/* Character Details Footer Bar inside card */}
              <div className="border-t border-white/10 bg-[#060914]/90 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                      PIXEL BOYZ GENESIS
                    </span>
                    <h3 className="font-display text-lg font-bold text-white">
                      {featuredNft.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className="h-9 w-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-sm text-pink-400 hover:bg-white/10 transition-colors"
                    title="Favorite"
                  >
                    {isFavorited ? '❤️' : '🤍'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Rarity Score</span>
                    <span className="font-bold text-cyan-300">{featuredNft.rarityScore || 987.3}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Rank</span>
                    <span className="font-bold text-purple-300">#{featuredNft.id || 1}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Edition</span>
                    <span className="font-bold text-white">{featuredNft.id || 1}/10,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Spec Breakdown & Buy / View CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="eyebrow text-pink-400 font-bold">FEATURED DROP</span>
                <h2 className="mt-1 font-display text-3xl sm:text-4xl font-black uppercase text-white">
                  Cybernetic Operative
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  An elite rogue cybernetic operative from the Genesis collection. Features ultra-rare neural eye visors, circuit-enhanced plating, and an on-chain holographic weapon with evolvable blade extensions. Belongs to the top rarity tier.
                </p>
              </div>

              {/* Trait Rows (Pill Boxes matching photo) */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="flex items-center gap-2 text-slate-400">
                    <span>⚡</span> Armor Type
                  </span>
                  <span className="font-bold text-white">
                    {featuredNft.traits?.armor || 'Glassmorphism Chrome'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="flex items-center gap-2 text-slate-400">
                    <span>🗡️</span> Weapon
                  </span>
                  <span className="font-bold text-white">
                    {featuredNft.traits?.weapon || 'Holographic Katana'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="flex items-center gap-2 text-slate-400">
                    <span>👁️</span> Visor / Eyes
                  </span>
                  <span className="font-bold text-white">
                    {featuredNft.traits?.visor || 'Violet Cybernetic'}
                  </span>
                </div>
              </div>

              {/* Price & Action Box (Matches photo price strip) */}
              <div className="rounded-2xl border border-white/10 bg-[#060814] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Current Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-white">
                      {featuredNft.price ? `${featuredNft.price} BNB` : '0.001 BNB'}
                    </span>
                    <span className="text-xs text-slate-500">($0.65 USD)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/nft/${featuredNft.id}`)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 px-7 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:brightness-110 transition-all"
                  >
                    🛒 View / Trade
                  </button>
                </div>
              </div>

              {/* Watching Proof */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="flex -space-x-1.5">
                  <span className="inline-block h-5 w-5 rounded-full bg-cyan-500 border border-black" />
                  <span className="inline-block h-5 w-5 rounded-full bg-purple-500 border border-black" />
                  <span className="inline-block h-5 w-5 rounded-full bg-pink-500 border border-black" />
                </span>
                <span>47 people are watching this drop</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. FILTER BAR & CONTROLS (MATCHES PHOTO FILTER ROW)                       */}
        {/* ========================================================================= */}
        <div id="collection-grid" className="mt-14 scroll-mt-28">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10 font-mono text-xs">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200 hover:border-pink-500/50 transition-colors"
              >
                <span>⚡</span>
                <span>Filters {selectedRarity !== 'all' ? '(1)' : ''}</span>
              </button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-white/15 bg-[#0b0e1e] px-4 py-2 text-slate-200 focus:outline-none focus:border-pink-500"
              >
                <option value="id_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rarity_desc">Rarity: High to Low</option>
              </select>

              {/* Rarity Dropdown */}
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="rounded-xl border border-white/15 bg-[#0b0e1e] px-4 py-2 text-slate-200 focus:outline-none focus:border-pink-500"
              >
                <option value="all">Rarity: All</option>
                <option value="Mythic">Mythic</option>
                <option value="Legendary">Legendary</option>
                <option value="Epic">Epic</option>
                <option value="Rare">Rare</option>
              </select>

              {/* Search input */}
              <input
                type="text"
                placeholder="Search characters or traits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-white/15 bg-[#0b0e1e] px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500 w-44 sm:w-60"
              />
            </div>

            {/* Showing Count & View Toggle */}
            <div className="flex items-center justify-between md:justify-end gap-4 text-slate-400">
              <span>Showing {filteredNfts.length} of 10,000 NFTs</span>
              <div className="flex items-center rounded-xl border border-white/15 bg-white/5 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs ${
                    viewMode === 'grid' ? 'bg-pink-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  田
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs ${
                    viewMode === 'list' ? 'bg-pink-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="List View"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. CHARACTER CARDS GRID (MATCHES 4-COLUMN IN PHOTO, 2-COLUMN PHONE VIEW)   */}
          {/* ========================================================================= */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredNfts.map((nft) => (
              <div
                key={nft.id}
                onClick={() => setFeaturedNft(nft)}
                className={`group cursor-pointer rounded-2xl border transition-all duration-300 bg-[#0c1022] p-3 sm:p-4 flex flex-col justify-between ${
                  featuredNft.id === nft.id
                    ? 'border-pink-500 ring-2 ring-pink-500/50 shadow-[0_0_25px_rgba(236,72,153,0.3)]'
                    : 'border-white/10 hover:border-pink-500/50 hover:-translate-y-1'
                }`}
              >
                {/* Character Artwork */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#070a17]">
                  <PixelBoyRenderer nft={nft} size="md" />
                </div>

                {/* Character Name & Details */}
                <div className="mt-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-display font-bold text-white group-hover:text-pink-300 transition-colors truncate">
                      {nft.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      LV.{nft.level}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {nft.traits.weapon} · {nft.traits.armor}
                  </div>

                  {/* Price & Action */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">Price</span>
                      <span className="font-bold text-cyan-300">
                        {nft.price ? `${nft.price} BNB` : `${activeFloor} BNB`}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/nft/${nft.id}`);
                      }}
                      className="rounded-lg border border-pink-500/40 bg-pink-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-pink-300 hover:bg-pink-500 hover:text-white transition-all"
                    >
                      Buy / View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. TRENDING COLLECTIONS SECTION (MATCHES BOTTOM SECTION IN PHOTO)          */}
        {/* ========================================================================= */}
        <section className="mt-20 pt-10 border-t border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl font-black uppercase text-white">
              Trending Collections
            </h3>
            <span className="text-xs font-mono text-slate-400">24H Live Activity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
            {/* Card 1 */}
            <div className="rounded-2xl border border-white/10 bg-[#0c1022] p-4 flex items-center gap-4 hover:border-pink-500/40 transition-colors">
              <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-purple-950">
                <img src="/assets/aistudio/17_01ef732d.png" alt="Genesis Warriors" className="h-full w-full object-contain" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-white">Genesis Warriors</h4>
                <div className="text-slate-400 text-[11px]">Floor: <strong className="text-cyan-300">0.05 BNB</strong></div>
                <div className="text-slate-500 text-[10px]">24h Vol: 12.4 BNB</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-white/10 bg-[#0c1022] p-4 flex items-center gap-4 hover:border-pink-500/40 transition-colors">
              <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-blue-950">
                <img src="/assets/aistudio/18_6d72f8ce.png" alt="Shadow Clan" className="h-full w-full object-contain" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-white">Shadow Clan</h4>
                <div className="text-slate-400 text-[11px]">Floor: <strong className="text-cyan-300">0.08 BNB</strong></div>
                <div className="text-slate-500 text-[10px]">24h Vol: 18.2 BNB</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-white/10 bg-[#0c1022] p-4 flex items-center gap-4 hover:border-pink-500/40 transition-colors">
              <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-emerald-950">
                <img src="/assets/aistudio/26_95acd707.png" alt="Cyber Legion" className="h-full w-full object-contain" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display text-sm font-bold text-white">Cyber Legion</h4>
                <div className="text-slate-400 text-[11px]">Floor: <strong className="text-cyan-300">0.03 BNB</strong></div>
                <div className="text-slate-500 text-[10px]">24h Vol: 8.5 BNB</div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. HOW IT WORKS SECTION (MATCHES FOOTER IN PHOTO)                         */}
        {/* ========================================================================= */}
        <section className="mt-16 pt-10 border-t border-white/10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="eyebrow text-pink-400">ON-CHAIN WORKFLOW</span>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl font-black uppercase text-white">
              How It Works
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center space-y-2">
              <div className="text-2xl">🔗</div>
              <h5 className="font-display font-bold text-white">1. Connect Wallet</h5>
              <p className="text-[11px] text-slate-400 font-sans">Connect MetaMask, Binance Agentic Wallet, or Trust Wallet.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center space-y-2">
              <div className="text-2xl">🔍</div>
              <h5 className="font-display font-bold text-white">2. Browse & Discover</h5>
              <p className="text-[11px] text-slate-400 font-sans">Explore traits, rarity scores, on-chain weapons, and history.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center space-y-2">
              <div className="text-2xl">⚡</div>
              <h5 className="font-display font-bold text-white">3. Mint / Purchase</h5>
              <p className="text-[11px] text-slate-400 font-sans">Claim 2 free (Agentic) or mint at 0.001 BNB with instant settlement.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center space-y-2">
              <div className="text-2xl">🔥</div>
              <h5 className="font-display font-bold text-white">4. Collect & Evolve</h5>
              <p className="text-[11px] text-slate-400 font-sans">Burn catalysts in the Cyber Forge to elevate on-chain rarity tiers.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
