"use client";

import React from 'react';
import { CONTRACT_CONFIG } from '../contracts/config';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="border-t border-white/10 bg-[#060814] px-5 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="brand-mark">PB</span>
              <div>
                <span className="font-display font-bold tracking-[0.2em] text-white">
                  PIXEL BOYZ
                </span>
                <span className="block text-[10px] font-mono text-cyan-400">
                  DECENTRALIZED UNIVERSE
                </span>
              </div>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-400">
              10,000 unique cybernetic characters on BNB Smart Chain. Collect, evolve through the Forge, earn rewards, and write your on-chain legacy.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                BNB Smart Chain (56)
              </span>
              <span>·</span>
              <span>ERC-721</span>
              <span>·</span>
              <span>2.5% Marketplace Fee</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-cyan-300">
              Ecosystem
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-mono text-slate-400">
              <li>
                <button onClick={() => navigate('/mint')} className="hover:text-white transition-colors">
                  Mint Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/explore')} className="hover:text-white transition-colors">
                  Explore Gallery
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/marketplace')} className="hover:text-white transition-colors">
                  Native Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/forge')} className="hover:text-white transition-colors">
                  Cyber Forge Upgrade
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/rewards')} className="hover:text-white transition-colors">
                  BNB Rewards Pool
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/quests')} className="hover:text-white transition-colors">
                  Community Quests
                </button>
              </li>
            </ul>
          </div>

          {/* Network & Verification */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-cyan-300">
              On-Chain Security
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-mono text-slate-400">
              <li>
                <a
                  href={`${CONTRACT_CONFIG.bscScanUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  BscScan Explorer ↗
                </a>
              </li>
              <li>
                <button onClick={() => navigate('/activity')} className="hover:text-white transition-colors">
                  Live Activity Feed
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin')} className="hover:text-white transition-colors">
                  Admin Verification
                </button>
              </li>
              <li>
                <span className="text-slate-500">Cloudflare R2 Gateway</span>
              </li>
              <li>
                <span className="text-slate-500">Merkle Root Allowlist</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs font-mono text-slate-500 sm:flex-row">
          <div>© 2026 PIXEL BOYZ UNIVERSE. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Discord</span>
            <span className="hover:text-slate-400 cursor-pointer">X (Twitter)</span>
            <span className="hover:text-slate-400 cursor-pointer">Telegram</span>
            <span className="hover:text-slate-400 cursor-pointer">GitBook Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
