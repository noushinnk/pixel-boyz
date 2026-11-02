"use client";

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, isContractDeployed } from '../contracts/config';
import { PixelBoyRenderer } from '../components/PixelBoyRenderer';
import { PixelBoyNFT } from '../types/nft';
import { BINANCE_AGENTIC_ALLOWLIST } from '../lib/merkle';

interface MintPageProps {
  navigate: (route: string) => void;
}

export const MintPage: React.FC<MintPageProps> = ({ navigate }) => {
  const {
    account,
    balanceBnb,
    isConnected,
    connectWallet,
    connectSandboxWallet,
    allowlistEligibility,
    totalMinted,
    freeMintedCount,
    paidMintedCount,
    freePhaseOpen,
    publicPhaseOpen,
    currentMintPriceBnb,
    mintPixelBoyz,
    nfts
  } = useWeb3();

  // Mint controls
  const [quantity, setQuantity] = useState<number>(1);
  const [mintStatus, setMintStatus] = useState<'idle' | 'preparing' | 'awaiting_signature' | 'pending' | 'confirmed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastTxHash, setLastTxHash] = useState<string>('');
  const [mintedTokens, setMintedTokens] = useState<PixelBoyNFT[]>([]);

  // Preview character
  const previewNft = nfts[0];

  // Agentic Wallet Eligibility: ONLY Binance Agentic Wallets can mint 2 free
  const isAgenticEligible = allowlistEligibility.isEligible && freePhaseOpen;
  const freeRemaining = allowlistEligibility.freeRemaining; // 0, 1, or 2

  // Quantity calculation:
  // ONLY agentic wallets get free mints. Others get 0 free mints.
  const freeQuantity = isAgenticEligible ? Math.min(quantity, freeRemaining) : 0;
  const paidQuantity = quantity - freeQuantity;
  const totalCostBnb = (paidQuantity * parseFloat(currentMintPriceBnb)).toFixed(4);

  // Maximum selectable
  const maxAllowed = isAgenticEligible ? CONTRACT_CONFIG.maxWalletAllowance : CONTRACT_CONFIG.paidMintLimitPerWallet;

  // Deployed contract indicator
  const isNftDeployed = isContractDeployed('nft');

  // Direct trigger for 2 Free Mints (Agentic Wallet Prompt action)
  const handleClaimFreeMints = async (qty: number = 2) => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    if (!isAgenticEligible || freeRemaining <= 0) return;
    
    setQuantity(qty);
    setMintStatus('awaiting_signature');
    setErrorMessage('');

    try {
      setTimeout(() => setMintStatus('pending'), 600);
      const res = await mintPixelBoyz(qty);
      if (res.success && res.txHash) {
        setLastTxHash(res.txHash);
        setMintedTokens(res.mintedNfts || []);
        setMintStatus('confirmed');
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } catch (e) { /* ignore */ }
      } else {
        setMintStatus('error');
        setErrorMessage(res.error || 'Transaction failed or rejected.');
      }
    } catch (err: unknown) {
      setMintStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error occurred.');
    }
  };

  const handleMint = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    setMintStatus('awaiting_signature');
    setErrorMessage('');

    try {
      setTimeout(() => setMintStatus('pending'), 700);
      const res = await mintPixelBoyz(quantity);

      if (res.success && res.txHash) {
        setLastTxHash(res.txHash);
        setMintedTokens(res.mintedNfts || []);
        setMintStatus('confirmed');
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        } catch (e) { /* ignore */ }
      } else {
        setMintStatus('error');
        setErrorMessage(res.error || 'Transaction failed or rejected by wallet.');
      }
    } catch (err: unknown) {
      setMintStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown transaction error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060813] text-white pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="eyebrow flex items-center gap-2">
              <span className="pulse-dot" />
              MINTING TERMINAL
            </div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
              Mint Your <span className="gradient-text">Pixel Boy</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300 font-sans max-w-2xl">
              Genesis ERC-721 collection on BNB Smart Chain. 6,000 free allocation reserved for verified Binance Agentic Wallets (2 Free Mints each). Standard wallets mint at 0.001 BNB.
            </p>
          </div>

          {/* Contract Status */}
          <div className="self-start sm:self-auto">
            {isNftDeployed ? (
              <span className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-950/40 px-3.5 py-2 font-mono text-xs text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                BNB Chain Active
              </span>
            ) : (
              <span className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-950/30 px-3.5 py-2 font-mono text-xs text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                BNB Smart Chain (56)
              </span>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PROMPT FOR BINANCE AGENTIC WALLET USERS (PER USER REQUIREMENT)            */}
        {/* ========================================================================= */}
        <div className="mt-8">
          {isAgenticEligible ? (
            /* AGENTIC WALLET PROMPT (ELIGIBLE FOR 2 FREE MINTS) */
            <div className="rounded-3xl border-2 border-cyan-400 bg-gradient-to-r from-cyan-950/80 via-[#0d1733] to-[#070b1a] p-6 sm:p-8 shadow-[0_0_35px_rgba(34,211,238,0.3)] relative overflow-hidden">
              <div className="scanlines absolute inset-0 opacity-25 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/60 bg-cyan-400/20 px-3 py-1 font-mono text-xs font-bold text-cyan-200">
                    <span className="pulse-dot" />
                    AGENTIC WALLET DETECTED & VERIFIED ✓
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                    You Qualify For <span className="text-cyan-300">2 Free Mints!</span>
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-2xl">
                    Your wallet is verified on the Binance Agentic Merkle allowlist. You can claim up to 2 Pixel Boyz with <strong className="text-cyan-300 font-bold">0.000 BNB</strong> mint price. Standard wallets cannot claim free mints.
                  </p>
                  <div className="text-xs font-mono text-cyan-400 font-semibold pt-1">
                    Free Mints Remaining: {freeRemaining} / 2
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
                  {freeRemaining > 0 ? (
                    <button
                      onClick={() => handleClaimFreeMints(freeRemaining)}
                      disabled={mintStatus === 'pending' || mintStatus === 'awaiting_signature'}
                      className="neon-button text-xs py-3.5 px-7 shadow-[0_0_25px_rgba(34,211,238,0.6)]"
                    >
                      CLAIM {freeRemaining} FREE MINT{freeRemaining > 1 ? 'S' : ''} NOW (0 BNB) ⚡
                    </button>
                  ) : (
                    <span className="rounded-xl border border-emerald-400/50 bg-emerald-950/40 px-4 py-2.5 font-mono text-xs text-emerald-300 font-bold">
                      ✓ ALL 2 FREE MINTS CLAIMED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* NON-AGENTIC OR DISCONNECTED WALLET PROMPT */
            <div className="rounded-3xl border border-white/10 bg-[#0c1126] p-6 sm:p-7 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 font-mono text-xs text-amber-300 font-bold">
                    <span>⚡ MINTING NOTICE:</span>
                    <span>AGENTIC WALLET EXCLUSIVE BENEFIT</span>
                  </div>
                  <p className="text-xs font-mono text-slate-300">
                    <strong className="text-cyan-300">Binance Agentic Wallets</strong> are granted <strong>2 FREE MINTS</strong> via on-chain Merkle proof. Other/standard wallets mint at the official price of <strong>0.001 BNB</strong> per character.
                  </p>
                  {isConnected && (
                    <p className="text-[11px] font-mono text-slate-400">
                      Current wallet <code className="text-slate-200">{account?.slice(0, 6)}...{account?.slice(-4)}</code> is not an Agentic Wallet. Your mints will be processed at 0.001 BNB.
                    </p>
                  )}
                </div>

                {/* Allowlist Test Switcher */}
                <div className="shrink-0 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Test Simulator:</span>
                  <button
                    onClick={() => connectSandboxWallet(BINANCE_AGENTIC_ALLOWLIST[0])}
                    className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 text-[11px] font-mono font-bold text-cyan-300 hover:bg-cyan-400/20 transition-all"
                  >
                    Switch to Agentic Wallet (2 Free)
                  </button>
                  <button
                    onClick={() => connectSandboxWallet('0x1111222233334444555566667777888899990000')}
                    className="rounded-xl border border-slate-700 bg-white/5 px-3 py-2 text-[11px] font-mono text-slate-300 hover:bg-white/10 transition-all"
                  >
                    Standard Wallet (0.001 BNB)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MINT MAIN GRID */}
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: NFT Preview & Collection Metrics */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#0d1226]/80 p-5 shadow-2xl backdrop-blur-xl">
              <PixelBoyRenderer nft={previewNft} size="hero" showBadge={false} hideTokenId={true} hideRarity={true} />
              <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-400 px-2">
                <span className="text-cyan-300 font-bold">PIXEL BOY ORIGIN SPECIMEN</span>
                <span className="text-slate-400">ERC-721 · BNB CHAIN</span>
              </div>
            </div>

            {/* REAL MINT PROGRESS (100% REAL, ZERO DEMO ADDITIONS) */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 uppercase tracking-wider">Live Mint Progress (Real)</span>
                <span className="font-display font-bold text-white text-sm">
                  {totalMinted.toLocaleString()} / {CONTRACT_CONFIG.totalSupply.toLocaleString()}
                </span>
              </div>

              {/* Progress bar reflecting actual minted percentage */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${Math.max(1, (totalMinted / CONTRACT_CONFIG.totalSupply) * 100)}%` }}
                />
              </div>

              {/* Allocation stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Agentic Free Allocation</span>
                  <span className="text-cyan-300 font-bold">
                    {freeMintedCount.toLocaleString()} / {CONTRACT_CONFIG.freeAllocation.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Max 2 per Agentic Wallet</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Standard Paid Minted</span>
                  <span className="text-purple-300 font-bold">
                    {paidMintedCount.toLocaleString()} / {CONTRACT_CONFIG.paidAllocation.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block">0.001 BNB · Others</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Mint Interface */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-cyan-400/30 bg-[#0d1226] p-6 sm:p-8 shadow-2xl">
              {/* Wallet Status Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                      Connected Wallet
                    </span>
                    {isConnected ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-sm font-semibold text-white">
                          {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : ''}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          ({balanceBnb} BNB)
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-sm text-slate-400 mt-0.5 block">
                        Wallet not connected
                      </span>
                    )}
                  </div>

                  {!isConnected ? (
                    <button onClick={connectWallet} className="neon-button text-xs py-2 px-4">
                      CONNECT WALLET
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isAgenticEligible ? (
                        <span className="rounded-lg border border-cyan-400/40 bg-cyan-950/50 px-3 py-1 font-mono text-[11px] font-bold text-cyan-300">
                          ✓ AGENTIC WALLET (2 FREE)
                        </span>
                      ) : (
                        <span className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1 font-mono text-[11px] text-slate-400">
                          STANDARD WALLET (0.001 BNB)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-display text-sm font-bold uppercase tracking-wider text-white">
                    Select Mint Quantity
                  </label>
                  <span className="font-mono text-xs text-slate-400">
                    Max: {maxAllowed} NFTs
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center rounded-2xl border border-white/15 bg-white/[0.04] p-1 self-start">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl text-xl font-mono text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-14 sm:w-16 text-center font-display text-xl sm:text-2xl font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxAllowed, quantity + 1))}
                      disabled={quantity >= maxAllowed}
                      className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl text-xl font-mono text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  {/* Preset Quick Buttons */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[1, 2, 5, 10, maxAllowed].map((val) => (
                      <button
                        key={val}
                        onClick={() => setQuantity(val)}
                        className={`rounded-xl border px-3 py-2 text-xs font-mono transition-colors ${
                          quantity === val
                            ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 font-bold'
                            : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/30'
                        }`}
                      >
                        {val === maxAllowed ? `Max (${val})` : val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mathematical Calculation Breakdown */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-[#090d1e] p-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Selected Total</span>
                  <span className="text-white font-bold">{quantity} Pixel Boyz</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    Agentic Free Allocation
                  </span>
                  <span className="text-cyan-300 font-bold">
                    {freeQuantity} NFT {freeQuantity > 0 ? '(0.000 BNB Free)' : '(Agentic Only)'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    Standard Mint Quantity
                  </span>
                  <span className="text-purple-300 font-bold">
                    {paidQuantity} NFT × 0.001 BNB
                  </span>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                  <span className="text-white font-bold uppercase">Total Cost</span>
                  <span className="font-display text-2xl font-black text-cyan-300">
                    {totalCostBnb} BNB
                  </span>
                </div>
              </div>

              {/* Mint Action Button */}
              <div className="mt-6">
                <button
                  onClick={handleMint}
                  disabled={mintStatus === 'pending' || mintStatus === 'awaiting_signature'}
                  className="neon-button w-full py-4 text-sm font-bold tracking-widest"
                >
                  {mintStatus === 'awaiting_signature'
                    ? 'AWAITING WALLET SIGNATURE...'
                    : mintStatus === 'pending'
                    ? 'BROADCASTING TO BNB CHAIN...'
                    : !isConnected
                    ? 'CONNECT WALLET TO MINT'
                    : freeQuantity > 0 && paidQuantity === 0
                    ? `MINT ${freeQuantity} FREE PIXEL BOY${freeQuantity > 1 ? 'Z' : ''} (0 BNB)`
                    : `MINT ${quantity} PIXEL BOY${quantity > 1 ? 'Z' : ''} FOR ${totalCostBnb} BNB`}
                </button>
              </div>

              {/* Error Notification */}
              {mintStatus === 'error' && errorMessage && (
                <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/30 p-4 font-mono text-xs text-red-300">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Confirmed Mint Notification */}
              {mintStatus === 'confirmed' && (
                <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-6 font-mono text-xs text-emerald-300 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <span>🎉 Mint Confirmed on BNB Smart Chain!</span>
                  </div>
                  <p>
                    {mintedTokens.length} unique Pixel Boy operative{mintedTokens.length > 1 ? 's' : ''} generated and deposited into your inventory.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`https://bscscan.com/tx/${lastTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="neon-button text-[10px] py-2 px-3"
                    >
                      View on BscScan ↗
                    </a>
                    <button
                      onClick={() => navigate('/profile')}
                      className="ghost-button text-[10px] py-2 px-3"
                    >
                      View in My Inventory →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
