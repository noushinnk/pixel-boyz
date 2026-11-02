import { NextResponse } from 'next/server';
import { CONTRACT_CONFIG, PIXEL_BOYZ_NFT_ABI } from '@/contracts/config';
import { bscPublicClient } from '@/lib/server/agentIdService';
import { ARCHETYPES } from '@/data/collectionData';
import { PixelBoyNFT, RarityTier } from '@/types/nft';

export const revalidate = 15;

interface CachedCollection {
  data: { contractAddress: string; totalMinted: number; nfts: PixelBoyNFT[]; updatedAt: number };
  timestamp: number;
}

let collectionCache: CachedCollection | null = null;
const CACHE_TTL_MS = 20_000;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const RARITIES: RarityTier[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];

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

function metadataImage(image: unknown, metadataUri: string): string | undefined {
  if (typeof image !== 'string' || !image) return undefined;
  if (image.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${image.slice(7)}`;
  try {
    return new URL(image, metadataUri).toString();
  } catch {
    return undefined;
  }
}

async function fetchMetadata(uri: string): Promise<any> {
  try {
    const metadataUrl = new URL(uri);
    const baseUrl = new URL(CONTRACT_CONFIG.initialBaseURI);
    if (metadataUrl.origin !== baseUrl.origin) return null;
    const response = await fetch(metadataUrl, { signal: AbortSignal.timeout(2500), cache: 'force-cache' });
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
    image: metadataImage(metadata?.image, metadataUri),
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

async function fetchCollection() {
  const address = CONTRACT_CONFIG.nftAddress as `0x${string}`;
  const totalMinted = Number(await (bscPublicClient.readContract as any)({
    address,
    abi: PIXEL_BOYZ_NFT_ABI,
    functionName: 'totalMinted'
  }));
  const tokenIds = Array.from({ length: Math.min(totalMinted, CONTRACT_CONFIG.totalSupply) }, (_, index) => BigInt(index + 1));
  const liveTokens: Array<{ tokenId: number; owner: string; metadataUri: string }> = [];

  for (let start = 0; start < tokenIds.length; start += 50) {
    const chunk = tokenIds.slice(start, start + 50);
    const contracts = chunk.flatMap(tokenId => [
      { address, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'ownerOf', args: [tokenId] },
      { address, abi: PIXEL_BOYZ_NFT_ABI, functionName: 'tokenURI', args: [tokenId] }
    ]);
    const results = await (bscPublicClient.multicall as any)({ contracts, allowFailure: true });

    chunk.forEach((tokenId, index) => {
      const ownerResult = results[index * 2];
      const uriResult = results[index * 2 + 1];
      if (ownerResult?.status !== 'success' || uriResult?.status !== 'success') return;
      if (String(ownerResult.result).toLowerCase() === ZERO_ADDRESS) return;
      liveTokens.push({ tokenId: Number(tokenId), owner: ownerResult.result, metadataUri: uriResult.result });
    });
  }

  const nfts = await Promise.all(liveTokens.map(async token => {
    const metadata = await fetchMetadata(token.metadataUri);
    return buildNft(token.tokenId, token.owner, token.metadataUri, metadata);
  }));

  return { contractAddress: address, totalMinted, nfts, updatedAt: Date.now() };
}

export async function GET() {
  const now = Date.now();
  if (!CONTRACT_CONFIG.nftAddress.startsWith('0x')) {
    return NextResponse.json({ contractAddress: '', totalMinted: 0, nfts: [], updatedAt: now });
  }

  if (collectionCache && now - collectionCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(collectionCache.data);
  }

  try {
    const data = await fetchCollection();
    collectionCache = { data, timestamp: now };
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' }
    });
  } catch (error) {
    console.error('Error fetching live collection:', error);
    return NextResponse.json({ error: 'Unable to load on-chain NFTs' }, { status: 502 });
  }
}