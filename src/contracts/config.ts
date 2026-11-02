/**
 * Smart Contract Configurations, ABIs, and Addresses for PIXEL BOYZ on BNB Smart Chain.
 */

export const BSC_MAINNET_CHAIN_ID = 56;
export const BSC_TESTNET_CHAIN_ID = 97;

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
  assetBaseUrl: getEnv('ASSET_BASE_URL', 'https://assets.pixelboyz.io'),
  
  // Contract Addresses (configured via env or null when pending deployment)
  nftAddress: getEnv('NFT_CONTRACT_ADDRESS', ''),
  marketplaceAddress: getEnv('MARKETPLACE_CONTRACT_ADDRESS', ''),
  forgeAddress: getEnv('FORGE_CONTRACT_ADDRESS', ''),
  rewardsAddress: getEnv('REWARDS_CONTRACT_ADDRESS', ''),
  
  // Protocol Parameters
  totalSupply: 10000,
  freeAllocation: 6000,
  paidAllocation: 4000,
  mintPriceBnb: '0.001',
  freeMintLimitPerWallet: 2,
  paidMintLimitPerWallet: 20,
  maxWalletAllowance: 22, // 2 free + 20 paid
  marketplaceFeePercent: 2.5,
  royaltyPercent: 5.0,
  forgeXpRequirement: 100,
  forgeBnbCost: '0.005', // Optional upgrade stabilizer cost in BNB
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
    inputs: [
      { name: 'quantity', type: 'uint256' },
      { name: 'merkleProof', type: 'bytes32[]' }
    ],
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
    name: 'merkleRoot',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
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
  }
] as const;

export const MARKETPLACE_ABI = [
  {
    type: 'function',
    name: 'createListing',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'priceInWei', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'buyToken',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'cancelListing',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'createOffer',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'acceptOffer',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'bidder', type: 'address' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  }
] as const;

export const FORGE_ABI = [
  {
    type: 'function',
    name: 'forgeCharacters',
    inputs: [
      { name: 'tokenA', type: 'uint256' },
      { name: 'tokenB', type: 'uint256' }
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
    name: 'claimReward',
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
    name: 'getPoolBalance',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const;
