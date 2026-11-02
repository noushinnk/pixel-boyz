"use client";

import React, { useState, useMemo } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { PixelBoyRenderer } from '../components/PixelBoyRenderer';
import { CONTRACT_CONFIG } from '../contracts/config';

interface MarketplacePageProps {
  navigate: (route: string) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ navigate }) => {
  const {
    account,
    isConnected,
    connectWallet,
    nfts,
    userNfts,
    activity,
    buyNftFromMarketplace,
    cancelNftListing,
    listNftForSale
  } = useWeb3();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('price_asc');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Quick List Modal for owned unlisted NFTs
  const [listModalOpen, setListModalOpen] = useState(false);
  const [selectedTokenToList, setSelectedTokenToList] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState('0.05');

  // Filter listings
  const listedNfts = useMemo(() => {
    return nfts
      .filter((n) => n.isListed && n.price)
      .filter((n) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = n.name.toLowerCase().includes(q) || n.tokenId.toLowerCase().includes(q);
          const matchTrait = n.traits.archetype.toLowerCase().includes(q);
          if (!matchName && !matchTrait) return false;
        }
        if (levelFilter !== 'all' && n.level !== parseInt(levelFilter)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return parseFloat(a.price || '0') - parseFloat(b.price || '0');
        if (sortBy === 'price_desc') return parseFloat(b.price || '0') - parseFloat(a.price || '0');
        return b.id - a.id;
      });
  }, [nfts, searchQuery, levelFilter, sortBy]);

  // Dynamic real-time market stats from active listings and confirmed transactions
  const realSales = (activity || []).filter((a) => a.type === 'sale' && a.amount);
  const totalVolumeBnb = realSales.reduce((acc, a) => acc + parseFloat(a.amount || '0'), 0).toFixed(3);
  const floorPrice = listedNfts.length > 0 ? Math.min(...listedNfts.map((n) => parseFloat(n.price || '0'))).toFixed(3) : '0.000';
  const averagePrice = listedNfts.length > 0 ? (listedNfts.reduce((acc, n) => acc + parseFloat(n.price || '0'), 0) / listedNfts.length).toFixed(3) : '0.000';

  const handleBuy = async (tokenId: number) => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    const res = await buyNftFromMarketplace(tokenId);
    if (res.success) {
      setActionFeedback(`NFT purchased! Check your profile inventory.`);
    } else {
      setActionFeedback(`Failed: ${res.error}`);
    }
  };

  const handleListSubmit = async () => {
    if (!selectedTokenToList) return;
    const res = await listNftForSale(selectedTokenToList, customPrice);
    if (res.success) {
      setListModalOpen(false);
      setActionFeedback('Your Pixel Boy is now live on the marketplace!');
    }
  };

  const unlistedOwnedNfts = userNfts.filter((n) => !n.isListed);

  return (
    <div className="min-h-screen bg-[#080b18] text-white pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Marketplace Banner */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="eyebrow flex items-center gap-2">
              <span className="pulse-dot" />
              DECENTRALIZED EXCHANGE
            </div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
              Pixel Boyz <span className="gradient-text">Marketplace</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 font-sans max-w-2xl">
              Trade Pixel Boyz on BNB Smart Chain. 2.5% protocol fee goes directly to the community BNB rewards pool.
            </p>
          </div>

          {/* Quick List Action & External Marketplace */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://element.market/collections/pixel-boyz"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:brightness-110 hover:-translate-y-0.5 transition-all"
            >
              <span className="text-sm">⚡</span>
              <span>ELEMENT MARKETPLACE</span>
              <span className="text-cyan-200">↗</span>
            </a>

            {unlistedOwnedNfts.length > 0 && (
              <button
                onClick={() => {
                  setSelectedTokenToList(unlistedOwnedNfts[0].id);
                  setListModalOpen(true);
                }}
                className="neon-button text-xs py-3 px-5"
              >
                + LIST YOUR NFT ({unlistedOwnedNfts.length} Available)
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback */}
        {actionFeedback && (
          <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-950/40 p-4 font-mono text-xs text-cyan-300 flex items-center justify-between">
            <span>{actionFeedback}</span>
            <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* MARKET STATS BAR */}
        <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-[#0c1022] p-5 sm:grid-cols-4 font-mono text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-widest text-[10px]">Floor Price</span>
            <div className="mt-1 font-display text-2xl font-bold text-cyan-300">
              {floorPrice} {floorPrice !== '—' && 'BNB'}
            </div>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-widest text-[10px]">Active Listings</span>
            <div className="mt-1 font-display text-2xl font-bold text-white">
              {listedNfts.length}
            </div>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-widest text-[10px]">Avg Listing Price</span>
            <div className="mt-1 font-display text-2xl font-bold text-purple-300">
              {averagePrice} {averagePrice !== '—' && 'BNB'}
            </div>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-widest text-[10px]">Protocol Fee</span>
            <div className="mt-1 font-display text-2xl font-bold text-emerald-400">
              2.5%
            </div>
            <span className="text-[10px] text-slate-500">→ Staking Pool</span>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="Search listings by name or trait..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-[#0e142c] px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5</option>
            </select>
          </div>

          <div className="sm:col-span-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-white/15 bg-[#0e142c] px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="price_asc">Price: Lowest First</option>
              <option value="price_desc">Price: Highest First</option>
              <option value="newest">Newest Listings</option>
            </select>
          </div>
        </div>

        {/* LISTINGS GRID */}
        {listedNfts.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-white/10 bg-[#0c1022] p-12 text-center">
            <div className="text-4xl">⚡</div>
            <h3 className="mt-4 font-display text-xl font-bold uppercase text-white">
              No Active Marketplace Listings
            </h3>
            <p className="mt-2 text-xs font-mono text-slate-400 max-w-md mx-auto">
              Real-time trading is live! Be the first to list a Pixel Boy from your inventory or mint a new operative.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a
                href="https://element.market/collections/pixel-boyz"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:brightness-110 hover:-translate-y-0.5 transition-all"
              >
                <span>⚡ Trade on Element Marketplace</span>
                <span>↗</span>
              </a>
              {unlistedOwnedNfts.length > 0 ? (
                <button
                  onClick={() => {
                    setSelectedTokenToList(unlistedOwnedNfts[0].id);
                    setListModalOpen(true);
                  }}
                  className="neon-button text-xs py-3 px-6"
                >
                  + List One of Your {unlistedOwnedNfts.length} Character(s)
                </button>
              ) : (
                <button
                  onClick={() => navigate('/mint')}
                  className="ghost-button text-xs py-3 px-6"
                >
                  Mint A Character To Trade ↗
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listedNfts.map((nft) => {
              const isOwner = Boolean(account && nft.owner.toLowerCase() === account.toLowerCase());
              const priceNum = parseFloat(nft.price || '0');
              const fee = (priceNum * (CONTRACT_CONFIG.marketplaceFeePercent / 100)).toFixed(4);
              const sellerNet = (priceNum * (1 - CONTRACT_CONFIG.marketplaceFeePercent / 100)).toFixed(4);

              return (
                <div
                  key={nft.id}
                  className="rounded-2xl border border-white/10 bg-[#0c1022] p-4 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-2xl flex flex-col justify-between"
                >
                  <div
                    onClick={() => navigate(`/nft/${nft.id}`)}
                    className="cursor-pointer"
                  >
                    <PixelBoyRenderer nft={nft} size="md" />

                    <div className="mt-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-sm font-bold text-white hover:text-cyan-300 transition-colors">
                          {nft.name}
                        </h3>
                        <span className="font-mono text-xs text-cyan-300 font-bold">
                          LV.{nft.level}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {nft.traits.archetype} · {nft.traits.weapon}
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Area */}
                  <div className="mt-5 pt-4 border-t border-white/10">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">
                          Price
                        </span>
                        <span className="font-display text-lg font-black text-cyan-300">
                          {nft.price} BNB
                        </span>
                      </div>
                      <div className="text-right text-[10px] font-mono text-slate-400">
                        <span>Net: {sellerNet} BNB</span>
                      </div>
                    </div>

                    {isOwner ? (
                      <button
                        onClick={() => cancelNftListing(nft.id)}
                        className="w-full rounded-xl border border-red-500/30 bg-red-950/20 py-2.5 font-mono text-xs text-red-300 hover:bg-red-950/50 transition-colors"
                      >
                        Cancel Listing
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleBuy(nft.id)}
                          className="neon-button text-xs py-2.5 px-2 text-center"
                        >
                          BUY NOW
                        </button>
                        <button
                          onClick={() => navigate(`/nft/${nft.id}`)}
                          className="ghost-button text-xs py-2.5 px-2 text-center"
                        >
                          OFFER
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK LIST MODAL */}
      {listModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-cyan-400/40 bg-[#0d1226] p-6 shadow-2xl">
            <button
              onClick={() => setListModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white font-mono text-lg"
            >
              ✕
            </button>
            <div className="eyebrow">MARKETPLACE LISTING</div>
            <h3 className="mt-1 font-display text-2xl font-bold uppercase text-white">
              List For Sale
            </h3>

            <div className="mt-6 space-y-4">
              <div>
                <label className="font-mono text-xs text-slate-300 block mb-2">
                  Select NFT to List
                </label>
                <select
                  value={selectedTokenToList || ''}
                  onChange={(e) => setSelectedTokenToList(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/15 bg-[#0e142c] px-3.5 py-3 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                >
                  {unlistedOwnedNfts.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} (LV.{n.level} - {n.traits.archetype})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-xs text-slate-300 block mb-2">
                  Price in BNB
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-lg font-mono text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Marketplace Protocol Fee (2.5%)</span>
                  <span className="text-cyan-300 font-bold">
                    {(parseFloat(customPrice || '0') * 0.025).toFixed(4)} BNB
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 font-bold pt-2 border-t border-white/5">
                  <span>Estimated Seller Proceeds</span>
                  <span className="text-emerald-400">
                    {(parseFloat(customPrice || '0') * 0.975).toFixed(4)} BNB
                  </span>
                </div>
              </div>

              <button
                onClick={handleListSubmit}
                disabled={parseFloat(customPrice) <= 0}
                className="neon-button w-full py-4 text-xs font-bold"
              >
                CONFIRM LISTING ON BSC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
