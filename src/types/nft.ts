export type RarityTier = 'Unknown' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type Archetype = 
  | 'Cyborg'
  | 'Neon Ronin'
  | 'Quantum Hacker'
  | 'Shadow Operative'
  | 'Astro Pilot'
  | 'Glitch Nomad'
  | 'Synth Priest'
  | 'Holo Brawler'
  | 'Unknown';

export interface NFTTraits {
  archetype: Archetype;
  headgear: string;
  visor: string;
  armor: string;
  weapon: string;
  core: string;
  background: string;
  skinTone: string;
}

export interface NFTHistoryItem {
  id: string;
  type: 'mint' | 'transfer' | 'list' | 'sale' | 'forge';
  from: string;
  to: string;
  price?: string; // in BNB
  timestamp: number;
  txHash: string;
}

export interface PixelBoyNFT {
  id: number;
  tokenId: string; // e.g. "PB-0042"
  name: string;
  image?: string; // path to uploaded/generated asset
  level: number; // 1 to 5
  rarity: RarityTier;
  rarityScore: number;
  owner: string;
  creator: string;
  mintedAt: number;
  mintTxHash: string;
  metadataUri?: string;
  traits: NFTTraits;
  isListed: boolean;
  price: string | null; // in BNB, e.g. "0.045"
  seller: string | null;
  highestOffer?: {
    bidder: string;
    amount: string; // in BNB
    timestamp: number;
  } | null;
  history: NFTHistoryItem[];
  xp: number;
}

export interface MarketplaceListing {
  id: string;
  tokenId: number;
  seller: string;
  price: string; // in BNB
  listedAt: number;
  active: boolean;
}

export interface MarketplaceOffer {
  id: string;
  tokenId: number;
  bidder: string;
  amount: string; // in BNB
  createdAt: number;
  expiresAt: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'Onboarding' | 'Collector' | 'Market' | 'Evolution';
  xpReward: number;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  actionRoute: string;
  actionLabel: string;
}

export interface ActivityEvent {
  id: string;
  type: 'mint_free' | 'mint_paid' | 'sale' | 'listing' | 'offer' | 'forge' | 'reward_claim';
  wallet: string;
  tokenId?: number;
  amount?: string;
  timestamp: number;
  txHash: string;
  status: 'confirmed' | 'pending';
}

export interface UserProfile {
  address: string;
  username: string;
  avatarTokenId: number;
  xp: number;
  bio: string;
  joinedAt: number;
  claimedEpochs: number[];
  completedQuests: string[];
}
