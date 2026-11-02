/**
 * Smart Contract Configurations, ABIs, and Addresses for PIXEL BOYZ on BNB Smart Chain.
 */

export const BSC_MAINNET_CHAIN_ID = 56;
export const BSC_TESTNET_CHAIN_ID = 97;
const DEPLOYED_NFT_ADDRESS = '0xaFB50403C0838D5b45F8748138BA33A70E23b8cf';
const AGENT_ID_REGISTRY_ADDRESS = '0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F';

const getEnv = (key: string, fallback: string = ''): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[`NEXT_PUBLIC_${key}`] || process.env[`VITE_${key}`] || process.env[key] || fallback;
  }
  return fallback;
};

export const CONTRACT_CONFIG = {
  chainId: Number(getEnv('CHAIN_ID', '56')),
  networkName: 'BNB Smart Chain',
  currencySymbol: 'BNB',
  rpcUrl: getEnv('BSC_RPC_URL', 'https://bsc-dataseed.binance.org/'),
  bscScanUrl: getEnv('BSCSCAN_URL', 'https://bscscan.com'),
  assetBaseUrl: getEnv('ASSET_BASE_URL', 'https://asset.pixelboyz.shop'),
  initialOwner: getEnv('INITIAL_OWNER_ADDRESS', '0x2e588978f498a3311A3A05621f77025f19B68f8b'),
  initialTreasury: getEnv('INITIAL_TREASURY_ADDRESS', '0x2d36622575A76913b4d5521DA47e259C0579deEb'),
  registryAddress: AGENT_ID_REGISTRY_ADDRESS,
  initialBaseURI: getEnv('INITIAL_BASE_URI', 'https://asset.pixelboyz.shop/metadata/'),
  
  // Use the verified deployment rather than potentially stale hosting environment values.
  nftAddress: DEPLOYED_NFT_ADDRESS,
  marketplaceAddress: getEnv('MARKETPLACE_CONTRACT_ADDRESS', '0x4924cB9A4E995C3b0F82f43D281531f729027c58'),
  forgeAddress: getEnv('FORGE_CONTRACT_ADDRESS', '0xc7813FF48cDE3B339f16152cc8058beB43046a2b'),
  rewardsAddress: getEnv('REWARDS_CONTRACT_ADDRESS', '0xEdBc1fe3f3BA708f69a85d749C4F34c627ee8353'),
  elementMarketplaceUrl: 'https://element.market/collections/pixel-boyz',
  
  // Protocol Parameters
  totalSupply: 10000,
  freeAllocation: 6000,
  paidAllocation: 4000,
  mintPriceBnb: '',
  freeMintLimitPerWallet: 2,
  paidMintLimitPerWallet: 18,
  maxWalletAllowance: 20,
  marketplaceFeePercent: 2.5,
  royaltyPercent: 5.0,
  forgeXpRequirement: 100,
  forgeBnbCost: '', // The deployed Forge recipe determines the fee.
};

// Check if live contract addresses are configured
export const isContractDeployed = (contractKey: 'nft' | 'marketplace' | 'forge' | 'rewards'): boolean => {
  switch (contractKey) {
    case 'nft': return Boolean(CONTRACT_CONFIG.nftAddress && CONTRACT_CONFIG.nftAddress.startsWith('0x'));
    case 'marketplace': return Boolean(CONTRACT_CONFIG.marketplaceAddress && CONTRACT_CONFIG.marketplaceAddress.startsWith('0x'));
    case 'forge': return Boolean(CONTRACT_CONFIG.forgeAddress && CONTRACT_CONFIG.forgeAddress.startsWith('0x'));
    case 'rewards': return Boolean(CONTRACT_CONFIG.rewardsAddress && CONTRACT_CONFIG.rewardsAddress.startsWith('0x'));
    default: return false;
  }
};

// ERC721 Minimal ABI for PixelBoyz
export const PIXEL_BOYZ_NFT_ABI = [
  {
    type: 'function',
    name: 'mint',
    inputs: [{ name: 'quantity', type: 'uint256' }],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'totalMinted',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'ownerOf',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'hasAgentId',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'freeMintedByWallet',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'paidMintedByWallet',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'walletFreeRemaining',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'walletPaidRemaining',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'walletRemaining',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'freeSaleActive',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'paidSaleActive',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'mintPrice',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalFreeMinted',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'totalPaidMinted',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'paidAllocation',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'freeAllocationRemaining',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'remainingSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'freePhaseClosed',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'setSaleStatus',
    inputs: [
      { name: 'freeActive', type: 'bool' },
      { name: 'paidActive', type: 'bool' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'closeFreePhase',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  }
] as const;

export const MARKETPLACE_ABI = [
  {
    type: 'function',
    name: 'list',
    inputs: [
      { name: 'nft', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'price', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'buy',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'cancelListing',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'makeOffer',
    inputs: [
      { name: 'nft', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'expiry', type: 'uint64' }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'acceptOffer',
    inputs: [
      { name: 'offerId', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  }
] as const;

export const FORGE_ABI = [
  {
    type: 'function',
    name: 'forge',
    inputs: [
      { name: 'upgradedTokenId', type: 'uint256' },
      { name: 'burnedTokenIds', type: 'uint256[]' }
    ],
    outputs: [{ name: 'newTokenId', type: 'uint256' }],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'requiredXp',
    inputs: [{ name: 'level', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const;

export const REWARDS_ABI = [
  {
    type: 'function',
    name: 'claim',
    inputs: [
      { name: 'epoch', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'merkleProof', type: 'bytes32[]' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'epochs',
    inputs: [{ name: 'epochId', type: 'uint256' }],
    outputs: [
      { name: 'merkleRoot', type: 'bytes32' },
      { name: 'allocation', type: 'uint256' },
      { name: 'claimed', type: 'uint256' },
      { name: 'exists', type: 'bool' }
    ],
    stateMutability: 'view'
  }
] as const;
