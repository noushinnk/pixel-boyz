"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PixelBoyNFT,
  Quest,
  ActivityEvent,
  UserProfile,
  Archetype,
  RarityTier
} from '../types/nft';
import {
  CONTRACT_CONFIG,
  BSC_MAINNET_CHAIN_ID,
  isContractDeployed,
  PIXEL_BOYZ_NFT_ABI,
  MARKETPLACE_ABI,
  FORGE_ABI
} from '../contracts/config';
import { createPublicClient, createWalletClient, custom, http, parseEther, formatEther } from 'viem';
import { bsc } from 'viem/chains';
import { checkAllowlistEligibility, officialMerkleTree } from '../lib/merkle';
import { ARCHETYPES, TRAIT_OPTIONS } from '../data/collectionData';

interface Web3ContextType {
  // Wallet State
  account: string | null;
  chainId: number | null;
  balanceBnb: string;
  isConnected: boolean;
  isConnecting: boolean;
  isBinanceAgenticWallet: boolean;
  allowlistEligibility: {
    isEligible: boolean;
    proof: `0x${string}`[];
    freeRemaining: number;
  };

  // Connection handlers
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (targetChainId?: number) => Promise<void>;

  // Collection & State
  nfts: PixelBoyNFT[];
  userNfts: PixelBoyNFT[];
  quests: Quest[];
  activity: ActivityEvent[];
  userProfile: UserProfile;
  totalMinted: number;
  freeMintedCount: number;
  paidMintedCount: number;
  rewardsPoolBnb: string;
  userClaimableBnb: string;
  
  // Phase & Contract Settings
  freePhaseOpen: boolean;
  publicPhaseOpen: boolean;
  currentMintPriceBnb: string;
  isLiveContractActive: boolean;

  // Actions
  mintPixelBoyz: (quantity: number) => Promise<{ success: boolean; txHash?: string; error?: string; mintedNfts?: PixelBoyNFT[] }>;
  listNftForSale: (tokenId: number, priceBnb: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  cancelNftListing: (tokenId: number) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  buyNftFromMarketplace: (tokenId: number) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  makeOfferOnNft: (tokenId: number, amountBnb: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  acceptNftOffer: (tokenId: number) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  forgeNfts: (tokenAId: number, tokenBId: number) => Promise<{ success: boolean; txHash?: string; evolvedNft?: PixelBoyNFT; error?: string }>;
  claimQuest: (questId: string) => void;
  claimRewardsPool: (epoch: number) => Promise<{ success: boolean; txHash?: string; amountBnb?: string; error?: string }>;
  updateUsername: (name: string) => void;
  updateAvatar: (tokenId: number) => void;

  // Admin controls
  adminUpdatePhases: (freeOpen: boolean, publicOpen: boolean) => void;
  adminSetPrice: (priceBnb: string) => void;
  adminRolloverFreeSupply: () => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(BSC_MAINNET_CHAIN_ID);
  const [balanceBnb, setBalanceBnb] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Mint phase & state
  const [freePhaseOpen, setFreePhaseOpen] = useState<boolean>(false);
  const [publicPhaseOpen, setPublicPhaseOpen] = useState<boolean>(false);
  const [currentMintPriceBnb, setCurrentMintPriceBnb] = useState<string>('');

  // Collection State (Deterministic initial render matching SSR)
  const [nfts, setNfts] = useState<PixelBoyNFT[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [rewardsPoolBnb, setRewardsPoolBnb] = useState<string>('');
  const [claimedFreeMintsByWallet, setClaimedFreeMintsByWallet] = useState<Record<string, number>>({});
  const [paidMintsByWallet, setPaidMintsByWallet] = useState<Record<string, number>>({});

  // Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    address: '',
    username: '',
    avatarTokenId: 0,
    xp: 0,
    bio: '',
    joinedAt: 0,
    claimedEpochs: [],
    completedQuests: []
  });


  // Check allowlist status of current account
  const allowlistEligibility = checkAllowlistEligibility(account);
  const isBinanceAgenticWallet = allowlistEligibility.isEligible;

  // Real or simulated contract status
  const isLiveContractActive = isContractDeployed('nft');

  // Total calculations (100% Real, zero demo additions)
  const [totalMinted, setTotalMinted] = useState(0);
  const freeMintedCount = nfts.filter(n => n.history.some(h => h.type === 'mint' && (!h.price || h.price === '0' || h.price === '0.000'))).length;
  const paidMintedCount = nfts.filter(n => n.history.some(h => h.type === 'mint' && Number(h.price) > 0)).length;

  // Filter user's NFTs
  const userNfts = account ? nfts.filter(n => n.owner.toLowerCase() === account.toLowerCase()) : [];

  // Calculate user's claimable BNB based on their XP share
  const userClaimableBnb = '';
  const liveConfigurationError = 'This action is unavailable until deployed contracts and the indexer are configured.';

  useEffect(() => {
    const publicClient = createPublicClient({ chain: bsc, transport: http(CONTRACT_CONFIG.rpcUrl) }) as any;
    void Promise.all([
      publicClient.readContract({
        address: CONTRACT_CONFIG.nftAddress as `0x${string}`,
        abi: PIXEL_BOYZ_NFT_ABI as any,
        functionName: 'mintPrice'
      }),
      publicClient.readContract({
        address: CONTRACT_CONFIG.nftAddress as `0x${string}`,
        abi: PIXEL_BOYZ_NFT_ABI as any,
        functionName: 'totalMinted'
      }),
      publicClient.readContract({
        address: CONTRACT_CONFIG.nftAddress as `0x${string}`,
        abi: PIXEL_BOYZ_NFT_ABI as any,
        functionName: 'freeSaleActive'
      }),
      publicClient.readContract({
        address: CONTRACT_CONFIG.nftAddress as `0x${string}`,
        abi: PIXEL_BOYZ_NFT_ABI as any,
        functionName: 'paidSaleActive'
      })
    ]).then(([price, minted, freeActive, paidActive]) => {
      setCurrentMintPriceBnb(formatEther(price as bigint));
      setTotalMinted(Number(minted));
      setFreePhaseOpen(Boolean(freeActive));
      setPublicPhaseOpen(Boolean(paidActive));
    }).catch(() => {
      setCurrentMintPriceBnb('');
    });
  }, []);

  const getProvider = () => {
    const eth = (window as unknown as { ethereum?: unknown }).ethereum;
    if (!eth) throw new Error('No compatible wallet provider detected.');
    return eth;
  };

  const sendContractTransaction = async (
    address: `0x${string}`,
    abi: readonly unknown[],
    functionName: string,
    args: readonly unknown[] = [],
    value?: bigint
  ): Promise<`0x${string}`> => {
    if (!account) throw new Error('Connect your wallet first.');
    const provider = getProvider();
    const client = createWalletClient({
      account: account as `0x${string}`,
      chain: bsc,
      transport: custom(provider as never)
    });
    const hash = await client.writeContract({
      address,
      abi,
      functionName,
      args,
      ...(value === undefined ? {} : { value })
    } as never);
    const publicClient = createPublicClient({ chain: bsc, transport: http(CONTRACT_CONFIG.rpcUrl) }) as any;
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  };

  // Injected wallet event listener
  useEffect(() => {
    const eth = (window as unknown as { ethereum?: {
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    } }).ethereum;

    if (!eth) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accList = accounts as string[];
      if (accList && accList.length > 0) {
        setAccount(accList[0]);
        setUserProfile(prev => ({ ...prev, address: accList[0] }));
      } else {
        setAccount(null);
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      setChainId(parseInt(chainIdHex as string, 16));
    };

    eth.on('accountsChanged', handleAccountsChanged);
    eth.on('chainChanged', handleChainChanged);

    return () => {
      eth.removeListener('accountsChanged', handleAccountsChanged);
      eth.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // Connect Injected Browser Wallet (MetaMask, Binance Web3 Wallet, Trust Wallet)
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const eth = (window as unknown as { ethereum?: {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      } }).ethereum;

      if (!eth) {
        throw new Error('No compatible wallet provider detected.');
      }

      const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[];
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setUserProfile(prev => ({ ...prev, address: accounts[0] }));
        const balanceHex = await eth.request({ method: 'eth_getBalance', params: [accounts[0], 'latest'] }) as string;
        setBalanceBnb((Number.parseInt(balanceHex, 16) / 1e18).toFixed(4));

        // Check chainId
        const currentChainHex = (await eth.request({ method: 'eth_chainId' })) as string;
        const currentChainId = parseInt(currentChainHex, 16);
        setChainId(currentChainId);

        if (currentChainId !== BSC_MAINNET_CHAIN_ID) {
          await switchNetwork(BSC_MAINNET_CHAIN_ID);
        }

      }
    } catch (err) {
      console.warn('Wallet connection request rejected or failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  const switchNetwork = async (targetChainId: number = BSC_MAINNET_CHAIN_ID) => {
    const eth = (window as unknown as { ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    } }).ethereum;

    if (!eth) throw new Error('No compatible wallet provider detected.');

    const hexChain = `0x${targetChainId.toString(16)}`;
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChain }]
      });
      setChainId(targetChainId);
    } catch (switchError: unknown) {
      // 4902 code indicates chain has not been added to wallet
      const err = switchError as { code?: number };
      if (err?.code === 4902) {
        try {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: hexChain,
                chainName: 'BNB Smart Chain',
                nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com']
              }
            ]
          });
          setChainId(targetChainId);
        } catch (addError) {
          console.error('Failed to add BNB Chain to wallet', addError);
        }
      }
    }
  };

  const triggerQuestProgress = (questId: string, increment: number = 1) => {
    setQuests(prev =>
      prev.map(q => {
        if (q.id === questId) {
          const newProgress = Math.min(q.maxProgress, q.progress + increment);
          return {
            ...q,
            progress: newProgress,
            isCompleted: newProgress >= q.maxProgress
          };
        }
        return q;
      })
    );
  };

  // Mint Execution
  const mintPixelBoyz = async (quantity: number) => {
    if (!isContractDeployed('nft')) return { success: false, error: liveConfigurationError };
    if (!account) return { success: false, error: 'Connect wallet to mint.' };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > CONTRACT_CONFIG.maxWalletAllowance) {
      return { success: false, error: 'Invalid mint quantity.' };
    }

    try {
      const publicClient = createPublicClient({ chain: bsc, transport: http(CONTRACT_CONFIG.rpcUrl) }) as any;
      const [price, freeMinted] = await Promise.all([
        publicClient.readContract({
          address: CONTRACT_CONFIG.nftAddress as `0x${string}`,
          abi: PIXEL_BOYZ_NFT_ABI as any,
          functionName: 'mintPrice'
        }),
        publicClient.readContract({
          address: CONTRACT_CONFIG.nftAddress as `0x${string}`,
          abi: PIXEL_BOYZ_NFT_ABI as any,
          functionName: 'freeMintedByWallet',
          args: [account as `0x${string}`]
        })
      ]);
      const { proof } = checkAllowlistEligibility(account);
      const freeRemaining = allowlistEligibility.isEligible
        ? Math.max(0, CONTRACT_CONFIG.freeMintLimitPerWallet - Number(freeMinted))
        : 0;
      const paidQuantity = Math.max(0, quantity - (freePhaseOpen ? Math.min(quantity, freeRemaining) : 0));
      const value = (price as bigint) * BigInt(paidQuantity);
      const txHash = await sendContractTransaction(
        CONTRACT_CONFIG.nftAddress as `0x${string}`,
        PIXEL_BOYZ_NFT_ABI,
        'mint',
        [BigInt(quantity), proof],
        value
      );
      return { success: true, txHash };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Mint transaction failed.' };
    }
    /*
      NFT metadata and activity must be read from the indexer after confirmation.
    */
    /* Live mint contract integration is required before this action is enabled. */
    if (!isContractDeployed('nft')) return { success: false, error: liveConfigurationError };
    if (!account) {
      return { success: false, error: 'Wallet not connected. Please connect your BNB Chain wallet first.' };
    }

    if (quantity < 1 || quantity > CONTRACT_CONFIG.maxWalletAllowance) {
      return { success: false, error: `Quantity must be between 1 and ${CONTRACT_CONFIG.maxWalletAllowance}.` };
    }

    const normAccount = account.toLowerCase();
    const alreadyFree = claimedFreeMintsByWallet[normAccount] || 0;
    const alreadyPaid = paidMintsByWallet[normAccount] || 0;

    // Check allowlist eligibility
    const { isEligible, proof } = checkAllowlistEligibility(account);
    const availableFree = isEligible ? Math.max(0, CONTRACT_CONFIG.freeMintLimitPerWallet - alreadyFree) : 0;
    const freeToClaim = Math.min(quantity, availableFree);
    const paidToClaim = quantity - freeToClaim;

    if (alreadyPaid + paidToClaim > CONTRACT_CONFIG.paidMintLimitPerWallet) {
      return {
        success: false,
        error: `Exceeds paid mint limit of ${CONTRACT_CONFIG.paidMintLimitPerWallet} per wallet. Already minted: ${alreadyPaid}.`
      };
    }

    // Exact BNB calculation: paidToClaim * mintPriceBnb
    const totalCostBnb = (paidToClaim * parseFloat(currentMintPriceBnb)).toFixed(4);

    // If real contract is deployed, call contract mint via window.ethereum
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const REAL_IMAGE_ASSETS = [
      '/assets/aistudio/pixil-frame-0__5__45747249.png',
      '/assets/aistudio/17_01ef732d.png',
      '/assets/aistudio/18_6d72f8ce.png',
      '/assets/aistudio/26_95acd707.png',
      '/assets/aistudio/35_3bc87fd1.png',
      '/assets/aistudio/56_1643a0f0.png',
      '/assets/aistudio/57_66af4ba5.png',
      '/assets/aistudio/1005_8f11a7d5.png'
    ];

    // Create generated Pixel Boyz NFTs
    const newNfts: PixelBoyNFT[] = [];
    const archetypesList: Archetype[] = ['Cyborg', 'Neon Ronin', 'Quantum Hacker', 'Shadow Operative', 'Astro Pilot', 'Glitch Nomad'];
    
    for (let i = 0; i < quantity; i++) {
      const nextId = 200 + nfts.length + i + 1;
      const arc = archetypesList[Math.floor(Math.random() * archetypesList.length)];
      const isFreeThisOne = i < freeToClaim;
      const rarities: RarityTier[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
      const rIndex = Math.random() < 0.05 ? 4 : Math.random() < 0.15 ? 3 : Math.random() < 0.35 ? 2 : Math.random() < 0.65 ? 1 : 0;
      const assignedImage = REAL_IMAGE_ASSETS[(nfts.length + i) % REAL_IMAGE_ASSETS.length];

      const newBoy: PixelBoyNFT = {
        id: nextId,
        tokenId: `PB-${String(nextId).padStart(4, '0')}`,
        name: `Pixel Boy #${String(nextId).padStart(4, '0')}`,
        image: assignedImage,
        level: 1,
        rarity: rarities[rIndex],
        rarityScore: Math.floor(40 + Math.random() * 55),
        owner: account,
        creator: account,
        mintedAt: Date.now(),
        mintTxHash: txHash,
        traits: {
          archetype: arc,
          headgear: TRAIT_OPTIONS.headgears[Math.floor(Math.random() * TRAIT_OPTIONS.headgears.length)],
          visor: TRAIT_OPTIONS.visors[Math.floor(Math.random() * TRAIT_OPTIONS.visors.length)],
          armor: TRAIT_OPTIONS.armors[Math.floor(Math.random() * TRAIT_OPTIONS.armors.length)],
          weapon: TRAIT_OPTIONS.weapons[Math.floor(Math.random() * TRAIT_OPTIONS.weapons.length)],
          core: TRAIT_OPTIONS.cores[Math.floor(Math.random() * TRAIT_OPTIONS.cores.length)],
          background: TRAIT_OPTIONS.backgrounds[Math.floor(Math.random() * TRAIT_OPTIONS.backgrounds.length)],
          skinTone: '#cbd5e1'
        },
        isListed: false,
        price: null,
        seller: null,
        highestOffer: null,
        history: [
          {
            id: `h-mint-${nextId}`,
            type: 'mint',
            from: '0x0000000000000000000000000000000000000000',
            to: account,
            price: isFreeThisOne ? '0.000' : currentMintPriceBnb,
            timestamp: Date.now(),
            txHash
          }
        ],
        xp: 100
      };

      newNfts.push(newBoy);
    }

    // Update state
    setNfts(prev => [...prev, ...newNfts]);
    setClaimedFreeMintsByWallet(prev => ({
      ...prev,
      [normAccount]: alreadyFree + freeToClaim
    }));
    setPaidMintsByWallet(prev => ({
      ...prev,
      [normAccount]: alreadyPaid + paidToClaim
    }));

    // Record activity
    const activityEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: freeToClaim > 0 ? 'mint_free' : 'mint_paid',
      wallet: account,
      tokenId: newNfts[0]?.id,
      amount: totalCostBnb,
      timestamp: Date.now(),
      txHash,
      status: 'confirmed'
    };
    setActivity(prev => [activityEvent, ...prev]);

    // Update user profile XP and Quests
    setUserProfile(prev => ({
      ...prev,
      xp: prev.xp + 100 * quantity
    }));
    triggerQuestProgress('q2', 1);
    triggerQuestProgress('q3', quantity);

    return {
      success: true,
      txHash,
      mintedNfts: newNfts
    };
  };

  // List NFT
  const listNftForSale = async (tokenId: number, priceBnb: string) => {
    if (!isContractDeployed('marketplace')) return { success: false, error: liveConfigurationError };
    if (!account) return { success: false, error: 'Connect wallet to list.' };
    try {
      const price = parseEther(priceBnb);
      await sendContractTransaction(
        CONTRACT_CONFIG.nftAddress as `0x${string}`,
        PIXEL_BOYZ_NFT_ABI,
        'approve',
        [CONTRACT_CONFIG.marketplaceAddress as `0x${string}`, BigInt(tokenId)]
      );
      const txHash = await sendContractTransaction(
        CONTRACT_CONFIG.marketplaceAddress as `0x${string}`,
        MARKETPLACE_ABI,
        'list',
        [CONTRACT_CONFIG.nftAddress as `0x${string}`, BigInt(tokenId), price]
      );
      return { success: true, txHash };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Listing transaction failed.' };
    }
    if (!isContractDeployed('marketplace')) return { success: false, error: liveConfigurationError };
    if (!account) return { success: false, error: 'Connect wallet to list.' };
    const numPrice = parseFloat(priceBnb);
    if (isNaN(numPrice) || numPrice <= 0) return { success: false, error: 'Enter a valid BNB price.' };

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    setNfts(prev =>
      prev.map(n => {
        if (n.id === tokenId) {
          return {
            ...n,
            isListed: true,
            price: priceBnb,
            seller: account,
            history: [
              {
                id: `h-list-${Date.now()}`,
                type: 'list',
                from: account,
                to: '',
                price: priceBnb,
                timestamp: Date.now(),
                txHash
              },
              ...n.history
            ]
          };
        }
        return n;
      })
    );

    setActivity(prev => [
      {
        id: `act-list-${Date.now()}`,
        type: 'listing',
        wallet: account,
        tokenId,
        amount: priceBnb,
        timestamp: Date.now(),
        txHash,
        status: 'confirmed'
      },
      ...prev
    ]);

    triggerQuestProgress('q4', 1);
    return { success: true, txHash };
  };

  // Cancel Listing
  const cancelNftListing = async (tokenId: number) => {
    return { success: false, error: 'Cancel requires the on-chain listing ID from the marketplace indexer.' };
    if (!isContractDeployed('marketplace')) return { success: false, error: liveConfigurationError };
    if (!account) return { success: false, error: 'Connect wallet.' };
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    setNfts(prev =>
      prev.map(n => {
        if (n.id === tokenId) {
          return {
            ...n,
            isListed: false,
            price: null,
            seller: null
          };
        }
        return n;
      })
    );

    return { success: true, txHash };
  };

  // Buy NFT
  const buyNftFromMarketplace = async (tokenId: number) => {
    return { success: false, error: 'Purchase requires the on-chain listing ID from the marketplace indexer.' };
    if (!isContractDeployed('marketplace')) return { success: false, error: liveConfigurationError };
    if (!account) return { success: false, error: 'Connect wallet to purchase.' };
    const target = nfts.find(n => n.id === tokenId);
    if (!target || !target.isListed || !target.price) {
      return { success: false, error: 'This NFT is not currently listed for sale.' };
    }

    if (target.owner.toLowerCase() === account.toLowerCase()) {
      return { success: false, error: 'You already own this NFT.' };
    }

    const price = target.price;
    const fee = (parseFloat(price) * (CONTRACT_CONFIG.marketplaceFeePercent / 100)).toFixed(4);
    const sellerProceeds = (parseFloat(price) * (1 - CONTRACT_CONFIG.marketplaceFeePercent / 100)).toFixed(4);

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Update NFT
    setNfts(prev =>
      prev.map(n => {
        if (n.id === tokenId) {
          return {
            ...n,
            owner: account,
            isListed: false,
            price: null,
            seller: null,
            highestOffer: null,
            history: [
              {
                id: `h-sale-${Date.now()}`,
                type: 'sale',
                from: n.owner,
                to: account,
                price,
                timestamp: Date.now(),
                txHash
              },
              ...n.history
            ]
          };
        }
        return n;
      })
    );

    // Increase rewards pool by the 2.5% protocol fee
    setRewardsPoolBnb(prev => (parseFloat(prev) + parseFloat(fee)).toFixed(4));

    // Record activity
    setActivity(prev => [
      {
        id: `act-sale-${Date.now()}`,
        type: 'sale',
        wallet: account,
        tokenId,
        amount: price,
        timestamp: Date.now(),
        txHash,
        status: 'confirmed'
      },
      ...prev
    ]);

    triggerQuestProgress('q6', 1);
    return { success: true, txHash };
  };

  // Make Offer
  const makeOfferOnNft = async (tokenId: number, amountBnb: string) => {
    if (!isContractDeployed('marketplace')) return { success: false, error: liveConfigurationError };
    if (!account) return { success: false, error: 'Connect wallet to make an offer.' };
    try {
      const expiry = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);
      const txHash = await sendContractTransaction(
        CONTRACT_CONFIG.marketplaceAddress as `0x${string}`,
        MARKETPLACE_ABI,
        'makeOffer',
        [CONTRACT_CONFIG.nftAddress as `0x${string}`, BigInt(tokenId), expiry],
        parseEther(amountBnb)
      );
      return { success: true, txHash };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Offer transaction failed.' };
    }
    if (!isContractDeployed('marketplace')) return { success: false, error: liveConfigurationError };
    if (!account) return { success: false, error: 'Connect wallet to make an offer.' };
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    setNfts(prev =>
      prev.map(n => {
        if (n.id === tokenId) {
          return {
            ...n,
            highestOffer: {
              bidder: account,
              amount: amountBnb,
              timestamp: Date.now()
            }
          };
        }
        return n;
      })
    );

    setActivity(prev => [
      {
        id: `act-offer-${Date.now()}`,
        type: 'offer',
        wallet: account,
        tokenId,
        amount: amountBnb,
        timestamp: Date.now(),
        txHash,
        status: 'confirmed'
      },
      ...prev
    ]);

    return { success: true, txHash };
  };

  // Accept Offer
  const acceptNftOffer = async (tokenId: number) => {
    return { success: false, error: 'Accept requires the on-chain offer ID from the marketplace indexer.' };
    if (!account) return { success: false, error: 'Connect wallet.' };
    const target = nfts.find(n => n.id === tokenId);
    if (!target || !target.highestOffer) {
      return { success: false, error: 'No active offers to accept.' };
    }

    const { bidder, amount } = target.highestOffer;
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    setNfts(prev =>
      prev.map(n => {
        if (n.id === tokenId) {
          return {
            ...n,
            owner: bidder,
            isListed: false,
            price: null,
            seller: null,
            highestOffer: null,
            history: [
              {
                id: `h-accept-${Date.now()}`,
                type: 'sale',
                from: account,
                to: bidder,
                price: amount,
                timestamp: Date.now(),
                txHash
              },
              ...n.history
            ]
          };
        }
        return n;
      })
    );

    return { success: true, txHash };
  };

  // Forge 2 NFTs: Combine Token A + Token B (Token B burned permanently, Token A upgrades Level and traits)
  const forgeNfts = async (tokenAId: number, tokenBId: number) => {
    if (!isContractDeployed('forge')) return { success: false, error: liveConfigurationError };
    if (!account) return { success: false, error: 'Connect wallet to forge.' };
    try {
      if (!CONTRACT_CONFIG.forgeBnbCost) {
        return { success: false, error: 'Forge recipe fee is not configured.' };
      }
      const txHash = await sendContractTransaction(
        CONTRACT_CONFIG.forgeAddress as `0x${string}`,
        FORGE_ABI,
        'forge',
        [BigInt(tokenAId), [BigInt(tokenBId)]],
        parseEther(CONTRACT_CONFIG.forgeBnbCost)
      );
      return { success: true, txHash };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Forge transaction failed.' };
    }
    if (!isContractDeployed('forge')) return { success: false, error: liveConfigurationError };
    if (!account) return { success: false, error: 'Connect wallet to enter Forge.' };
    if (tokenAId === tokenBId) return { success: false, error: 'Cannot forge an NFT with itself.' };

    const tokenA = nfts.find(n => n.id === tokenAId);
    const tokenB = nfts.find(n => n.id === tokenBId);

    if (!tokenA || !tokenB) return { success: false, error: 'Selected characters not found.' };
    if (tokenA.owner.toLowerCase() !== account.toLowerCase() || tokenB.owner.toLowerCase() !== account.toLowerCase()) {
      return { success: false, error: 'You must own both Pixel Boyz to forge them.' };
    }

    if (userProfile.xp < CONTRACT_CONFIG.forgeXpRequirement) {
      return { success: false, error: `Insufficient XP. Need at least ${CONTRACT_CONFIG.forgeXpRequirement} XP to forge.` };
    }

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const nextLevel = Math.min(5, tokenA.level + 1);

    // Evolve token A with enhanced traits
    const evolvedNft: PixelBoyNFT = {
      ...tokenA,
      level: nextLevel,
      name: `${tokenA.name.split(' (')[0]} (Evolved Mark-${nextLevel})`,
      rarity: nextLevel >= 4 ? 'Mythic' : nextLevel >= 3 ? 'Legendary' : 'Epic',
      rarityScore: tokenA.rarityScore + 15,
      xp: tokenA.xp + 250,
      traits: {
        ...tokenA.traits,
        headgear: 'Chrome Crown',
        core: 'Overclocked Arc Core',
        visor: 'Neon Crimson Dual Visor'
      },
      history: [
        {
          id: `h-forge-${Date.now()}`,
          type: 'forge',
          from: account,
          to: account,
          timestamp: Date.now(),
          txHash
        },
        ...tokenA.history
      ]
    };

    // Remove burned tokenB permanently (burned NFTs never restore supply or allowances)
    setNfts(prev => prev.filter(n => n.id !== tokenBId).map(n => n.id === tokenAId ? evolvedNft : n));

    // Deduct XP
    setUserProfile(prev => ({
      ...prev,
      xp: Math.max(0, prev.xp - CONTRACT_CONFIG.forgeXpRequirement)
    }));

    // Record Forge Activity
    setActivity(prev => [
      {
        id: `act-forge-${Date.now()}`,
        type: 'forge',
        wallet: account,
        tokenId: tokenAId,
        amount: `${CONTRACT_CONFIG.forgeXpRequirement} XP`,
        timestamp: Date.now(),
        txHash,
        status: 'confirmed'
      },
      ...prev
    ]);

    triggerQuestProgress('q5', 1);
    return { success: true, txHash, evolvedNft };
  };

  // Claim Quest Reward
  const claimQuest = (questId: string) => {
    void questId;
  };

  // Claim Rewards Pool
  const claimRewardsPool = async (epoch: number) => {
    void epoch;
    return { success: false, error: 'Rewards are currently read-only. Claims are coming soon.' };
    if (!isContractDeployed('rewards')) return { success: false, error: liveConfigurationError };
    if (!account) return { success: false, error: 'Connect wallet.' };
    const amount = userClaimableBnb;
    if (parseFloat(amount) <= 0) return { success: false, error: 'No claimable BNB in current epoch.' };

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    setUserProfile(prev => ({
      ...prev,
      claimedEpochs: [...prev.claimedEpochs, epoch]
    }));

    setActivity(prev => [
      {
        id: `act-claim-${Date.now()}`,
        type: 'reward_claim',
        wallet: account,
        amount: `${amount} BNB`,
        timestamp: Date.now(),
        txHash,
        status: 'confirmed'
      },
      ...prev
    ]);

    return { success: true, txHash, amountBnb: amount };
  };

  const updateUsername = (name: string) => {
    setUserProfile(prev => ({ ...prev, username: name }));
  };

  const updateAvatar = (tokenId: number) => {
    setUserProfile(prev => ({ ...prev, avatarTokenId: tokenId }));
  };

  // Admin Controls
  const adminUpdatePhases = (freeOpen: boolean, publicOpen: boolean) => {
    setFreePhaseOpen(freeOpen);
    setPublicPhaseOpen(publicOpen);
  };

  const adminSetPrice = (priceBnb: string) => {
    setCurrentMintPriceBnb(priceBnb);
  };

  const adminRolloverFreeSupply = () => {
    setFreePhaseOpen(false);
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        balanceBnb,
        isConnected: Boolean(account),
        isConnecting,
        isBinanceAgenticWallet,
        allowlistEligibility,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        nfts,
        userNfts,
        quests,
        activity,
        userProfile,
        totalMinted,
        freeMintedCount,
        paidMintedCount,
        rewardsPoolBnb,
        userClaimableBnb,
        freePhaseOpen,
        publicPhaseOpen,
        currentMintPriceBnb,
        isLiveContractActive,
        mintPixelBoyz,
        listNftForSale,
        cancelNftListing,
        buyNftFromMarketplace,
        makeOfferOnNft,
        acceptNftOffer,
        forgeNfts,
        claimQuest,
        claimRewardsPool,
        updateUsername,
        updateAvatar,
        adminUpdatePhases,
        adminSetPrice,
        adminRolloverFreeSupply
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within a Web3Provider');
  return ctx;
};
