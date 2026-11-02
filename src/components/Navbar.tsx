"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, BSC_MAINNET_CHAIN_ID } from '../contracts/config';
import { BINANCE_AGENTIC_ALLOWLIST } from '../lib/merkle';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const {
    account,
    chainId,
    balanceBnb,
    isConnected,
    isConnecting,
    isBinanceAgenticWallet,
    connectWallet,
    connectSandboxWallet,
    disconnectWallet,
    switchNetwork,
    userProfile
  } = useWeb3();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  // Primary navigation links visible directly on desktop
  const primaryNavItems = [
    { label: 'Home', path: '/', icon: '🏠' },
    { label: 'Mint', path: '/mint', icon: '⚡' },
    { label: 'Explore', path: '/explore', icon: '🔍' },
    { label: 'Market', path: '/marketplace', icon: '🛒' },
    { label: 'Rewards', path: '/rewards', icon: '💎' },
  ];

  // Secondary navigation links in "More" dropdown on desktop to prevent overflow
  const secondaryNavItems = [
    { label: 'Forge', path: '/forge', icon: '⚔️' },
    { label: 'Quests', path: '/quests', icon: '🎯' },
    { label: 'Activity', path: '/activity', icon: '📊' },
    { label: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
    setMoreDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/explore?q=${encodeURIComponent(navSearch.trim())}`);
    }
  };

  const isWrongNetwork = isConnected && chainId !== BSC_MAINNET_CHAIN_ID;
  const isSecondaryActive = secondaryNavItems.some(
    (item) => currentRoute === item.path || (item.path !== '/' && currentRoute.startsWith(item.path))
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#070914]/95 backdrop-blur-2xl">
        <div className="w-full max-w-[1600px] mx-auto flex h-16 sm:h-20 items-center justify-between px-3 sm:px-5 lg:px-8 gap-2 sm:gap-4">
          
          {/* Left: Cybernetic Crest Logo */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2 sm:gap-3 text-left focus:outline-none group shrink-0"
          >
            {/* Cyber Shield Crest SVG */}
            <div className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-700 to-cyan-500 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all shrink-0">
              <div className="h-full w-full rounded-2xl bg-[#090c1b] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" fill="currentColor">
                  <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.14 8.79-7 9.94-3.86-1.15-7-5.4-7-9.94V7.3l7-3.12zM12 6.5l-3.5 3.5 1.41 1.41L12 9.33l2.09 2.08 1.41-1.41L12 6.5z" />
                </svg>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xs sm:text-base font-black tracking-wider sm:tracking-[0.2em] text-white whitespace-nowrap">
                  PIXEL BOYZ
                </span>
                <span className="hidden md:inline-block rounded-md bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-purple-300 border border-purple-500/40">
                  HUD
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-wider text-cyan-400 block font-semibold truncate">
                BNB SMART CHAIN
              </span>
            </div>
          </button>

          {/* Desktop Nav Links with Purple Active Pills - Responsive without Horizontal Overflow */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink min-w-0">
            {primaryNavItems.map((item) => {
              const isActive = currentRoute === item.path || (item.path !== '/' && currentRoute.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl font-mono text-[11px] xl:text-xs uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* "More" dropdown for secondary items to ensure right icons never get clipped */}
            <div className="relative">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-[11px] xl:text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                  isSecondaryActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>⚔️ More</span>
                <span className="text-[10px]">▾</span>
              </button>

              {moreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0d1226] p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  {secondaryNavItems.map((item) => {
                    const isActive = currentRoute === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={`flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-left font-mono text-xs transition-colors ${
                          isActive
                            ? 'bg-purple-600/40 text-purple-200 font-bold'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Area: HUD Icons + Network + Single Wallet Pill (Guaranteed Shrink-0 to prevent cutoff) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
            {/* Network Indicator (BSC) - Visible on md+ */}
            <button
              onClick={() => isWrongNetwork && switchNetwork(BSC_MAINNET_CHAIN_ID)}
              className={`hidden md:flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-mono transition-colors shrink-0 ${
                isWrongNetwork
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              }`}
              title={isWrongNetwork ? 'Switch to BNB Chain' : 'BNB Chain (56)'}
            >
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  isWrongNetwork ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                }`}
              />
              <span className="whitespace-nowrap">{isWrongNetwork ? 'Switch BSC' : 'BNB Chain'}</span>
            </button>

            {/* Gamepad HUD Button */}
            <button
              onClick={() => handleNavClick('/rewards')}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0d1226] text-slate-300 hover:text-purple-300 hover:border-purple-500/50 transition-colors shrink-0"
              title="Operative Game Hub"
            >
              🎮
            </button>

            {/* Notification Bell with unread dot */}
            <div className="relative shrink-0">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0d1226] text-slate-300 hover:text-cyan-300 hover:border-cyan-400/50 transition-colors"
                title="Telemetry Notifications"
              >
                🔔
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-[#0d1226] p-4 shadow-2xl backdrop-blur-2xl z-50 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 font-bold text-white">
                    <span>TRANSACTION TELEMETRY</span>
                    <span className="text-[10px] text-cyan-400">LIVE</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="rounded-lg bg-white/5 p-2 text-slate-300">
                      <span className="text-cyan-300 font-bold">Epoch 04 Rewards:</span> Staking pool active with 4.85 BNB.
                    </div>
                    <div className="rounded-lg bg-white/5 p-2 text-slate-300">
                      <span className="text-purple-300 font-bold">Agentic Allocation:</span> 2 free mints verified on allowlist.
                    </div>
                  </div>
                  <button
                    onClick={() => handleNavClick('/activity')}
                    className="w-full text-center text-cyan-400 hover:underline pt-1 text-[11px] block"
                  >
                    View All Activity Feed →
                  </button>
                </div>
              )}
            </div>

            {/* ONLY ONE Single Wallet Button or Profile Pill */}
            {!isConnected ? (
              <button
                onClick={() => setWalletModalOpen(true)}
                disabled={isConnecting}
                className="neon-button text-[11px] sm:text-xs py-1.5 sm:py-2 px-2.5 sm:px-4 shrink-0 whitespace-nowrap"
              >
                {isConnecting ? 'CONNECTING...' : 'CONNECT'}
              </button>
            ) : (
              <div className="relative shrink-0">
                {/* Circular Profile Avatar Chip */}
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2.5 rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/40 to-[#0d1226] p-1 sm:p-1.5 pr-2 sm:pr-3 hover:border-purple-400 transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0"
                >
                  <div className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border-2 border-purple-400 bg-purple-900 shrink-0">
                    <img
                      src="/assets/aistudio/pixil-frame-0__5__45747249.png"
                      alt="Avatar"
                      className="pixel-art h-full w-full object-contain"
                    />
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-black" />
                  </div>

                  <div className="text-left hidden md:block">
                    <div className="flex items-center gap-1">
                      <span className="font-display text-xs font-bold text-white">
                        {userProfile.username || 'Alex'}
                      </span>
                      {isBinanceAgenticWallet && (
                        <span className="text-[8px] font-mono text-cyan-300 font-bold">✓</span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-purple-300 block">
                      {balanceBnb} BNB · LV. 28
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs">▾</span>
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-[#0d1226] p-3 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="border-b border-white/10 pb-3 mb-2 px-2">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-bold text-white">
                          {userProfile.username || 'Alex'}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                          {userProfile.xp} XP
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                        {account}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavClick('/profile')}
                        className="w-full text-left rounded-lg px-3 py-2 text-xs font-mono text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        👤 View Profile & Inventory
                      </button>
                      <button
                        onClick={() => handleNavClick('/rewards')}
                        className="w-full text-left rounded-lg px-3 py-2 text-xs font-mono text-purple-300 hover:bg-purple-500/10 transition-colors"
                      >
                        💎 Rewards & Mission HUD
                      </button>
                      <button
                        onClick={() => handleNavClick('/quests')}
                        className="w-full text-left rounded-lg px-3 py-2 text-xs font-mono text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        🎯 Active Quests
                      </button>
                      <button
                        onClick={() => handleNavClick('/admin')}
                        className="w-full text-left rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                      >
                        ⚙️ Admin Protocol Controls
                      </button>
                    </div>

                    <div className="border-t border-white/10 pt-2 mt-2">
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left rounded-lg px-3 py-2 text-xs font-mono text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Hamburger - Always perfectly positioned and never cut off */}
            <button
              aria-label="Toggle navigation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex lg:hidden h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-base sm:text-lg text-white hover:bg-white/10 shrink-0"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#090d1f] px-4 py-5 lg:hidden max-h-[85vh] overflow-y-auto animate-in slide-in-from-top duration-200">
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search characters, traits..."
                className="w-full rounded-xl border border-white/10 bg-[#0d1226] px-4 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500"
              />
            </form>

            {/* Navigation items list */}
            <div className="space-y-1">
              {allNavItems.map((item) => {
                const isActive = currentRoute === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-left font-mono text-xs uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Wallet Connection Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-cyan-400/40 bg-[#0b0f24] p-6 shadow-2xl font-mono">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-display text-base font-bold text-white">
                CONNECT WEB3 WALLET
              </span>
              <button
                onClick={() => setWalletModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Connect via Binance Agentic Wallet (eligible for 2 free mints) or standard injected provider:
            </p>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => {
                  connectWallet();
                  setWalletModalOpen(false);
                }}
                className="flex items-center justify-between w-full rounded-xl border border-white/10 bg-white/5 p-3.5 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🦊</span>
                  <div className="text-left">
                    <span className="font-bold text-white block">Browser Injected / MetaMask</span>
                    <span className="text-[10px] text-slate-400">BNB Smart Chain (ID: 56)</span>
                  </div>
                </div>
                <span className="text-cyan-400 text-xs">Connect →</span>
              </button>

              <button
                onClick={() => {
                  connectSandboxWallet(BINANCE_AGENTIC_ALLOWLIST[0]);
                  setWalletModalOpen(false);
                }}
                className="flex items-center justify-between w-full rounded-xl border border-cyan-400/40 bg-cyan-950/30 p-3.5 hover:bg-cyan-900/40 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🤖</span>
                  <div className="text-left">
                    <span className="font-bold text-cyan-300 block">Binance Agentic Wallet</span>
                    <span className="text-[10px] text-cyan-400/80">✓ 2 Free Mints Eligible</span>
                  </div>
                </div>
                <span className="rounded bg-cyan-400/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                  Allowlisted
                </span>
              </button>

              <button
                onClick={() => {
                  connectSandboxWallet('0x1111222233334444555566667777888899990000');
                  setWalletModalOpen(false);
                }}
                className="flex items-center justify-between w-full rounded-xl border border-white/10 bg-white/5 p-3.5 hover:bg-white/10 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">👛</span>
                  <div className="text-left">
                    <span className="font-bold text-slate-200 block">Standard Web3 Wallet</span>
                    <span className="text-[10px] text-slate-400">Paid Public Mint (0.001 BNB)</span>
                  </div>
                </div>
                <span className="text-slate-400 text-xs">Connect →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
