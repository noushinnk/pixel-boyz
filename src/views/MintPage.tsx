"use client";

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, isContractDeployed } from '../contracts/config';
import { PixelBoyRenderer } from '../components/PixelBoyRenderer';
import { PixelBoyNFT } from '../types/nft';

interface MintPageProps {
  navigate: (route: string) => void;
}

const X_CAMPAIGN_TEMPLATE = `PIXEL BOYZ is coming to BNB Chain!

10,000 unique NFTs.
6,000 free mint allocation for verified Binance Agent ID holders.
Forge, rewards and a pixel-powered Web3 ecosystem.

Complete the campaign task and claim up to 2 free NFTs while allocation lasts.

https://www.pixelboyz.shop/mint

#PIXELBOYZ #BNBChain #NFT @pixelboyzai`;

// Safe universal clipboard copy utility
const copyTextSafely = async (text: string): Promise<boolean> => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // Fallback to execCommand below
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    return false;
  }
};

export const MintPage: React.FC<MintPageProps> = ({ navigate }) => {
  const {
    account,
    balanceBnb,
    isConnected,
    connectWallet,
    totalMinted,
    totalFreeMinted,
    totalPaidMinted,
    paidAllocation,
    freeAllocationRemaining,
    paidAllocationRemaining,
    remainingSupply,
    freePhaseOpen,
    publicPhaseOpen,
    freePhaseClosed,
    currentMintPriceBnb,
    walletFreeMinted,
    walletPaidMinted,
    isAgentIdVerified,
    isAgentIdLoading,
    xCampaignCompleted,
    xCampaignLoading,
    verifyAgentIdOnChain,
    verifyXCampaignPost,
    getAgenticPrompt,
    mintPixelBoyz,
    nfts
  } = useWeb3();

  // Mint controls
  const [quantity, setQuantity] = useState<number>(1);
  const [mintStatus, setMintStatus] = useState<'idle' | 'preparing' | 'awaiting_signature' | 'pending' | 'confirmed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastTxHash, setLastTxHash] = useState<string>('');

  // X Campaign Card State
  const [xPostUrl, setXPostUrl] = useState<string>('');
  const [xVerificationMsg, setXVerificationMsg] = useState<string>('');
  const [xVerificationErr, setXVerificationErr] = useState<string>('');
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Preview character
  const previewNft = nfts[0];

  // Free eligibility requires:
  // 1. Agent ID Verified
  // 2. X Campaign Task Submitted & Verified
  // 3. Free phase active and not closed
  // 4. Wallet has remaining free allocation (< 2)
  // 5. Total free allocation remaining > 0
  const walletFreeRemaining = Math.max(0, 2 - walletFreeMinted);
  const isFreeEligible = isAgentIdVerified && xCampaignCompleted && freePhaseOpen && !freePhaseClosed && walletFreeRemaining > 0 && freeAllocationRemaining > 0;

  // Calculation of free vs paid quantities for the selected quantity
  const freeQuantity = isFreeEligible ? Math.min(quantity, Math.min(walletFreeRemaining, freeAllocationRemaining)) : 0;
  const paidQuantity = quantity - freeQuantity;

  const mintPriceNumber = Number(currentMintPriceBnb) || 0.001;
  const totalCostBnb = (paidQuantity * mintPriceNumber).toFixed(4);

  // Maximum selectable:
  // Paid wallet cap is 20. If eligible for free, max allowance is 20 paid + 2 free = 22.
  const walletPaidRemaining = Math.max(0, 20 - walletPaidMinted);
  const maxAllowed = Math.max(1, (isFreeEligible ? walletFreeRemaining : 0) + walletPaidRemaining);

  const isNftDeployed = isContractDeployed('nft');

  // Copy X Template Handler
  const handleCopyTemplate = async () => {
    const ok = await copyTextSafely(X_CAMPAIGN_TEMPLATE);
    if (ok) {
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2500);
    }
  };

  // Open X / Tweet Intent
  const handleOpenX = () => {
    const encoded = encodeURIComponent(X_CAMPAIGN_TEMPLATE);
    window.open(`https://x.com/intent/tweet?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  // Submit & Verify X Post Handler (No Twitter API dependency)
  const handleVerifyXPost = async () => {
    if (!xPostUrl.trim()) {
      setXVerificationErr('Please paste your published X post URL.');
      return;
    }
    setXVerificationErr('');
    setXVerificationMsg('');

    const res = await verifyXCampaignPost(xPostUrl.trim());
    if (res.success) {
      setXVerificationMsg(res.message || 'X post submitted successfully! Free mint proof is unlocked.');
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch (e) { /* ignore */ }
    } else {
      setXVerificationErr(res.error || 'Submission failed. Please check the URL format.');
    }
  };

  // Copy Agentic Wallet Prompt Handler
  const handleCopyAgenticPrompt = async () => {
    const prompt = getAgenticPrompt(quantity);
    const ok = await copyTextSafely(prompt);
    if (ok) {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    }
  };

  // Main Mint Trigger
  const handleMint = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    // Strict Free Mint Block: If Agent ID is held but X campaign is refused / uncompleted
    if (isAgentIdVerified && !xCampaignCompleted && quantity <= walletFreeRemaining) {
      setMintStatus('error');
      setErrorMessage(
        'FREE MINT BLOCKED: Your Binance Agent ID was detected, but free minting is strictly blocked—even for autonomous AI agents—until you publish and submit an X post tagging @pixelboyzai and linking to https://www.pixelboyz.shop/mint. Complete the X task above, or select a paid quantity.'
      );
      const el = document.getElementById('x-campaign-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setMintStatus('awaiting_signature');
    setErrorMessage('');

    try {
      setTimeout(() => setMintStatus('pending'), 700);
      const res = await mintPixelBoyz(quantity);

      if (res.success && res.txHash) {
        setLastTxHash(res.txHash);
        setMintStatus('confirmed');
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
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

  // Percentage calculations
  const overallPercent = Math.min(100, Math.max(0, (totalMinted / 10000) * 100));
  const freePercent = Math.min(100, Math.max(0, (totalFreeMinted / 6000) * 100));
  const paidPercent = Math.min(100, Math.max(0, (totalPaidMinted / Math.max(1, paidAllocation)) * 100));

  return (
    <div className="min-h-screen bg-[#060813] text-white pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="eyebrow flex items-center gap-2">
              <span className="pulse-dot" />
              MINTING TERMINAL · GENESIS ERC-721
            </div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
              Mint Your <span className="gradient-text">Pixel Boy</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300 font-sans max-w-2xl">
              10,000 unique pixel warriors on BNB Smart Chain Mainnet. Live contract metrics, Binance Agent ID free allocation, and instant Merkle allowlist verification.
            </p>
          </div>

          {/* Contract Status & BSCScan Link */}
          <div className="flex flex-col sm:items-end gap-2">
            <a
              href={`https://bscscan.com/address/${CONTRACT_CONFIG.nftAddress}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-950/40 px-3.5 py-2 font-mono text-xs text-cyan-300 hover:border-cyan-300 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="font-bold">BNB Chain:</span> {CONTRACT_CONFIG.nftAddress.slice(0, 6)}...{CONTRACT_CONFIG.nftAddress.slice(-4)} ↗
            </a>
            <span className="text-[11px] font-mono text-slate-400">
              Chain ID: 56 · Mainnet Deployed
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. THREE LIVE PROGRESS INDICATORS (A: Overall, B: Free, C: Paid)          */}
        {/* ========================================================================= */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* A. Overall Collection Progress */}
          <div className="rounded-3xl border border-white/10 bg-[#0c1228] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="uppercase tracking-wider font-semibold">Total Minted</span>
                <span className="text-cyan-300 font-bold">{overallPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-display text-3xl font-black text-white">
                  {totalMinted.toLocaleString()}
                </div>
                <div className="font-mono text-xs text-slate-400">
                  / 10,000 Max
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                  style={{ width: `${Math.max(1, overallPercent)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[11px] text-slate-400">
              <span>Remaining Supply:</span>
              <span className="text-white font-bold">{remainingSupply.toLocaleString()} NFTs</span>
            </div>
          </div>

          {/* B. Free Mint Progress (Agent ID Allocation) */}
          <div className="rounded-3xl border border-cyan-400/30 bg-[#09152e] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="uppercase tracking-wider text-cyan-300 font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Free Allocation (Agent ID)
                </span>
                <span className="text-cyan-300 font-bold">{freePercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-display text-3xl font-black text-cyan-200">
                  {totalFreeMinted.toLocaleString()}
                </div>
                <div className="font-mono text-xs text-cyan-400/80">
                  / 6,000 Free
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-cyan-400/20">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-700 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                  style={{ width: `${Math.max(1, freePercent)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[11px] text-slate-300">
              <span>Free Remaining:</span>
              <span className="text-cyan-300 font-bold">
                {freeAllocationRemaining > 0 && freePhaseOpen && !freePhaseClosed
                  ? `${freeAllocationRemaining.toLocaleString()} Available`
                  : 'Sold Out / Closed'}
              </span>
            </div>
          </div>

          {/* C. Paid Mint Progress (Dynamic Denominator) */}
          <div className="rounded-3xl border border-purple-500/30 bg-[#120f2b] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="uppercase tracking-wider text-purple-300 font-semibold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  Paid Mint Progress
                </span>
                <span className="text-purple-300 font-bold">{paidPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="font-display text-3xl font-black text-purple-200">
                  {totalPaidMinted.toLocaleString()}
                </div>
                <div className="font-mono text-xs text-purple-400/80">
                  / {paidAllocation.toLocaleString()} Allocation
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-purple-500/20">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                  style={{ width: `${Math.max(1, paidPercent)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-[11px] text-slate-300">
              <span>Paid Remaining:</span>
              <span className="text-purple-300 font-bold">{paidAllocationRemaining.toLocaleString()} NFTs</span>
            </div>
          </div>

        </div>

        {/* Live Contract Data Strip */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Mint Price:</span>
            <span className="text-white font-bold">{currentMintPriceBnb} BNB</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Free Phase Status:</span>
            <span className={`font-bold ${freePhaseOpen && !freePhaseClosed ? 'text-emerald-400' : 'text-amber-400'}`}>
              {freePhaseClosed ? 'PERMANENTLY CLOSED (ROLLED OVER)' : freePhaseOpen ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Paid Sale Status:</span>
            <span className={`font-bold ${publicPhaseOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
              {publicPhaseOpen ? 'ACTIVE (0.001 BNB)' : 'PAUSED'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Allocation Model:</span>
            <span className="text-cyan-300 font-semibold">
              {paidAllocation > 4000 ? 'Expanded Rollover Model' : 'Standard (6k Free / 4k Paid)'}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BINANCE AGENTIC WALLET / AGENT ID CARD                                  */}
        {/* ========================================================================= */}
        <div className="mt-8 rounded-3xl border-2 border-cyan-400/50 bg-gradient-to-r from-cyan-950/60 via-[#0b1633] to-[#080d21] p-6 sm:p-8 shadow-[0_0_30px_rgba(34,211,238,0.2)] relative overflow-hidden">
          <div className="scanlines absolute inset-0 opacity-20 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-cyan-400/20 px-3 py-1 font-mono text-xs font-bold text-cyan-200">
                  <span className="pulse-dot" />
                  BINANCE AGENTIC WALLET & AGENT ID GATEWAY
                </span>
                {isAgentIdVerified ? (
                  <span className="rounded-full border border-emerald-400/50 bg-emerald-950/60 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                    ✓ AGENT ID OWNERSHIP CONFIRMED ON BNB CHAIN
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 font-mono text-xs text-slate-300">
                    PENDING AGENT ID VERIFICATION
                  </span>
                )}
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Claim Up To <span className="text-cyan-300">2 Free NFTs</span> With Binance Agent ID
              </h2>

              <p className="text-xs sm:text-sm font-mono text-slate-300 leading-relaxed">
                Free mint eligibility requires holding a claimed Binance Agent ID (<code className="text-cyan-300">.ai</code>) registered in the official SPACE ID registry contract on BNB Smart Chain (<code className="text-slate-300">0x60B9...022F</code>) plus completing the verified X campaign task.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                <span>Free Allocation Remaining for Wallet: <strong className="text-cyan-300">{walletFreeRemaining} / 2</strong></span>
                <span>•</span>
                <span>Agent ID Status: <strong className={isAgentIdVerified ? 'text-emerald-400' : 'text-amber-300'}>{isAgentIdVerified ? 'Verified' : 'Not Detected / Unverified'}</strong></span>
                <span>•</span>
                <span>X Campaign Status: <strong className={xCampaignCompleted ? 'text-emerald-400' : 'text-amber-300'}>{xCampaignCompleted ? 'Verified ✓' : 'Task Required'}</strong></span>
              </div>

              {/* Strict Agent Block Warning */}
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 font-mono text-xs text-rose-200 flex items-start gap-3 shadow-[0_0_15px_rgba(244,63,94,0.15)] mt-2">
                <span className="text-lg leading-none mt-0.5">🚫</span>
                <div className="space-y-1">
                  <div className="font-bold text-rose-300 uppercase tracking-wide">
                    STRICT PROTOCOL ENFORCEMENT: AGENT FREE-MINT BLOCK
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal">
                    Autonomous AI agents, automated wallets, and script runners are <strong>strictly blocked</strong> from free minting if the user refuses or fails to publish the required X campaign post tagging <code className="text-cyan-300 font-bold">@pixelboyzai</code> and linking to <code className="text-cyan-300 font-bold">https://www.pixelboyz.shop/mint</code>. Merkle allowlist proofs are not generated without verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={handleCopyAgenticPrompt}
                className="neon-button text-xs py-3 px-5 shadow-[0_0_20px_rgba(34,211,238,0.4)] whitespace-nowrap"
              >
                {copiedPrompt ? '✓ PROMPT COPIED TO CLIPBOARD!' : 'COPY AGENTIC WALLET MINT PROMPT 📋'}
              </button>

              <button
                onClick={verifyAgentIdOnChain}
                disabled={isAgentIdLoading || !isConnected}
                className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-mono font-bold text-slate-200 transition-colors disabled:opacity-50"
              >
                {isAgentIdLoading ? 'CHECKING REGISTRY ON BNB CHAIN...' : 'VERIFY AGENT ID ON BNB CHAIN 🔄'}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. X CAMPAIGN TASK CARD — MANDATORY FOR FREE MINT                         */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* 3. X CAMPAIGN TASK CARD — MANDATORY FOR FREE MINT                         */}
        {/* ========================================================================= */}
        <div id="x-campaign-section" className="mt-8 rounded-3xl border border-white/15 bg-[#090d21] p-6 sm:p-8 shadow-2xl relative scroll-mt-28">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            
            <div className="space-y-4 max-w-2xl">
              <div>
                <div className="flex items-center gap-2 font-mono text-xs text-purple-400 font-bold uppercase">
                  <span>MANDATORY TASK FOR FREE MINT</span>
                  {xCampaignCompleted && (
                    <span className="rounded-md border border-emerald-400/50 bg-emerald-950/60 px-2 py-0.5 text-[10px] text-emerald-300">
                      ✓ TASK COMPLETED
                    </span>
                  )}
                </div>
                <h3 className="mt-1 font-display text-2xl font-bold uppercase text-white">
                  Share PIXEL BOYZ on X
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm font-mono text-slate-300">
                  Publish an original post introducing PIXEL BOYZ tagging <span className="text-cyan-300 font-bold">@pixelboyzai</span> and linking to <span className="text-cyan-300 font-bold">https://www.pixelboyz.shop/mint</span>. Submit your post link below to unlock eligibility for up to 2 free NFTs.
                </p>
              </div>

              {/* Template Preview Box */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-slate-300 relative">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest pb-1 font-bold">
                  Suggested X Post Template (You may edit before publishing)
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  {X_CAMPAIGN_TEMPLATE}
                </pre>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={handleCopyTemplate}
                    className="rounded-lg border border-cyan-400/30 bg-cyan-950/40 px-3 py-1.5 font-mono text-xs text-cyan-300 hover:border-cyan-400"
                  >
                    {copiedTemplate ? '✓ Copied!' : 'Copy X Post Template'}
                  </button>
                  <button
                    onClick={handleOpenX}
                    className="rounded-lg border border-purple-500/40 bg-purple-950/40 px-3 py-1.5 font-mono text-xs text-purple-300 hover:border-purple-400 flex items-center gap-1.5"
                  >
                    <span>Open X (Post on X)</span>
                    <span>↗</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Link Input & Submission */}
            <div className="lg:w-96 flex flex-col justify-between space-y-4 rounded-2xl border border-white/10 bg-[#0c1228] p-5">
              <div className="space-y-3">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-white block">
                  Submit Your X Post Link
                </label>
                <p className="text-[11px] font-mono text-slate-400">
                  Paste the public URL of your published post tagging <strong className="text-cyan-300">@pixelboyzai</strong> to register your submission and unlock your on-chain Merkle free mint proof:
                </p>
                <input
                  type="text"
                  placeholder="https://x.com/your_handle/status/123456789..."
                  value={xPostUrl}
                  onChange={(e) => setXPostUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 font-mono text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />

                {xVerificationErr && (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 p-2.5 text-[11px] font-mono text-rose-300">
                    ⚠ {xVerificationErr}
                  </div>
                )}

                {xVerificationMsg && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-2.5 text-[11px] font-mono text-emerald-300">
                    ✓ {xVerificationMsg}
                  </div>
                )}
              </div>

              <button
                onClick={handleVerifyXPost}
                disabled={xCampaignLoading || !xPostUrl.trim()}
                className="w-full neon-button text-xs py-3 text-center disabled:opacity-50"
              >
                {xCampaignLoading
                  ? 'SUBMITTING POST LINK...'
                  : xCampaignCompleted
                  ? '✓ POST LINK SUBMITTED & VERIFIED'
                  : 'SUBMIT POST & UNLOCK PROOF 🚀'}
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. MINT MAIN GRID (Preview Character & Interactive Terminal)             */}
        {/* ========================================================================= */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: NFT Preview & Collection Metrics */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#0d1226]/80 p-5 shadow-2xl backdrop-blur-xl">
              {previewNft ? (
                <PixelBoyRenderer nft={previewNft} size="hero" showBadge={false} hideTokenId={true} hideRarity={true} />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-center font-mono text-xs text-slate-500">
                  PIXEL BOY SPECIMEN PREVIEW
                </div>
              )}
              <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-400 px-2">
                <span className="text-cyan-300 font-bold">PIXEL BOY ORIGIN SPECIMEN</span>
                <span className="text-slate-400">ERC-721 · BNB CHAIN</span>
              </div>
            </div>

            {/* Eligibility Summary Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3 font-mono text-xs">
              <div className="text-slate-400 uppercase tracking-wider font-bold">
                Wallet Eligibility Status
              </div>

              <div className="space-y-2 pt-1 border-t border-white/5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Binance Agent ID (.ai):</span>
                  <span className={isAgentIdVerified ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {isAgentIdVerified ? '✓ Verified Holder' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">X Campaign Task:</span>
                  <span className={xCampaignCompleted ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {xCampaignCompleted ? '✓ Completed' : 'Pending Verification'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Merkle Free Allocation:</span>
                  <span className="text-cyan-300 font-bold">
                    {isFreeEligible ? `${walletFreeRemaining} Free NFTs Available` : '0 Free (Standard Paid Available)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Standard Paid Cap:</span>
                  <span className="text-purple-300 font-bold">
                    {walletPaidRemaining} / 20 Remaining
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Mint Terminal */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-cyan-400/30 bg-[#0d1226] p-6 sm:p-8 shadow-2xl">
              
              {/* Wallet Status Header */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    {isFreeEligible ? (
                      <span className="rounded-lg border border-cyan-400/40 bg-cyan-950/50 px-3 py-1 font-mono text-[11px] font-bold text-cyan-300">
                        ✓ FREE MINT ELIGIBLE ({walletFreeRemaining} FREE)
                      </span>
                    ) : (
                      <span className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1 font-mono text-[11px] text-slate-400">
                        STANDARD SALE
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-display text-sm font-bold uppercase tracking-wider text-white">
                    Select Mint Quantity
                  </label>
                  <span className="font-mono text-xs text-slate-400">
                    Max Allowed: {maxAllowed} NFTs
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
                    {Array.from(new Set([1, 2, 5, 10, maxAllowed].filter((val) => val <= maxAllowed))).map((val) => (
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
                  <span>Selected Total:</span>
                  <span className="text-white font-bold">{quantity} Pixel Boyz</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    Agent ID Free Allocation:
                  </span>
                  <span className="text-cyan-300 font-bold">
                    {freeQuantity} NFT {freeQuantity > 0 ? '(0.000 BNB Free)' : '(Requires Verified Agent ID & X Post)'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    Standard Mint Quantity:
                  </span>
                  <span className="text-purple-300 font-bold">
                    {paidQuantity} NFT × {currentMintPriceBnb} BNB
                  </span>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-white uppercase">Total Payable:</span>
                  <span className="font-display text-lg font-black text-cyan-300">
                    {totalCostBnb} BNB
                  </span>
                </div>
              </div>

              {/* Strict Enforcement Agent Free-Mint Block Notice */}
              {isAgentIdVerified && !xCampaignCompleted && (
                <div className="mt-4 rounded-2xl border-2 border-rose-500/60 bg-gradient-to-r from-rose-950/70 via-[#180a14] to-rose-950/70 p-4 font-mono text-xs text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.25)] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-300 uppercase tracking-wide text-sm">
                    <span>🚫</span>
                    <span>FREE MINT BLOCKED: X POST REQUIRED</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Your Binance Agent ID is detected, but free mint access is <strong>strictly blocked</strong>—even when using an autonomous AI agent, Binance Agentic Wallet, or automation script—until you publish and submit your post on X tagging <span className="text-cyan-300 font-bold">@pixelboyzai</span> and linking to <span className="text-cyan-300 font-bold">https://www.pixelboyz.shop/mint</span>.
                  </p>
                  <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                    <span>👉</span>
                    <span>Submit your X post link in Task 3 above to unlock free mint eligibility, or select a paid quantity.</span>
                  </div>
                </div>
              )}

              {/* Status and Action Buttons */}
              <div className="mt-8 space-y-4">
                {mintStatus === 'confirmed' && (
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 font-mono text-xs text-emerald-300 space-y-2">
                    <div className="font-bold text-sm">✓ MINT SUCCESSFUL! Welcome to PIXEL BOYZ.</div>
                    {lastTxHash && (
                      <div>
                        Transaction Hash:{' '}
                        <a
                          href={`https://bscscan.com/tx/${lastTxHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-white"
                        >
                          {lastTxHash.slice(0, 16)}...{lastTxHash.slice(-8)} ↗
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {mintStatus === 'error' && (
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 font-mono text-xs text-rose-300">
                    ⚠ {errorMessage || 'Mint transaction failed or was rejected.'}
                  </div>
                )}

                {!isConnected ? (
                  <button
                    onClick={connectWallet}
                    className="w-full neon-button py-4 text-sm font-bold uppercase tracking-wider"
                  >
                    CONNECT WALLET TO MINT
                  </button>
                ) : (
                  <button
                    onClick={handleMint}
                    disabled={mintStatus === 'pending' || mintStatus === 'awaiting_signature' || quantity < 1}
                    className="w-full neon-button py-4 text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(34,211,238,0.5)] disabled:opacity-50"
                  >
                    {mintStatus === 'awaiting_signature'
                      ? 'CONFIRM IN WALLET...'
                      : mintStatus === 'pending'
                      ? 'CONFIRMING ON BNB CHAIN...'
                      : isAgentIdVerified && !xCampaignCompleted && quantity <= walletFreeRemaining
                      ? 'FREE MINT BLOCKED: SUBMIT X POST FIRST 🚫'
                      : freeQuantity > 0 && paidQuantity === 0
                      ? `CLAIM ${freeQuantity} FREE PIXEL BOY${freeQuantity > 1 ? 'Z' : ''} (0 BNB) ⚡`
                      : `MINT ${quantity} PIXEL BOY${quantity > 1 ? 'Z' : ''} (${totalCostBnb} BNB)`}
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
