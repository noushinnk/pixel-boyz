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
  
  // Contract Addresses (environment values override the recorded deployment)
  nftAddress: getEnv('NFT_CONTRACT_ADDRESS', '0xdD9941fFADE1eBb7b3E46Fe979143945203EFA97'),
  marketplaceAddress: getEnv('MARKETPLACE_CONTRACT_ADDRESS', '0xF849a3Eb62f76597eDec523Cb29dd436B1bd5ca1'),
  forgeAddress: getEnv('FORGE_CONTRACT_ADDRESS', '0x53142E20019453f5901A7b5481E223ABD27bC5B6'),
  rewardsAddress: getEnv('REWARDS_CONTRACT_ADDRESS', '0xb163117921464bcBb9D8ed209CE7B1234bD50B4b'),
  elementMarketplaceUrl: 'https://element.market/collections/pixel-boyz',
  
  // Protocol Parameters
  totalSupply: 10000,
  freeAllocation: 6000,
  paidAllocation: 4000,
  mintPriceBnb: '',
  freeMintLimitPerWallet: 2,
  paidMintLimitPerWallet: 20,
  maxWalletAllowance: 22, // 2 free + 20 paid
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
    name: 'paidAllocationRemaining',
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
    name: 'walletMintStatus',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [
      { name: 'freeMinted', type: 'uint256' },
      { name: 'freeRemaining', type: 'uint256' },
      { name: 'paidMinted', type: 'uint256' },
      { name: 'paidRemaining', type: 'uint256' },
      { name: 'totalWalletRemaining', type: 'uint256' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'setMerkleRoot',
    inputs: [{ name: 'newRoot', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'nonpayable'
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
