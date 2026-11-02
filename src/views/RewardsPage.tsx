"use client";

import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG } from '../contracts/config';

interface RewardsPageProps {
  navigate: (route: string) => void;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({ navigate }) => {
  const {
    account,
    isConnected,
    connectWallet,
    userProfile,
    rewardsPoolBnb,
    userClaimableBnb,
    claimRewardsPool,
    nfts
  } = useWeb3();

  const [claiming, setClaiming] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Playground' | 'Quests' | 'Armory' | 'Rankings' | 'Vault' | 'Community' | 'Shop' | 'Settings'>('Dashboard');
  const [downloadPaused, setDownloadPaused] = useState(false);

  const currentEpoch = 4;
  const isEpochAlreadyClaimed = userProfile.claimedEpochs.includes(currentEpoch);

  const handleClaim = () => {
    setClaimFeedback('Coming soon — rewards are currently read-only.');
  };

  const myCollectionItems: Array<{
    title: string;
    category: string;
    progress: number;
    image: string;
  }> = [];
  const recentActivities: Array<{
    title: string;
    desc: string;
    progress: string;
    time: string;
    color: string;
    icon: string;
  }> = [];
  const achievements: Array<{
    title: string;
    xp: string;
    icon: string;
    color: string;
  }> = [];

  return (
    <div className="min-h-screen bg-[#070914] text-white pt-24 pb-20 selection:bg-purple-500/30 selection:text-purple-200">
      <div className="mx-auto max-w-[1550px] px-3 sm:px-6 lg:px-8">
        
        {/* Main Dashboard Layout Container (Matches the photo's tablet/desktop frame) */}
        <div className="rounded-[32px] border border-white/10 bg-[#090c1d] p-3 sm:p-6 shadow-2xl backdrop-blur-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* ========================================================================= */}
            {/* LEFT HUD SIDEBAR (MATCHES SIDEBAR IN PHOTO)                               */}
            {/* ========================================================================= */}
            <aside className="lg:col-span-2 hidden lg:flex flex-col justify-between rounded-3xl border border-white/10 bg-[#060815] p-4 font-mono text-xs">
              <div className="space-y-6">
                {/* Top Shield Crest Logo */}
                <div className="flex items-center gap-3 px-2 pt-2">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-700 to-cyan-500 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <div className="h-full w-full rounded-2xl bg-[#090c1b] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-300" fill="currentColor">
                        <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.14 8.79-7 9.94-3.86-1.15-7-5.4-7-9.94V7.3l7-3.12zM12 6.5l-3.5 3.5 1.41 1.41L12 9.33l2.09 2.08 1.41-1.41L12 6.5z" />
                      </svg>
                    </div>
                  </div>
                  <span className="font-display font-bold text-white tracking-widest text-sm">
                    NEXUS
                  </span>
                </div>

                {/* Sidebar Navigation Items */}
                <nav className="space-y-1.5">
                  {[
                    { label: 'Dashboard', icon: '🏠', route: '/rewards' },
                    { label: 'Playground', icon: '🎮', route: '/mint' },
                    { label: 'Quests', icon: '🎯', route: '/quests' },
                    { label: 'Armory', icon: '⚔️', route: '/forge' },
                    { label: 'Rankings', icon: '🏆', route: '/leaderboard' },
                    { label: 'Vault', icon: '📦', route: '/profile' },
                    { label: 'Community', icon: '👥', route: '/activity' },
                    { label: 'Shop', icon: '🛒', route: '/marketplace' },
                    { label: 'Settings', icon: '⚙️', route: '/admin' }
                  ].map((item) => {
                    const isActive = activeTab === item.label;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          setActiveTab(item.label as any);
                          navigate(item.route);
                        }}
                        className={`flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-left font-mono text-xs transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Level & XP Bar (Matches Level 28 in photo) */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xs">
                    🛡️
                  </div>
                  <div>
                    <span className="text-white font-bold text-xs block">—</span>
                    <span className="text-[10px] text-slate-400">LIVE PROFILE DATA REQUIRED</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>XP</span>
                    <span className="text-purple-300 font-bold">12,450 / 15,000</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[83%]" />
                  </div>
                </div>
              </div>
            </aside>

            {/* ========================================================================= */}
            {/* MAIN CONTENT AREA (CENTER + RIGHT COLUMNS)                                */}
            {/* ========================================================================= */}
            <main className="lg:col-span-10 space-y-5">
              
              {/* TOP HEADER ROW: Welcome back + Search Bar + Quick Icons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">WELCOME BACK,</span>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl font-black text-white">
                      {userProfile.username || 'Alex'}
                    </span>
                    <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/40">
                      Legend
                    </span>
                  </div>
                </div>

                {/* Search Bar Input */}
                <div className="flex-1 max-w-md mx-auto sm:mx-4 w-full">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">🔍</span>
                    <input
                      type="text"
                      placeholder="Search games, friends, achievements..."
                      className="w-full rounded-xl border border-white/10 bg-[#060814] pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Right Quick Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/mint')}
                    title="Mint Portal"
                    className="h-9 w-9 rounded-xl border border-white/10 bg-[#060814] flex items-center justify-center text-slate-300 hover:text-white hover:border-purple-500/50 transition-colors"
                  >
                    🎮
                  </button>
                  <button
                    onClick={() => navigate('/activity')}
                    title="Live Activity Telemetry"
                    className="h-9 w-9 rounded-xl border border-white/10 bg-[#060814] flex items-center justify-center text-slate-300 hover:text-white hover:border-purple-500/50 transition-colors relative"
                  >
                    🔔
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400" />
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    title="View Profile & Inventory"
                    className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-purple-400 bg-purple-900 shrink-0 hover:scale-105 transition-transform"
                  >
                    <img src="/assets/aistudio/pixil-frame-0__5__45747249.png" alt="Profile" className="pixel-art h-full w-full object-contain" />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-black" />
                  </button>
                </div>
              </div>

              {/* Feedback Alert if claimed */}
              {claimFeedback && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 font-mono text-xs text-emerald-300 flex items-center justify-between">
                  <span>🎉 {claimFeedback}</span>
                  <button onClick={() => setClaimFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
              )}

              {/* UPPER SECTION: FEATURED MISSION BANNER + MY COLLECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* 1. HERO MISSION BANNER: "NEXUS FRONTIER" (Matches big hero banner in photo) */}
                <div className="lg:col-span-8 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#12163b] via-[#0d102a] to-[#070918] p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                  {/* Cyber glow sphere */}
                  <div className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-purple-600/20 blur-[90px] pointer-events-none" />
                  
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-7 space-y-3">
                      <span className="inline-block rounded-full bg-cyan-500/20 px-3 py-1 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-400/40">
                        NOW ACTIVE
                      </span>
                      <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                        NEXUS <br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">FRONTIER</span>
                      </h2>
                      <p className="text-xs font-mono text-purple-300">
                        Online Co-op Staking Core · BNB Smart Chain
                      </p>
                      <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                        Unite. Fight. Conquer. The community rewards pool distributes revenue directly to active operatives on-chain.
                      </p>

                      <div className="flex items-center gap-3 pt-3">
                        <button
                          onClick={() => navigate('/mint')}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:brightness-110 transition-all"
                        >
                          MINT OPERATIVE ↗
                        </button>
                        <button
                          onClick={() => navigate('/quests')}
                          className="h-11 w-11 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                          title="Bookmark"
                        >
                          🔖
                        </button>
                      </div>
                    </div>

                    {/* Right side of Banner: Radial Gauge 72% (Matches photo circular gauge) */}
                    <div className="md:col-span-5 rounded-2xl border border-white/10 bg-[#070a1a]/80 p-5 space-y-4 font-mono text-xs text-center">
                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">MISSION PROGRESS</span>
                        <span className="font-bold text-white text-xs">CHAPTER 3: BREAKTHROUGH</span>
                      </div>

                      {/* SVG Radial Gauge */}
                      <div className="relative h-28 w-28 mx-auto flex items-center justify-center my-2">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-purple-400"
                            strokeDasharray="72, 100"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute font-display text-xl font-black text-white">72%</span>
                      </div>

                      <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-left">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">TIME PLAYED</span>
                          <span className="text-slate-200 font-bold">36h 15m</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">LAST PLAYED</span>
                          <span className="text-cyan-300 font-bold">Today</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. MY COLLECTION PANEL (Matches top right card in photo) */}
                <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#080b1a] p-5 shadow-2xl flex flex-col justify-between font-mono text-xs">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="font-display font-bold text-white tracking-wider">MY COLLECTION</span>
                      <button onClick={() => navigate('/explore')} className="text-purple-400 hover:text-purple-300 text-[11px]">
                        VIEW ALL
                      </button>
                    </div>

                    <div className="mt-3.5 space-y-3">
                      {myCollectionItems.map((item) => (
                        <div
                          key={item.title}
                          className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-2.5 hover:border-purple-500/40 hover:bg-white/[0.04] transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl overflow-hidden border border-white/15 bg-black shrink-0">
                              <img src={item.image} alt={item.title} className="pixel-art h-full w-full object-contain" />
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-white text-xs">{item.title}</h4>
                              <span className="text-[10px] text-slate-400 block">{item.category}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="h-1 w-20 rounded-full bg-slate-800 overflow-hidden">
                                  <div className="h-full bg-purple-400" style={{ width: `${item.progress}%` }} />
                                </div>
                                <span className="text-[9px] text-purple-300">{item.progress}%</span>
                              </div>
                            </div>
                          </div>
                          <button className="text-slate-500 hover:text-white px-2 text-sm">⋮</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE SECTION: RECENT ACTIVITIES (4 BADGES) + PLAYER PROFILE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* 3. RECENT ACTIVITIES (Matches 4 square badge cards in photo) */}
                <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-[#080b1a] p-5 shadow-2xl font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="font-display font-bold text-white tracking-wider">RECENT ACTIVITIES</span>
                    <button onClick={() => navigate('/quests')} className="text-purple-400 hover:text-purple-300 text-[11px]">
                      VIEW ALL
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    {recentActivities.map((act) => (
                      <div
                        key={act.title}
                        className={`rounded-2xl border p-3 flex flex-col justify-between space-y-2 ${act.color} transition-all hover:scale-[1.02]`}
                      >
                        <div className="text-2xl pt-1">{act.icon}</div>
                        <div>
                          <h5 className="font-display font-bold text-[10px] tracking-wider text-white truncate">{act.title}</h5>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{act.desc}</span>
                        </div>
                        <div className="pt-2 border-t border-white/10">
                          <span className="font-bold text-xs block text-white">{act.progress}</span>
                          <span className="text-[9px] text-slate-500 block">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. PLAYER PROFILE (Matches center-right profile card with waveform & stats) */}
                <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-[#080b1a] p-5 shadow-2xl font-mono text-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="font-display font-bold text-white tracking-wider">PLAYER PROFILE</span>
                      <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] text-slate-300">
                        This Week ▾
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Avatar with purple glowing ring */}
                      <div className="flex items-center gap-3.5">
                        <div className="relative h-16 w-16 rounded-full p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                          <div className="h-full w-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                            <img src="/assets/aistudio/pixil-frame-0__5__45747249.png" alt="Player" className="pixel-art h-full w-full object-contain" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-display text-lg font-bold text-white">{userProfile.username || 'Alex'}</h4>
                            <span className="text-cyan-400 font-bold">✓</span>
                          </div>
                          <span className="text-purple-300 text-[11px] font-semibold">Legend Rank</span>
                        </div>
                      </div>

                      {/* 4 Stats: Play Time, Games, Achievements, Score */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center sm:text-right pt-2 sm:pt-0 w-full sm:w-auto">
                        <div className="rounded-xl bg-white/[0.02] sm:bg-transparent p-2 sm:p-0">
                          <span className="font-display text-sm sm:text-base font-bold text-white block">—</span>
                          <span className="text-[9px] text-slate-400 uppercase">Play Time</span>
                        </div>
                        <div className="rounded-xl bg-white/[0.02] sm:bg-transparent p-2 sm:p-0">
                          <span className="font-display text-sm sm:text-base font-bold text-white block">—</span>
                          <span className="text-[9px] text-slate-400 uppercase">Operatives</span>
                        </div>
                        <div className="rounded-xl bg-white/[0.02] sm:bg-transparent p-2 sm:p-0">
                          <span className="font-display text-sm sm:text-base font-bold text-white block">—</span>
                          <span className="text-[9px] text-slate-400 uppercase">Achievements</span>
                        </div>
                        <div className="rounded-xl bg-white/[0.02] sm:bg-transparent p-2 sm:p-0">
                          <span className="font-display text-sm sm:text-base font-bold text-white block">—</span>
                          <span className="text-[9px] text-slate-400 uppercase">Score</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subcard: Top Played */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between rounded-xl bg-white/[0.02] p-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg overflow-hidden border border-white/10 bg-purple-950">
                        <img src="/assets/aistudio/17_01ef732d.png" alt="Top Played" className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase block">TOP STAKED PROTOCOL</span>
                        <span className="font-display font-bold text-white text-xs">LIVE INDEXER DATA REQUIRED</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs">36h 15m</span>
                      <button
                        onClick={() => navigate('/mint')}
                        title="Enter Mint Portal"
                        className="h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs shadow-md hover:bg-purple-500 transition-colors"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: DOWNLOADING / ON-CHAIN SYNC + RECENT ACHIEVEMENTS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* 5. DOWNLOADING / ON-CHAIN SYNC (Matches bottom left downloading bar) */}
                <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#080b1a] p-5 shadow-2xl font-mono text-xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block pb-2">
                    ON-CHAIN STATE SYNC
                  </span>

                  <div className="flex items-center gap-3 mt-1">
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
                      <img src="/assets/aistudio/56_1643a0f0.png" alt="Void Runners" className="h-full w-full object-contain" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-display font-bold text-white text-xs">ON-CHAIN INDEXER</h5>
                          <span className="text-[10px] text-slate-400">Live synchronization unavailable</span>
                        </div>
                        <button
                          onClick={() => setDownloadPaused(!downloadPaused)}
                          className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-white"
                        >
                          {downloadPaused ? '▶' : '⏸'}
                        </button>
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[43%]" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>—</span>
                          <span>—</span>
                          <span className="text-purple-300 font-bold">—</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. RECENT ACHIEVEMENTS (Matches bottom right 5 hex/shield badges) */}
                <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#080b1a] p-5 shadow-2xl font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="font-display font-bold text-white tracking-wider">RECENT ACHIEVEMENTS</span>
                    <button onClick={() => navigate('/quests')} className="text-purple-400 hover:text-purple-300 text-[11px]">
                      VIEW ALL
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 text-center">
                    {achievements.map((ach) => (
                      <div
                        key={ach.title}
                        className={`rounded-2xl border bg-white/[0.02] p-3 flex flex-col justify-between items-center space-y-2 ${ach.color} hover:bg-white/[0.05] transition-all`}
                      >
                        <div className="h-9 w-9 rounded-xl border border-white/10 bg-[#060815] flex items-center justify-center text-base shadow-inner">
                          {ach.icon}
                        </div>
                        <div>
                          <h6 className="font-display font-bold text-[10px] text-white truncate max-w-[90px]">{ach.title}</h6>
                          <span className="text-[9px] text-purple-300 block font-semibold">{ach.xp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </main>
          </div>
        </div>

      </div>
    </div>
  );
};
