import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { bscPublicClient } from '@/lib/server/agentIdService';
import { CONTRACT_CONFIG, PIXEL_BOYZ_NFT_ABI } from '@/contracts/config';

export async function GET(req: Request) {
  try {
    const nftAddr = CONTRACT_CONFIG.nftAddress as `0x${string}`;
    const isDeployed = Boolean(nftAddr && nftAddr.startsWith('0x'));

    // Read contract values directly if deployed
    const [
      totalMinted,
      totalFreeMinted,
      totalPaidMinted,
      paidAllocation,
      remainingSupply
    ] = isDeployed ? await Promise.all([
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'totalMinted' }).catch(() => 0n),
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'totalFreeMinted' }).catch(() => 0n),
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'totalPaidMinted' }).catch(() => 0n),
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'paidAllocation' }).catch(() => 4000n),
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'remainingSupply' }).catch(() => 10000n)
    ]) : [0n, 0n, 0n, 4000n, 10000n];

    // Database metrics
    const metrics = db.getMetrics();

    return NextResponse.json({
      onChain: {
        totalMinted: Number(totalMinted),
        totalFreeMinted: Number(totalFreeMinted),
        totalPaidMinted: Number(totalPaidMinted),
        paidAllocation: Number(paidAllocation),
        freeAllocationRemaining: Math.max(0, 6000 - Number(totalFreeMinted)),
        paidAllocationRemaining: Math.max(0, Number(paidAllocation) - Number(totalPaidMinted)),
        remainingSupply: Number(remainingSupply)
      },
      offChain: {
        totalUsers: metrics.totalUsers,
        totalAgentIdVerifications: metrics.totalAgentIdVerifications,
        totalCampaignCompletions: metrics.totalCampaignCompletions
      },
      recentMints: metrics.recentMints,
      recentVerifications: metrics.recentVerifications,
      recentCampaigns: metrics.recentCampaigns,
      auditLogs: metrics.auditLogs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch admin metrics' }, { status: 500 });
  }
}
