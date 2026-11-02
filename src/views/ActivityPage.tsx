"use client";

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG } from '../contracts/config';

interface ActivityPageProps {
  navigate: (route: string) => void;
}

export const ActivityPage: React.FC<ActivityPageProps> = ({ navigate }) => {
  const { activity } = useWeb3();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = activity.filter((evt) => {
    if (filterType === 'all') return true;
    if (filterType === 'mints') return evt.type === 'mint_free' || evt.type === 'mint_paid';
    return evt.type === filterType;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'mint_free':
        return <span className="rounded bg-cyan-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-400/30">FREE MINT</span>;
      case 'mint_paid':
        return <span className="rounded bg-purple-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-300 border border-purple-500/30">PAID MINT</span>;
      case 'sale':
        return <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-500/30">SALE</span>;
      case 'listing':
        return <span className="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-300 border border-blue-500/30">LISTING</span>;
      case 'offer':
        return <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300 border border-amber-500/30">OFFER</span>;
      case 'forge':
        return <span className="rounded bg-pink-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-pink-300 border border-pink-500/30">FORGE EVOLUTION</span>;
      case 'reward_claim':
        return <span className="rounded bg-teal-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-300 border border-teal-500/30">REWARD CLAIM</span>;
      default:
        return <span className="rounded bg-slate-700 px-2 py-0.5 font-mono text-[10px] text-slate-300">{type}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#080b18] text-white pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="eyebrow flex items-center gap-2">
              <span className="pulse-dot" />
              LIVE TELEMETRY
            </div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
              Blockchain <span className="gradient-text">Activity Feed</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 font-sans max-w-xl">
              Live chronological stream of on-chain operations on BNB Smart Chain across minting, marketplace sales, offers, and Forge burns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-xs text-emerald-400">Real-Time Synced</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {[
            { label: 'All Events', key: 'all' },
            { label: 'Mints', key: 'mints' },
            { label: 'Sales', key: 'sale' },
            { label: 'Listings', key: 'listing' },
            { label: 'Offers', key: 'offer' },
            { label: 'Forge Activity', key: 'forge' },
            { label: 'Reward Claims', key: 'reward_claim' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilterType(item.key)}
              className={`rounded-xl px-3.5 py-1.5 font-mono text-xs transition-colors ${
                filterType === item.key
                  ? 'border border-cyan-400/40 bg-cyan-400/20 text-cyan-300 font-bold'
                  : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Real-Time Table */}
        <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10 bg-[#0c1022] shadow-2xl">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-white/10 bg-white/[0.03] text-slate-400">
              <tr>
                <th className="py-4 px-6">Event Type</th>
                <th className="py-4 px-6">Character</th>
                <th className="py-4 px-6">Value</th>
                <th className="py-4 px-6">Wallet Address</th>
                <th className="py-4 px-6">Transaction Hash</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono text-xs">
                    ⚡ No transactions recorded yet. Live transactions from minting, marketplace sales, and listings will stream here in real time.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    {getEventBadge(evt.type)}
                  </td>
                  <td className="py-4 px-6">
                    {evt.tokenId ? (
                      <button
                        onClick={() => navigate(`/nft/${evt.tokenId}`)}
                        className="font-display font-bold text-white hover:text-cyan-300"
                      >
                        PB-{String(evt.tokenId).padStart(4, '0')}
                      </button>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-cyan-300 font-bold">
                    {evt.amount ? (evt.amount.includes('XP') ? evt.amount : `${evt.amount} BNB`) : '—'}
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    <span className="rounded bg-white/5 px-2 py-1">
                      {evt.wallet.slice(0, 6)}...{evt.wallet.slice(-4)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    <a
                      href={`${CONTRACT_CONFIG.bscScanUrl}/tx/${evt.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                    >
                      {evt.txHash.slice(0, 10)}... ↗
                    </a>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="flex items-center justify-end gap-1.5 text-emerald-400 text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Confirmed
                    </span>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
