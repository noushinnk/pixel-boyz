import { NextResponse } from 'next/server';
import { formatEther, isAddress } from 'viem';
import { bscPublicClient } from '@/lib/server/agentIdService';
import { CONTRACT_CONFIG, PIXEL_BOYZ_NFT_ABI } from '@/contracts/config';
import { db } from '@/lib/server/db';

export const revalidate = 10; // Cache on edge for 10 seconds

interface CachedStats {
  data: any;
  timestamp: number;
}

let memoryStatsCache: CachedStats | null = null;
const CACHE_TTL_MS = 15_000; // 15 seconds in-memory cache

const DEFAULT_STATS = {
  contractAddress: CONTRACT_CONFIG.nftAddress,
  network: 'BNB Smart Chain Mainnet',
  chainId: 56,
  maxSupply: 10000,
  totalMinted: 0,
  totalFreeMinted: 0,
  totalPaidMinted: 0,
  initialFreeAllocation: 6000,
  paidAllocation: 4000,
  freeAllocationRemaining: 6000,
  paidAllocationRemaining: 4000,
  remainingSupply: 10000,
  mintPriceWei: '1000000000000000',
  mintPriceBnb: '0.001',
  freeSaleActive: true,
  paidSaleActive: true,
  freePhaseClosed: false
};

async function fetchStatsFromChain(nftAddr: `0x${string}`) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('RPC Timeout (3s exceeded)')), 3000)
  );

  const queryPromise = Promise.all([
    (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'totalFreeMinted' }).catch(() => 0n),
    (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'totalPaidMinted' }).catch(() => 0n),
    (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'paidAllocation' }).catch(() => 4000n),
    (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'mintPrice' }).catch(() => 1000000000000000n),
    (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'freeSaleActive' }).catch(() => true),
    (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'paidSaleActive' }).catch(() => true),
    (bscPublicClient.readContract as any)({ address: nftAddr, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'freePhaseClosed' }).catch(() => false)
  ]);

  const [tFree, tPaid, pAlloc, mPrice, fActive, pActive, fClosed] = (await Promise.race([
    queryPromise,
    timeoutPromise
  ])) as any;

  const freeMinted = Number(tFree);
  const paidMinted = Number(tPaid);
  const total = freeMinted + paidMinted;
  const paidAllocation = Number(pAlloc);
  const freeAllocationRemaining = Math.max(0, 6000 - freeMinted);
  const paidAllocationRemaining = Math.max(0, paidAllocation - paidMinted);
  const remainingSupply = Math.max(0, 10000 - total);
  const priceWei = BigInt(mPrice);

  return {
    contractAddress: nftAddr,
    network: 'BNB Smart Chain Mainnet',
    chainId: 56,
    maxSupply: 10000,
    totalMinted: total,
    totalFreeMinted: freeMinted,
    totalPaidMinted: paidMinted,
    initialFreeAllocation: 6000,
    paidAllocation,
    freeAllocationRemaining,
    paidAllocationRemaining,
    remainingSupply,
    mintPriceWei: priceWei.toString(),
    mintPriceBnb: formatEther(priceWei),
    freeSaleActive: Boolean(fActive),
    paidSaleActive: Boolean(pActive),
    freePhaseClosed: Boolean(fClosed),
    timestamp: Date.now()
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const nftAddr = CONTRACT_CONFIG.nftAddress as `0x${string}`;

  let stats: any = null;
  const now = Date.now();

  // 1. Check in-memory cache first or return defaults if no contract configured
  if (!nftAddr || !nftAddr.startsWith('0x')) {
    stats = { ...DEFAULT_STATS, timestamp: now };
  } else if (memoryStatsCache && now - memoryStatsCache.timestamp < CACHE_TTL_MS) {
    stats = memoryStatsCache.data;
  } else {
    try {
      stats = await fetchStatsFromChain(nftAddr);
      memoryStatsCache = { data: stats, timestamp: now };
    } catch (err) {
      console.warn('RPC fetch failed or timed out, using fallback stats cache:', err);
      stats = memoryStatsCache ? memoryStatsCache.data : { ...DEFAULT_STATS, timestamp: now };
    }
  }

  // 2. If user wallet address was passed, enrich response with wallet-specific data
  let walletData = null;
  if (address && isAddress(address)) {
    const normalized = address.toLowerCase();
    const campaignRecord = db.getCampaignSubmissionByWallet(normalized);
    const xCampaignCompleted = Boolean(campaignRecord?.verified);

    let isAgentIdVerified = false;
    let walletFreeMinted = 0;
    let walletPaidMinted = 0;
    let walletFreeRemaining = 0;
    let walletPaidRemaining = 0;
    let walletRemaining = 0;
    try {
      const [hasAgentId, freeMinted, paidMinted, freeRemaining, paidRemaining, totalRemaining] = await Promise.all([
        (bscPublicClient.readContract as any)({
          address: nftAddr,
          abi: PIXEL_BOYZ_NFT_ABI,
          functionName: 'hasAgentId',
          args: [normalized]
        }),
        (bscPublicClient.readContract as any)({
          address: nftAddr,
          abi: PIXEL_BOYZ_NFT_ABI,
          functionName: 'freeMintedByWallet',
          args: [normalized]
        }),
        (bscPublicClient.readContract as any)({
          address: nftAddr,
          abi: PIXEL_BOYZ_NFT_ABI,
          functionName: 'paidMintedByWallet',
          args: [normalized]
        }),
        (bscPublicClient.readContract as any)({
          address: nftAddr,
          abi: PIXEL_BOYZ_NFT_ABI,
          functionName: 'walletFreeRemaining',
          args: [normalized]
        }),
        (bscPublicClient.readContract as any)({
          address: nftAddr,
          abi: PIXEL_BOYZ_NFT_ABI,
          functionName: 'walletPaidRemaining',
          args: [normalized]
        }),
        (bscPublicClient.readContract as any)({
          address: nftAddr,
          abi: PIXEL_BOYZ_NFT_ABI,
          functionName: 'walletRemaining',
          args: [normalized]
        })
      ]);
      isAgentIdVerified = Boolean(hasAgentId);
      walletFreeMinted = Number(freeMinted);
      walletPaidMinted = Number(paidMinted);
      walletFreeRemaining = Number(freeRemaining);
      walletPaidRemaining = Number(paidRemaining);
      walletRemaining = Number(totalRemaining);
    } catch (error) {
      console.warn('Could not read wallet mint status from contract:', error);
    }

    walletData = {
      address: normalized,
      isAgentIdVerified,
      xCampaignCompleted,
      isEligible: isAgentIdVerified && walletFreeRemaining > 0 && Boolean(stats.freeSaleActive) && !Boolean(stats.freePhaseClosed),
      walletFreeMinted,
      walletPaidMinted,
      walletFreeRemaining,
      walletPaidRemaining,
      walletRemaining
    };
  }

  return NextResponse.json(
    {
      ...stats,
      ...(walletData ? { wallet: walletData } : {})
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
      }
    }
  );
}
