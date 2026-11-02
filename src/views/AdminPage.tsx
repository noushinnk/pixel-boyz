"use client";

import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { CONTRACT_CONFIG } from "../contracts/config";

interface AdminPageProps {
  navigate: (route: string) => void;
}

export function AdminPage({ navigate }: AdminPageProps) {
  const { account, isConnected, connectWallet } = useWeb3();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [copiedRoot, setCopiedRoot] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'campaigns' | 'mints' | 'audit'>('overview');

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else {
        setError('Failed to fetch admin metrics.');
      }
    } catch (e: any) {
      setError(e.message || 'Error loading metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyRoot = (root: string) => {
    navigator.clipboard.writeText(root);
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 2500);
  };

  const isAdminWallet = account && (
    account.toLowerCase() === '0x2d36622575A76913b4d5521DA47e259C0579deEb'.toLowerCase() ||
    account.toLowerCase() === '0x71332AE6F510E5D9C5C8c3385ef083d3A312c6a4'.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#060813] text-white pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="eyebrow flex items-center gap-2">
              <span className="pulse-dot" />
              SECURITY PROTOCOL & CONTROL ROOM
            </div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="mt-2 text-sm text-slate-300 font-sans max-w-2xl">
              Real-time monitoring of BNB Chain smart contract state, Merkle allowlist integrity, Binance Agent ID registry verifications, and X campaign task completions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/mint')}
              className="rounded-xl border border-cyan-400/40 bg-cyan-950/40 px-4 py-2 text-xs font-mono text-cyan-300 hover:border-cyan-300 transition-colors"
            >
              ← Back to Mint Page
            </button>
            <button
              onClick={fetchMetrics}
              className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-mono text-slate-300"
            >
              Refresh 🔄
            </button>
          </div>
        </div>

        {/* Admin Access Indicator */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Connected Wallet:</span>
            {isConnected ? (
              <span className="text-white font-bold">{account}</span>
            ) : (
              <span className="text-amber-400">Not Connected</span>
            )}
            {isAdminWallet && (
              <span className="rounded-md border border-emerald-400/50 bg-emerald-950/60 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
                ✓ SALE MANAGER ROLE
              </span>
            )}
          </div>

          {!isConnected && (
            <button onClick={() => connectWallet()} className="neon-button text-xs py-1.5 px-3">
              Connect Admin Wallet
            </button>
          )}
        </div>

        {/* Top 6 KPI Cards */}
        {metrics && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#0c1228] p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">Total Minted</span>
              <span className="font-display text-2xl font-black text-white mt-1 block">
                {metrics.onChain?.totalMinted?.toLocaleString?.() ?? 0}
              </span>
              <span className="text-[10px] font-mono text-slate-500">/ 10,000 Max</span>
            </div>

            <div className="rounded-2xl border border-cyan-400/30 bg-[#09152e] p-4">
              <span className="text-[11px] font-mono text-cyan-400 uppercase block">Free Minted</span>
              <span className="font-display text-2xl font-black text-cyan-200 mt-1 block">
                {metrics.onChain?.totalFreeMinted?.toLocaleString?.() ?? 0}
              </span>
              <span className="text-[10px] font-mono text-cyan-500">/ 6,000 Initial</span>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-[#120f2b] p-4">
              <span className="text-[11px] font-mono text-purple-400 uppercase block">Paid Minted</span>
              <span className="font-display text-2xl font-black text-purple-200 mt-1 block">
                {metrics.onChain?.totalPaidMinted?.toLocaleString?.() ?? 0}
              </span>
              <span className="text-[10px] font-mono text-purple-500">/ {metrics.onChain?.paidAllocation?.toLocaleString?.() ?? 4000} Alloc</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0c1228] p-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase block">Remaining Supply</span>
              <span className="font-display text-2xl font-black text-emerald-300 mt-1 block">
                {metrics.onChain?.remainingSupply?.toLocaleString?.() ?? 10000}
              </span>
              <span className="text-[10px] font-mono text-slate-500">Total Unminted</span>
            </div>

            <div className="rounded-2xl border border-cyan-400/30 bg-[#0c1228] p-4">
              <span className="text-[11px] font-mono text-cyan-400 uppercase block">Free Remaining</span>
              <span className="font-display text-2xl font-black text-cyan-300 mt-1 block">
                {metrics.onChain?.freeAllocationRemaining?.toLocaleString?.() ?? 6000}
              </span>
              <span className="text-[10px] font-mono text-slate-500">Free Slots</span>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-[#0c1228] p-4">
              <span className="text-[11px] font-mono text-purple-400 uppercase block">Paid Remaining</span>
              <span className="font-display text-2xl font-black text-purple-300 mt-1 block">
                {metrics.onChain?.paidAllocationRemaining?.toLocaleString?.() ?? 4000}
              </span>
              <span className="text-[10px] font-mono text-slate-500">Paid Slots</span>
            </div>
          </div>
        )}

        {/* Merkle Root Synchronization Card */}
        {metrics && (
          <div className="mt-8 rounded-3xl border border-cyan-400/40 bg-[#09152e] p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 block font-bold">
                  CRYPTOGRAPHIC ALLOWLIST STATUS
                </span>
                <h3 className="font-display text-xl font-bold uppercase text-white mt-0.5">
                  Merkle Root Management & Synchronization
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Eligible Wallets:</span>
                <span className="rounded-lg border border-cyan-400/50 bg-cyan-400/20 px-2.5 py-1 font-mono text-xs text-cyan-200 font-bold">
                  {metrics.offChain?.allowlistCount ?? 0} Wallets
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-1.5">
                <span className="text-slate-400 block text-[11px] uppercase">Currently Installed On-Chain Merkle Root:</span>
                <code className="text-emerald-400 font-bold block break-all text-xs">
                  {metrics.onChain?.merkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000'}
                </code>
                <span className="text-[10px] text-slate-500 block">
                  {metrics.onChain?.merkleRoot === '0x0000000000000000000000000000000000000000000000000000000000000000'
                    ? 'Root is currently 0x0. Call setMerkleRoot to enable on-chain free claims.'
                    : 'Active Merkle root on BNB Smart Chain'}
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 block text-[11px] uppercase">Calculated Allowlist Merkle Root:</span>
                  <button
                    onClick={() => handleCopyRoot(metrics.offChain?.calculatedMerkleRoot)}
                    className="text-cyan-400 hover:text-cyan-300 text-[10px] underline"
                  >
                    {copiedRoot ? '✓ Copied' : 'Copy Root'}
                  </button>
                </div>
                <code className="text-cyan-300 font-bold block break-all text-xs">
                  {metrics.offChain?.calculatedMerkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000'}
                </code>
                <span className="text-[10px] text-slate-500 block">
                  Generated from {metrics.offChain?.allowlistCount ?? 0} verified wallets using sorted pair keccak256
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] font-mono text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>
                To install this Merkle root on-chain: Call <code className="text-cyan-300">setMerkleRoot(bytes32 newRoot)</code> on contract <code className="text-slate-200">{CONTRACT_CONFIG.nftAddress}</code> from an account with <code className="text-purple-300">SALE_MANAGER_ROLE</code>.
              </span>
              <button
                onClick={() => handleCopyRoot(metrics.offChain?.calculatedMerkleRoot)}
                className="neon-button text-xs py-2 px-4 whitespace-nowrap self-start sm:self-auto"
              >
                {copiedRoot ? '✓ Root Copied' : 'Copy New Root for Contract'}
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-3">
          {[
            { id: 'overview', label: 'Recent Activity' },
            { id: 'verifications', label: `Agent ID Verifications (${metrics?.offChain?.totalAgentIdVerifications ?? 0})` },
            { id: 'campaigns', label: `X Campaign Submissions (${metrics?.offChain?.totalCampaignCompletions ?? 0})` },
            { id: 'mints', label: `Mint Transactions (${metrics?.recentMints?.length ?? 0})` },
            { id: 'audit', label: `Audit Logs (${metrics?.auditLogs?.length ?? 0})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-xl px-4 py-2 text-xs font-mono font-bold transition-colors ${
                activeTab === tab.id
                  ? 'border border-cyan-400 bg-cyan-400/20 text-cyan-300'
                  : 'border border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Mints */}
              <div className="rounded-2xl border border-white/10 bg-[#0c1228] p-5 space-y-3 font-mono text-xs">
                <span className="font-bold text-white uppercase tracking-wider block">Recent Confirmed Mints</span>
                {metrics?.recentMints && metrics.recentMints.length > 0 ? (
                  <div className="divide-y divide-white/5 space-y-2">
                    {metrics.recentMints.slice(0, 5).map((m: any) => (
                      <div key={m.id} className="pt-2 flex items-center justify-between">
                        <div>
                          <span className="text-white font-semibold">{m.wallet_address.slice(0, 6)}...{m.wallet_address.slice(-4)}</span>
                          <span className="text-[10px] text-slate-400 block">
                            Qty: {m.quantity} (Free: {m.free_qty}, Paid: {m.paid_qty})
                          </span>
                        </div>
                        <a
                          href={`https://bscscan.com/tx/${m.tx_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 underline text-[11px]"
                        >
                          View BSCScan ↗
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 py-4">No mint transactions recorded yet.</p>
                )}
              </div>

              {/* Recent Verifications */}
              <div className="rounded-2xl border border-white/10 bg-[#0c1228] p-5 space-y-3 font-mono text-xs">
                <span className="font-bold text-white uppercase tracking-wider block">Recent Agent ID Checks</span>
                {metrics?.recentVerifications && metrics.recentVerifications.length > 0 ? (
                  <div className="divide-y divide-white/5 space-y-2">
                    {metrics.recentVerifications.slice(0, 5).map((v: any) => (
                      <div key={v.id} className="pt-2 flex items-center justify-between">
                        <div>
                          <span className="text-white font-semibold">{v.wallet_address.slice(0, 6)}...{v.wallet_address.slice(-4)}</span>
                          <span className="text-[10px] text-slate-400 block">{v.agent_id_name || 'Checked'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.verified ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                          {v.verified ? 'VERIFIED' : 'FAILED'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 py-4">No Agent ID verifications recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'verifications' && (
            <div className="rounded-2xl border border-white/10 bg-[#0c1228] p-5 font-mono text-xs overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-[11px] uppercase">
                    <th className="pb-3">Wallet Address</th>
                    <th className="pb-3">Agent ID Handle</th>
                    <th className="pb-3">Verification Status</th>
                    <th className="pb-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {metrics?.recentVerifications?.map((v: any) => (
                    <tr key={v.id} className="text-slate-300">
                      <td className="py-2.5 font-bold text-white">{v.wallet_address}</td>
                      <td className="py-2.5 text-cyan-300">{v.agent_id_name || '—'}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.verified ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                          {v.verified ? 'ELIGIBLE' : 'NOT DETECTED'}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{new Date(v.checked_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="rounded-2xl border border-white/10 bg-[#0c1228] p-5 font-mono text-xs overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-[11px] uppercase">
                    <th className="pb-3">Wallet Address</th>
                    <th className="pb-3">Post ID</th>
                    <th className="pb-3">X Author ID</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {metrics?.recentCampaigns?.map((c: any) => (
                    <tr key={c.id} className="text-slate-300">
                      <td className="py-2.5 font-bold text-white">{c.wallet_address}</td>
                      <td className="py-2.5">
                        <a href={c.post_url} target="_blank" rel="noreferrer" className="text-cyan-400 underline">
                          {c.post_id} ↗
                        </a>
                      </td>
                      <td className="py-2.5 text-slate-400">{c.x_user_id || '—'}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.verified ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                          {c.verified ? 'VERIFIED' : 'REJECTED'}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{c.error_reason || 'Verified original campaign post'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'mints' && (
            <div className="rounded-2xl border border-white/10 bg-[#0c1228] p-5 font-mono text-xs overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-[11px] uppercase">
                    <th className="pb-3">Wallet Address</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Free Qty</th>
                    <th className="pb-3">Paid Qty</th>
                    <th className="pb-3">Price Paid</th>
                    <th className="pb-3">Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {metrics?.recentMints?.map((m: any) => (
                    <tr key={m.id} className="text-slate-300">
                      <td className="py-2.5 font-bold text-white">{m.wallet_address}</td>
                      <td className="py-2.5">{m.quantity}</td>
                      <td className="py-2.5 text-cyan-300 font-bold">{m.free_qty}</td>
                      <td className="py-2.5 text-purple-300 font-bold">{m.paid_qty}</td>
                      <td className="py-2.5">{m.price_bnb} BNB</td>
                      <td className="py-2.5">
                        <a href={`https://bscscan.com/tx/${m.tx_hash}`} target="_blank" rel="noreferrer" className="text-cyan-400 underline">
                          {m.tx_hash.slice(0, 10)}... ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="rounded-2xl border border-white/10 bg-[#0c1228] p-5 font-mono text-xs overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-[11px] uppercase">
                    <th className="pb-3">Action</th>
                    <th className="pb-3">Details</th>
                    <th className="pb-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {metrics?.auditLogs?.map((log: any) => (
                    <tr key={log.id} className="text-slate-300">
                      <td className="py-2.5 font-bold text-cyan-300">{log.action}</td>
                      <td className="py-2.5 text-slate-300">{log.details}</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
