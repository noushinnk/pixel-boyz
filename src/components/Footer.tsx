"use client";

import React from 'react';
import Link from 'next/link';
import { CONTRACT_CONFIG } from '../contracts/config';

interface FooterProps {
  navigate?: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = () => {
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
                <Link href="/mint" className="hover:text-white transition-colors block">
                  Mint Portal
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors block">
                  Explore Gallery
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors block">
                  Native Marketplace
                </Link>
              </li>
              <li>
                <Link href="/forge" className="hover:text-white transition-colors block">
                  Cyber Forge Upgrade
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-white transition-colors block">
                  BNB Rewards Pool
                </Link>
              </li>
              <li>
                <Link href="/quests" className="hover:text-white transition-colors block">
                  Community Quests
                </Link>
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
                <Link href="/activity" className="hover:text-white transition-colors block">
                  Live Activity Feed
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors block">
                  Admin Verification
                </Link>
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
            <a
              href="https://x.com/pixelboyzai"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              X (@pixelboyzai) ↗
            </a>
            <Link href="/quests" className="hover:text-slate-300 transition-colors">
              Community Quests
            </Link>
            <Link href="/activity" className="hover:text-slate-300 transition-colors">
              Live Feed
            </Link>
            <a
              href={CONTRACT_CONFIG.bscScanUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              BscScan ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
