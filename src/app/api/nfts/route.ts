import { NextResponse } from 'next/server';
import { CONTRACT_CONFIG, PIXEL_BOYZ_NFT_ABI } from '@/contracts/config';
import { bscPublicClient } from '@/lib/server/agentIdService';
import { ARCHETYPES } from '@/data/collectionData';
import { PixelBoyNFT, RarityTier } from '@/types/nft';

export const revalidate = 60;

interface CachedCollection {
  data: { contractAddress: string; totalMinted: number; nfts: PixelBoyNFT[]; updatedAt: number };
  timestamp: number;
}

const collectionCache = new Map<string, CachedCollection>();
const CACHE_TTL_MS = 60_000;
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' };
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const RARITIES: RarityTier[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 30; // Keeps Cloudflare Worker subrequests strictly under limit

function metadataValue(metadata: any, key: string): string {
  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  const attributes = Array.isArray(metadata?.attributes)
    ? metadata.attributes
    : Object.entries(metadata?.properties || {}).map(([trait_type, value]) => ({ trait_type, value }));
  const attribute = attributes.find((item: any) =>
    String(item.trait_type || item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey
  );
  return attribute?.value == null ? '' : String(attribute.value);
}

function metadataImage(image: unknown, metadataUri: string, tokenId: number): string | undefined {
  if (typeof image === 'string' && image) {
    if (image.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${image.slice(7)}`;
    try {
      return new URL(image, metadataUri).toString();
    } catch {
      // fallback
    }
  }
  return `${CONTRACT_CONFIG.assetBaseUrl}/images/${tokenId}.png`;
}

async function fetchMetadata(uri: string): Promise<any> {
  try {
    const metadataUrl = new URL(uri);
    const baseUrl = new URL(CONTRACT_CONFIG.initialBaseURI);
    if (metadataUrl.origin !== baseUrl.origin) return null;
    const response = await fetch(metadataUrl, { signal: AbortSignal.timeout(1500), cache: 'force-cache' });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function buildNft(tokenId: number, owner: string, metadataUri: string, metadata: any): PixelBoyNFT {
  const archetypeValue = metadataValue(metadata, 'archetype');
  const archetype = ARCHETYPES.find(item => item.name.toLowerCase() === archetypeValue.toLowerCase())?.name || 'Unknown';
  const rarityValue = metadataValue(metadata, 'rarity');
  const rarity = RARITIES.find(item => item.toLowerCase() === rarityValue.toLowerCase()) || 'Unknown';

  return {
    id: tokenId,
    tokenId: `PB-${String(tokenId).padStart(4, '0')}`,
    name: typeof metadata?.name === 'string' ? metadata.name : `Pixel Boy #${String(tokenId).padStart(4, '0')}`,
    image: metadataImage(metadata?.image, metadataUri, tokenId),
    level: Number(metadataValue(metadata, 'level')) || 0,
    rarity,
    rarityScore: Number(metadataValue(metadata, 'rarity score')) || 0,
    owner,
    creator: 'Unknown',
    mintedAt: 0,
    mintTxHash: '',
    metadataUri,
    traits: {
      archetype,
      headgear: metadataValue(metadata, 'headgear') || 'Unknown',
      visor: metadataValue(metadata, 'visor') || 'Unknown',
      armor: metadataValue(metadata, 'armor') || metadataValue(metadata, 'body') || 'Unknown',
      weapon: metadataValue(metadata, 'weapon') || 'Unknown',
      core: metadataValue(metadata, 'core') || 'Unknown',
      background: metadataValue(metadata, 'background') || 'Unknown',
      skinTone: metadataValue(metadata, 'skin tone') || 'Unknown'
    },
    isListed: false,
    price: null,
    seller: null,
    highestOffer: null,
    history: [],
    xp: 0
  };
}

async function fetchCollection(page = 1, limit = DEFAULT_LIMIT) {
  const address = CONTRACT_CONFIG.nftAddress as `0x${string}`;

  let totalMinted = 0;
  try {
    totalMinted = Number(await (bscPublicClient.readContract as any)({
      address,
      abi: PIXEL_BOYZ_NFT_ABI,
      functionName: 'totalMinted'
    }));
  } catch (err) {
    console.warn('Failed to read totalMinted from contract:', err);
    return { contractAddress: address, totalMinted: 0, nfts: [], updatedAt: Date.now() };
  }

  if (totalMinted <= 0) {
    return { contractAddress: address, totalMinted: 0, nfts: [], updatedAt: Date.now() };
  }

  const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
  const maxAvailable = Math.min(totalMinted, CONTRACT_CONFIG.totalSupply);
  const totalPages = Math.ceil(maxAvailable / safeLimit);
  const safePage = Math.min(Math.max(1, page), totalPages || 1);
  const startIndex = (safePage - 1) * safeLimit;
  const endIndex = Math.min(startIndex + safeLimit, maxAvailable);

  const tokenIds: bigint[] = [];
  for (let i = startIndex + 1; i <= endIndex; i++) {
    tokenIds.push(BigInt(i));
  }

  if (tokenIds.length === 0) {
    return { contractAddress: address, totalMinted, nfts: [], updatedAt: Date.now() };
  }

  // Single RPC multicall subrequest to BSC RPC
  const contracts = tokenIds.flatMap(tokenId => [
    { address, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'ownerOf', args: [tokenId] },
    { address, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'tokenURI', args: [tokenId] }
  ]);

  let results: any[] = [];
  try {
    results = await (bscPublicClient.multicall as any)({ contracts, allowFailure: true });
  } catch (err) {
    console.error('BSC RPC multicall failed:', err);
    return { contractAddress: address, totalMinted, nfts: [], updatedAt: Date.now() };
  }

  const liveTokens: Array<{ tokenId: number; owner: string; metadataUri: string }> = [];
  tokenIds.forEach((tokenId, index) => {
    const ownerResult = results[index * 2];
    const uriResult = results[index * 2 + 1];
    if (ownerResult?.status !== 'success' || uriResult?.status !== 'success') return;
    if (String(ownerResult.result).toLowerCase() === ZERO_ADDRESS) return;
    liveTokens.push({
      tokenId: Number(tokenId),
      owner: ownerResult.result,
      metadataUri: uriResult.result
    });
  });

  // Fetch metadata for up to 12 items to stay well within Cloudflare Worker subrequest budget
  const nfts = await Promise.all(
    liveTokens.map(async (token, idx) => {
      let metadata: any = null;
      if (idx < 12) {
        metadata = await fetchMetadata(token.metadataUri);
      }
      return buildNft(token.tokenId, token.owner, token.metadataUri, metadata);
    })
  );

  return { contractAddress: address, totalMinted, nfts, updatedAt: Date.now() };
}

export async function GET(req: Request) {
  const now = Date.now();
  if (!CONTRACT_CONFIG.nftAddress.startsWith('0x')) {
    return NextResponse.json({ contractAddress: '', totalMinted: 0, nfts: [], updatedAt: now });
  }

  let page = 1;
  let limit = DEFAULT_LIMIT;
  try {
    const { searchParams } = new URL(req.url);
    page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  } catch {
    // URL parse fallback
  }

  const cacheKey = `${page}:${limit}`;
  const cached = collectionCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, { headers: CACHE_HEADERS });
  }

  try {
    const data = await fetchCollection(page, limit);
    collectionCache.set(cacheKey, { data, timestamp: now });
    return NextResponse.json(data, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Error in /api/nfts:', error);
    if (cached) {
      return NextResponse.json(cached.data, { headers: CACHE_HEADERS });
    }
    return NextResponse.json({ contractAddress: CONTRACT_CONFIG.nftAddress, totalMinted: 0, nfts: [], updatedAt: now });
  }
}
