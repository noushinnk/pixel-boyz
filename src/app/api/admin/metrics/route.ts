import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { MerkleTreeEngine } from '@/lib/server/merkleService';
import { bscPublicClient } from '@/lib/server/agentIdService';
import { CONTRACT_CONFIG, PIXEL_BOYZ_NFT_ABI } from '@/contracts/config';

export async function GET(req: Request) {
  try {
    const nftAddr = CONTRACT_CONFIG.nftAddress as `0x${string}`;

    // Read contract values directly
    const [
      totalMinted,
      totalFreeMinted,
      totalPaidMinted,
      paidAllocation,
      freeAllocationRemaining,
      paidAllocationRemaining,
      remainingSupply,
      onChainMerkleRoot
    ] = await Promise.all([
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'totalMinted' }).catch(() => 0n),
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'totalFreeMinted' }).catch(() => 0n),
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'totalPaidMinted' }).catch(() => 0n),
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'paidAllocation' }).catch(() => 4000n),
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'freeAllocationRemaining' }).catch(() => 6000n),
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'paidAllocationRemaining' }).catch(() => 4000n),
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'remainingSupply' }).catch(() => 10000n),
      (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'merkleRoot' }).catch(() => '0x0000000000000000000000000000000000000000000000000000000000000000')
    ]);

    // Database metrics
    const metrics = db.getMetrics();
    const allowlistWallets = db.getAllActiveAllowlist();
    const tree = new MerkleTreeEngine(allowlistWallets);
    const calculatedMerkleRoot = tree.getRoot();

    return NextResponse.json({
      onChain: {
        totalMinted: Number(totalMinted),
        totalFreeMinted: Number(totalFreeMinted),
        totalPaidMinted: Number(totalPaidMinted),
        paidAllocation: Number(paidAllocation),
        freeAllocationRemaining: Number(freeAllocationRemaining),
        paidAllocationRemaining: Number(paidAllocationRemaining),
        remainingSupply: Number(remainingSupply),
        merkleRoot: onChainMerkleRoot as string
      },
      offChain: {
        allowlistCount: allowlistWallets.length,
        allowlistWallets,
        calculatedMerkleRoot,
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
