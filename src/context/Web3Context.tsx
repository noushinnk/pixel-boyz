"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { ARCHETYPES, TRAIT_OPTIONS, INITIAL_NFTS, INITIAL_QUESTS } from '../data/collectionData';

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

  is6kMinted: boolean;

  // Connection handlers
  connectWallet: (preferredWallet?: string | unknown) => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (targetChainId?: number) => Promise<void>;

  // Collection & State
  nfts: PixelBoyNFT[];
  userNfts: PixelBoyNFT[];
  quests: Quest[];
  activity: ActivityEvent[];
  userProfile: UserProfile;
  totalMinted: number;
  totalFreeMinted: number;
  totalPaidMinted: number;
  paidAllocation: number;
  freeAllocationRemaining: number;
  paidAllocationRemaining: number;
  remainingSupply: number;
  freeMintedCount: number;
  paidMintedCount: number;
  rewardsPoolBnb: string;
  userClaimableBnb: string;
  
  // Phase & Contract Settings
  freePhaseOpen: boolean;
  publicPhaseOpen: boolean;
  freePhaseClosed: boolean;
  currentMintPriceBnb: string;
  merkleRoot: string;
  isLiveContractActive: boolean;

  // Wallet Specific Quotas
  walletFreeMinted: number;
  walletPaidMinted: number;
  isAgentIdVerified: boolean;
  isAgentIdLoading: boolean;
  xCampaignCompleted: boolean;
  xCampaignLoading: boolean;

  // Actions
  refreshContractData: () => Promise<void>;
  verifyAgentIdOnChain: () => Promise<boolean>;
  verifyXCampaignPost: (postUrl: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  getAgenticPrompt: (quantity?: number) => string;
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

  // Live contract metrics
  const [totalMinted, setTotalMinted] = useState<number>(0);
  const [totalFreeMinted, setTotalFreeMinted] = useState<number>(0);
  const [totalPaidMinted, setTotalPaidMinted] = useState<number>(0);
  const [paidAllocation, setPaidAllocation] = useState<number>(4000);
  const [freeAllocationRemaining, setFreeAllocationRemaining] = useState<number>(6000);
  const [paidAllocationRemaining, setPaidAllocationRemaining] = useState<number>(4000);
  const [remainingSupply, setRemainingSupply] = useState<number>(10000);
  const [merkleRoot, setMerkleRoot] = useState<string>('0x0000000000000000000000000000000000000000000000000000000000000000');
  const [freePhaseOpen, setFreePhaseOpen] = useState<boolean>(true);
  const [publicPhaseOpen, setPublicPhaseOpen] = useState<boolean>(true);
  const [freePhaseClosed, setFreePhaseClosed] = useState<boolean>(false);
  const [currentMintPriceBnb, setCurrentMintPriceBnb] = useState<string>('0.001');

  // Wallet-specific quotas & verifications
  const [walletFreeMinted, setWalletFreeMinted] = useState<number>(0);
  const [walletPaidMinted, setWalletPaidMinted] = useState<number>(0);
  const [isAgentIdVerified, setIsAgentIdVerified] = useState<boolean>(false);
  const [isAgentIdLoading, setIsAgentIdLoading] = useState<boolean>(false);
  const [xCampaignCompleted, setXCampaignCompleted] = useState<boolean>(false);
  const [xCampaignLoading, setXCampaignLoading] = useState<boolean>(false);
  const [merkleProof, setMerkleProof] = useState<`0x${string}`[]>([]);

  // Collection State (Deterministic initial render matching SSR)
  const [nfts, setNfts] = useState<PixelBoyNFT[]>(isContractDeployed('nft') ? [] : INITIAL_NFTS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [rewardsPoolBnb, setRewardsPoolBnb] = useState<string>('');

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
  const allowlistEligibility = {
    isEligible: isAgentIdVerified && xCampaignCompleted,
    proof: merkleProof,
    freeRemaining: Math.max(0, 2 - walletFreeMinted)
  };
  const isBinanceAgenticWallet = isAgentIdVerified;

  // Real or simulated contract status
  const isLiveContractActive = isContractDeployed('nft');

  const freeMintedCount = totalFreeMinted;
  const paidMintedCount = totalPaidMinted;

  // Filter user's NFTs
  const userNfts = account ? nfts.filter(n => n.owner.toLowerCase() === account.toLowerCase()) : [];

  // Calculate user's claimable BNB based on their XP share
  const userClaimableBnb = '';
  const liveConfigurationError = 'This action is unavailable until deployed contracts and the indexer are configured.';

  // Live contract data refresher (Fast unified endpoint with in-memory caching)
  const refreshContractData = useCallback(async () => {
    try {
      const url = account ? `/api/contract/stats?address=${encodeURIComponent(account)}` : '/api/contract/stats';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTotalMinted(data.totalMinted ?? 0);
        setTotalFreeMinted(data.totalFreeMinted ?? 0);
        setTotalPaidMinted(data.totalPaidMinted ?? 0);
        setPaidAllocation(data.paidAllocation ?? 4000);
        setFreeAllocationRemaining(data.freeAllocationRemaining ?? 6000);
        setPaidAllocationRemaining(data.paidAllocationRemaining ?? 4000);
        setRemainingSupply(data.remainingSupply ?? 10000);
        setCurrentMintPriceBnb(data.mintPriceBnb || '0.001');
        setFreePhaseOpen(Boolean(data.freeSaleActive));
        setPublicPhaseOpen(Boolean(data.paidSaleActive));
        setFreePhaseClosed(Boolean(data.freePhaseClosed));
        setMerkleRoot(data.merkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000');

        if (data.wallet) {
          setIsAgentIdVerified(Boolean(data.wallet.isAgentIdVerified));
          setXCampaignCompleted(Boolean(data.wallet.xCampaignCompleted));
          if (data.wallet.merkleProof && Array.isArray(data.wallet.merkleProof)) {
            setMerkleProof(data.wallet.merkleProof);
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching contract stats:', err);
    }
  }, [account]);

  const refreshCollectionData = useCallback(async () => {
    try {
      const res = await fetch('/api/nfts');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.nfts)) setNfts(data.nfts);
      }
    } catch (err) {
      console.warn('Error fetching live collection:', err);
    }
  }, []);

  // Initial load and periodic background refresh every 20 seconds
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem('pb_x_campaign_completed') === 'true') {
          setXCampaignCompleted(true);
        }
      } catch {}
    }
    refreshContractData();
    const interval = setInterval(refreshContractData, 20000);
    return () => clearInterval(interval);
  }, [refreshContractData]);

  useEffect(() => {
    refreshCollectionData();
    const interval = setInterval(refreshCollectionData, 30000);
    return () => clearInterval(interval);
  }, [refreshCollectionData]);

  const verifyAgentIdOnChain = async (): Promise<boolean> => {
    if (!account) return false;
    setIsAgentIdLoading(true);
    try {
      const res = await fetch(`/api/agent-id/verify?address=${account}`);
      if (res.ok) {
        const data = await res.json();
        setIsAgentIdVerified(Boolean(data.isEligible));
        await refreshContractData();
        return Boolean(data.isEligible);
      }
      return false;
    } catch (e) {
      console.error('Agent ID verification error:', e);
      return false;
    } finally {
      setIsAgentIdLoading(false);
    }
  };

  const verifyXCampaignPost = async (postUrl: string) => {
    // Wallet connection is NOT required to submit post link and unlock Agentic Prompt!
    setXCampaignLoading(true);
    try {
      const res = await fetch('/api/campaign/verify-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postUrl, walletAddress: account || undefined })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setXCampaignCompleted(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pb_x_campaign_completed', 'true');
        }
        await refreshContractData();
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Verification failed' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    } finally {
      setXCampaignLoading(false);
    }
  };

  const getAgenticPrompt = (quantity: number = 2): string => {
    const qty = quantity || 2;
    const contract = CONTRACT_CONFIG.nftAddress || '';

    return `PIXEL BOYZ NFT — Free Mint Execution
Mint ${qty} PIXEL BOYZ NFTs using my currently authenticated wallet.
Network & Contract
Network: BNB Smart Chain Mainnet
Chain ID: 56
Contract: ${contract}
Official Portal: [https://www.pixelboyz.shop/mint](https://www.pixelboyz.shop/mint)
Mint Function: mint(uint256 quantity, bytes32[] proof)
Quantity: ${qty}
Expected Price: 0 BNB
Mandatory Checks
Verify my authenticated wallet holds a valid Agent ID.
Retrieve free allocation data directly from the official mint portal.
Confirm at least ${qty} free allocations are available and unclaimed.
Verify wallet, contract and network.
Execution Rules
Use only my authenticated wallet.
Do not request Merkle proof or X campaign verification.
Never fabricate eligibility or bypass contract restrictions.
Stop if Agent ID or sufficient free allocation is missing.
Do not proceed with unexpected mint fees.
Confirmation & Execution
Before minting, display wallet address, Agent ID status, free allocation data, mint price and estimated gas fee.
Ask for my explicit confirmation before submitting the transaction.
After authorization, mint ${qty} NFTs and verify transaction success and NFT ownership on BscScan.`;
  };

  const getProvider = () => {
    const w = typeof window !== 'undefined' ? (window as any) : {};
    let eth = w.ethereum;
    if (eth?.providers?.length) {
      eth = eth.providers.find((p: any) => p.isMetaMask || p.isBinance) || eth.providers[0];
    }
    if (!eth) {
      eth = w.binance || w.okxwallet || w.trustwallet || w.phantom?.ethereum;
    }
    if (!eth) throw new Error('No compatible Web3 wallet provider detected. Please install MetaMask, Binance Web3 Wallet, or Trust Wallet.');
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
    if (typeof window === 'undefined') return;
    const w = window as any;
    let eth = w.ethereum;
    if (eth?.providers?.length) {
      eth = eth.providers.find((p: any) => p.isMetaMask || p.isBinance) || eth.providers[0];
    }
    if (!eth) {
      eth = w.binance || w.okxwallet || w.trustwallet;
    }

    if (!eth || typeof eth.on !== 'function') return;

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

    try {
      eth.on('accountsChanged', handleAccountsChanged);
      eth.on('chainChanged', handleChainChanged);
    } catch {}

    return () => {
      try {
        if (typeof eth?.removeListener === 'function') {
          eth.removeListener('accountsChanged', handleAccountsChanged);
          eth.removeListener('chainChanged', handleChainChanged);
        }
      } catch {}
    };
  }, []);

  // Connect Injected Browser Wallet (ONLY Binance Agentic Wallet allowed until 6,000 free NFTs are minted)
  const connectWallet = async (preferredWallet?: string | unknown) => {
    setIsConnecting(true);
    try {
      const is6kMinted = totalFreeMinted >= 6000 || freeAllocationRemaining <= 0 || freePhaseClosed;
      const walletKey = typeof preferredWallet === 'string' ? preferredWallet : undefined;

      // Protocol Rule: user will not be allowed to connect any wallet (except binance agentic wallet) until the 6k nft is minted
      if (!is6kMinted && walletKey && walletKey !== 'binance') {
        alert('🚫 ACCESS RESTRICTED: During the 6,000 Free Mint phase, ONLY Binance Agentic Wallet is permitted to connect.\n\nAll other wallets (MetaMask, OKX, Trust Wallet, Coinbase) will be unlocked for public mint once all 6,000 free NFTs have been minted!');
        return;
      }

      const w = typeof window !== 'undefined' ? (window as any) : {};
      let eth = w.ethereum;

      if (!is6kMinted) {
        // Enforce Binance Web3 / Agentic Wallet
        const binanceProvider = w.binance || (eth?.providers ? eth.providers.find((p: any) => p.isBinance) : (eth?.isBinance ? eth : null));
        if (!binanceProvider && !w.binance) {
          alert('🚫 ONLY BINANCE AGENTIC WALLET PERMITTED:\n\nDuring the 6,000 Free Mint phase, only Binance Agentic Wallet is authorized to connect. Other wallets will unlock for public mint once all 6,000 free NFTs are minted.\n\nPlease connect with Binance Web3 / Agentic Wallet or copy the Agentic Wallet Mint Prompt to execute via your AI agent.');
          return;
        }
        eth = binanceProvider || eth;
      } else {
        if (eth?.providers?.length) {
          if (walletKey === 'metamask') {
            eth = eth.providers.find((p: any) => p.isMetaMask && !p.isBinance) || eth.providers[0];
          } else if (walletKey === 'okx') {
            eth = w.okxwallet || eth.providers.find((p: any) => p.isOkxWallet) || eth.providers[0];
          } else if (walletKey === 'trust') {
            eth = w.trustwallet || eth.providers.find((p: any) => p.isTrust) || eth.providers[0];
          } else {
            eth = eth.providers.find((p: any) => p.isMetaMask || p.isBinance) || eth.providers[0];
          }
        }
        if (!eth) {
          eth = w.binance || w.okxwallet || w.trustwallet || w.phantom?.ethereum;
        }
      }

      if (!eth || typeof eth.request !== 'function') {
        alert('No Web3 wallet extension detected in this browser.\n\nPlease install Binance Web3 Wallet to connect to BNB Smart Chain, or copy the Agentic Wallet Mint Prompt to execute via your AI agent.');
        return;
      }

      const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[];
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setUserProfile(prev => ({ ...prev, address: accounts[0] }));

        try {
          const balanceHex = await eth.request({ method: 'eth_getBalance', params: [accounts[0], 'latest'] }) as string;
          if (balanceHex) {
            setBalanceBnb((Number.parseInt(balanceHex, 16) / 1e18).toFixed(4));
          }
        } catch (e) {
          console.warn('Balance query warning:', e);
        }

        try {
          const currentChainHex = (await eth.request({ method: 'eth_chainId' })) as string;
          const currentChainId = parseInt(currentChainHex, 16);
          setChainId(currentChainId);

          if (currentChainId !== BSC_MAINNET_CHAIN_ID) {
            await switchNetwork(BSC_MAINNET_CHAIN_ID);
          }
        } catch (e) {
          console.warn('Chain ID query warning:', e);
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

  // Real On-Chain Mint Execution
  const mintPixelBoyz = async (quantity: number) => {
    if (!isContractDeployed('nft')) return { success: false, error: liveConfigurationError };
    if (!account) return { success: false, error: 'Connect wallet to mint.' };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > CONTRACT_CONFIG.maxWalletAllowance) {
      return { success: false, error: `Invalid mint quantity (1 - ${CONTRACT_CONFIG.maxWalletAllowance}).` };
    }

    try {
      // 1. Retrieve latest verified Merkle proof for this wallet from backend
      let currentProof: `0x${string}`[] = merkleProof;
      let isAllowlistedFree = false;
      try {
        const proofRes = await fetch(`/api/merkle/proof?address=${account}`);
        if (proofRes.ok) {
          const pData = await proofRes.json();
          if (pData.eligible && Array.isArray(pData.proof)) {
            currentProof = pData.proof;
            isAllowlistedFree = true;
          }
        }
      } catch (e) {
        console.warn('Could not refresh proof before mint:', e);
      }

      // 2. Fetch live contract price, wallet free count, and allocation remaining
      const nftAddress = CONTRACT_CONFIG.nftAddress as `0x${string}`;
      const publicClient = createPublicClient({ chain: bsc, transport: http(CONTRACT_CONFIG.rpcUrl) }) as any;
      const [priceWei, fMinted, tFree, fActive, fClosed] = await Promise.all([
        publicClient.readContract({
          address: nftAddress,
          abi: PIXEL_BOYZ_NFT_ABI as any,
          functionName: 'mintPrice'
        }),
        publicClient.readContract({
          address: nftAddress,
          abi: PIXEL_BOYZ_NFT_ABI as any,
          functionName: 'freeMintedByWallet',
          args: [account as `0x${string}`]
        }),
        publicClient.readContract({
          address: nftAddress,
          abi: PIXEL_BOYZ_NFT_ABI as any,
          functionName: 'totalFreeMinted'
        }),
        publicClient.readContract({
          address: nftAddress,
          abi: PIXEL_BOYZ_NFT_ABI as any,
          functionName: 'freeSaleActive'
        }),
        publicClient.readContract({
          address: nftAddress,
          abi: PIXEL_BOYZ_NFT_ABI as any,
          functionName: 'freePhaseClosed'
        })
      ]);

      const walletFreeRemaining = isAllowlistedFree && Boolean(fActive) && !Boolean(fClosed)
        ? Math.max(0, 2 - Number(fMinted))
        : 0;
      const allocationRemaining = Math.max(0, 6000 - Number(tFree));
      const freeEligibleQty = Math.min(walletFreeRemaining, allocationRemaining);

      const freeQty = Math.min(quantity, freeEligibleQty);
      const paidQty = quantity - freeQty;
      const requiredPayment = (priceWei as bigint) * BigInt(paidQty);

      // 3. Dispatch transaction to deployed contract on BNB Smart Chain Mainnet
      const txHash = await sendContractTransaction(
        nftAddress,
        PIXEL_BOYZ_NFT_ABI,
        'mint',
        [BigInt(quantity), currentProof],
        requiredPayment
      );

      // 4. Record mint event on backend
      try {
        await fetch('/api/mint/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: account,
            quantity,
            freeQty,
            paidQty,
            priceBnb: formatEther(requiredPayment),
            txHash
          })
        });
      } catch (err) {
        console.warn('Backend mint recording non-blocking warning:', err);
      }

      // 5. Refresh contract and wallet data
      await refreshContractData();

      // Update quests and XP
      triggerQuestProgress('q2', 1);
      triggerQuestProgress('q3', quantity);
      setUserProfile(prev => ({
        ...prev,
        xp: prev.xp + 100 * quantity
      }));

      return {
        success: true,
        txHash
      };
    } catch (error: any) {
      console.error('Mint transaction error:', error);
      return {
        success: false,
        error: error?.shortMessage || error?.message || 'Transaction failed or rejected by wallet.'
      };
    }
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

  const is6kMinted = totalFreeMinted >= 6000 || freeAllocationRemaining <= 0 || freePhaseClosed;

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
        is6kMinted,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        nfts,
        userNfts,
        quests,
        activity,
        userProfile,
        totalMinted,
        totalFreeMinted,
        totalPaidMinted,
        paidAllocation,
        freeAllocationRemaining,
        paidAllocationRemaining,
        remainingSupply,
        freeMintedCount,
        paidMintedCount,
        rewardsPoolBnb,
        userClaimableBnb,
        freePhaseOpen,
        publicPhaseOpen,
        freePhaseClosed,
        currentMintPriceBnb,
        merkleRoot,
        isLiveContractActive,
        walletFreeMinted,
        walletPaidMinted,
        isAgentIdVerified,
        isAgentIdLoading,
        xCampaignCompleted,
        xCampaignLoading,
        refreshContractData,
        verifyAgentIdOnChain,
        verifyXCampaignPost,
        getAgenticPrompt,
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
