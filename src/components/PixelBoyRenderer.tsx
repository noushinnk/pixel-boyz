"use client";

import React, { useState } from 'react';
import { PixelBoyNFT } from '../types/nft';
import { CONTRACT_CONFIG } from '../contracts/config';

interface PixelBoyRendererProps {
  nft: PixelBoyNFT;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showBadge?: boolean;
  interactive?: boolean;
  hideTokenId?: boolean;
  hideRarity?: boolean;
  customImage?: string;
}

const ORIGINAL_PIXEL_BOY_IMAGES = [
  '/assets/aistudio/pixil-frame-0__5__45747249.png',
  '/assets/aistudio/17_01ef732d.png',
  '/assets/aistudio/18_6d72f8ce.png',
  '/assets/aistudio/26_95acd707.png',
  '/assets/aistudio/35_3bc87fd1.png',
  '/assets/aistudio/56_1643a0f0.png',
  '/assets/aistudio/57_66af4ba5.png',
  '/assets/aistudio/1005_8f11a7d5.png',
];

export const PixelBoyRenderer: React.FC<PixelBoyRendererProps> = ({
  nft,
  size = 'md',
  showBadge = true,
  interactive = true,
  hideTokenId = false,
  hideRarity = false,
  customImage,
}) => {
  const [imageError, setImageError] = useState(false);
  const tokenIdx = Math.abs(Number(nft?.id || 1) - 1);
  const defaultLocalImage = ORIGINAL_PIXEL_BOY_IMAGES[tokenIdx % ORIGINAL_PIXEL_BOY_IMAGES.length];

  const activeImage = customImage || nft?.image || (nft?.metadataUri ? undefined : defaultLocalImage);

  // Color mappings based on archetype & traits
  const archetypeColors: Record<string, { bg: string; accent: string; jacket: string; eye: string }> = {
    'Cyborg': { bg: '#0b192c', accent: '#22d3ee', jacket: '#1e3a8a', eye: '#38bdf8' },
    'Neon Ronin': { bg: '#1a0b2e', accent: '#e879f9', jacket: '#581c87', eye: '#f43f5e' },
    'Quantum Hacker': { bg: '#062b1f', accent: '#34d399', jacket: '#064e3b', eye: '#10b981' },
    'Shadow Operative': { bg: '#18181b', accent: '#f43f5e', jacket: '#27272a', eye: '#ef4444' },
    'Astro Pilot': { bg: '#0f172a', accent: '#38bdf8', jacket: '#0284c7', eye: '#7dd3fc' },
    'Glitch Nomad': { bg: '#291804', accent: '#fbbf24', jacket: '#78350f', eye: '#f59e0b' },
    'Synth Priest': { bg: '#1c1033', accent: '#c084fc', jacket: '#4c1d95', eye: '#d8b4fe' },
    'Holo Brawler': { bg: '#261208', accent: '#fb923c', jacket: '#9a3412', eye: '#ea580c' },
  };

  const colors = archetypeColors[nft?.traits?.archetype || 'Cyborg'] || archetypeColors['Cyborg'];

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-full aspect-square',
    lg: 'w-full max-w-[420px] aspect-square',
    hero: 'w-full max-w-[500px] h-[440px]'
  }[size];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 ${sizeClasses} ${
        interactive ? 'group transition-all duration-300 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]' : ''
      }`}
      style={{
        background: `radial-gradient(circle at 50% 35%, ${colors.jacket}33, ${colors.bg} 80%, #080b18)`
      }}
    >
      {/* Scanline grid overlay */}
      <div className="scanlines absolute inset-0 z-10 opacity-40 pointer-events-none" />

      {/* Primary NFT Image Asset (Always original artwork) */}
      {activeImage && !imageError ? (
        <img
          src={activeImage}
          alt={nft?.name || 'Pixel Boy'}
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
          className="pixel-art absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 font-mono text-center">
          <span className="text-3xl text-cyan-300/50">#{nft.id}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Artwork unavailable</span>
        </div>
      )}

      {/* Floating Badges */}
      {showBadge && !hideTokenId && (
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <span className="font-display text-[10px] font-bold tracking-widest text-cyan-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {nft.tokenId}
          </span>
          <span className="rounded border border-cyan-400/30 bg-[#080b18]/80 px-2 py-0.5 font-display text-[9px] font-semibold text-cyan-200 backdrop-blur-md">
            {nft.level > 0 ? `LV. 0${nft.level}` : 'LEVEL UNKNOWN'}
          </span>
        </div>
      )}

      {/* Rarity Ribbon at bottom */}
      {!hideRarity && (
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none text-[10px]">
          <span className="font-display text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate max-w-[130px]">
            {nft?.traits?.archetype || 'Operative'}
          </span>
          <span
            className={`font-display text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              nft.rarity === 'Mythic'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                : nft.rarity === 'Legendary'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : nft.rarity === 'Epic'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                : nft.rarity === 'Rare'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-700/40 text-slate-300 border border-slate-600/40'
            }`}
          >
            {nft.rarity}
          </span>
        </div>
      )}
    </div>
  );
};
