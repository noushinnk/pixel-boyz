import { keccak256, encodeAbiParameters, encodePacked, isAddress } from 'viem';
import { db } from './db';
import { bscPublicClient } from './agentIdService';
import { CONTRACT_CONFIG, PIXEL_BOYZ_NFT_ABI } from '@/contracts/config';

/**
 * OpenZeppelin MerkleProof Leaf Format:
 * keccak256(bytes.concat(keccak256(abi.encode(account))))
 */
export function hashLeaf(address: string): `0x${string}` {
  const normalized = address.toLowerCase();
  const innerHash = keccak256(
    encodeAbiParameters([{ type: 'address' }], [normalized as `0x${string}`])
  );
  return keccak256(encodePacked(['bytes32'], [innerHash]));
}

/**
 * OpenZeppelin canonical sorted pairs:
 * computedHash <= proofElement ? keccak256(a, b) : keccak256(b, a)
 */
export function hashPair(a: `0x${string}`, b: `0x${string}`): `0x${string}` {
  if (BigInt(a) <= BigInt(b)) {
    return keccak256(encodePacked(['bytes32', 'bytes32'], [a, b]));
  }
  return keccak256(encodePacked(['bytes32', 'bytes32'], [b, a]));
}

export class MerkleTreeEngine {
  private leaves: `0x${string}`[] = [];
  private layers: `0x${string}`[][] = [];
  private addressToLeaf: Map<string, `0x${string}`> = new Map();

  constructor(addresses: string[]) {
    const unique = Array.from(
      new Set(addresses.map(a => a.toLowerCase()))
    ).filter((addr): addr is `0x${string}` => isAddress(addr));

    unique.sort((a, b) => a.localeCompare(b));

    this.leaves = unique.map(addr => {
      const leaf = hashLeaf(addr);
      this.addressToLeaf.set(addr.toLowerCase(), leaf);
      return leaf;
    });

    this.buildTree();
  }

  private buildTree() {
    if (this.leaves.length === 0) {
      this.layers = [[]];
      return;
    }

    this.layers = [this.leaves];
    let currentLayer = this.leaves;

    while (currentLayer.length > 1) {
      const nextLayer: `0x${string}`[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(hashPair(currentLayer[i], currentLayer[i + 1]));
        } else {
          nextLayer.push(currentLayer[i]);
        }
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  public getRoot(): `0x${string}` {
    if (this.layers.length === 0 || this.layers[0].length === 0) {
      return '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
    return this.layers[this.layers.length - 1][0];
  }

  public getProof(address: string): `0x${string}`[] {
    const leaf = hashLeaf(address);
    let index = this.leaves.indexOf(leaf);
    if (index === -1) return [];

    const proof: `0x${string}`[] = [];
    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRightNode = index % 2 === 1;
      const siblingIndex = isRightNode ? index - 1 : index + 1;

      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
      }
      index = Math.floor(index / 2);
    }
    return proof;
  }

  public verify(proof: `0x${string}`[], address: string): boolean {
    let hash = hashLeaf(address);
    for (const sibling of proof) {
      hash = hashPair(hash, sibling);
    }
    return hash === this.getRoot();
  }
}

export interface MerkleProofIssuanceResult {
  eligible: boolean;
  walletAddress: string;
  proof: `0x${string}`[];
  root: `0x${string}`;
  installedRoot?: `0x${string}`;
  checks: {
    validAddress: boolean;
    agentIdVerified: boolean;
    xCampaignVerified: boolean;
    hasRemainingWalletQuota: boolean;
    freeAllocationAvailable: boolean;
    freePhaseOpen: boolean;
  };
  reason?: string;
}

export async function issueMerkleProof(walletAddress: string): Promise<MerkleProofIssuanceResult> {
  const defaultFail = (reason: string, checks: any) => ({
    eligible: false,
    walletAddress: walletAddress || '',
    proof: [] as `0x${string}`[],
    root: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
    checks,
    reason
  });

  if (!walletAddress || !isAddress(walletAddress)) {
    return defaultFail('Invalid wallet address format.', {
      validAddress: false,
      agentIdVerified: false,
      xCampaignVerified: false,
      hasRemainingWalletQuota: false,
      freeAllocationAvailable: false,
      freePhaseOpen: false
    });
  }

  const normalized = walletAddress.toLowerCase();

  // Check 1: Agent ID Verification
  const agentVerification = db.getAgentIdVerification(normalized);
  const agentIdVerified = Boolean(agentVerification?.verified);

  // Check 2: X Campaign Verification
  const campaignSubmission = db.getCampaignSubmissionByWallet(normalized);
  const xCampaignVerified = Boolean(campaignSubmission?.verified);

  // Fast Path Exit: If Agent ID or X campaign is missing, exit immediately (0ms delay)
  if (!agentIdVerified) {
    return defaultFail('Wallet does not hold a verified Binance Agent ID.', {
      validAddress: true,
      agentIdVerified: false,
      xCampaignVerified,
      hasRemainingWalletQuota: true,
      freeAllocationAvailable: true,
      freePhaseOpen: true
    });
  }

  if (!xCampaignVerified) {
    return defaultFail('FREE MINT BLOCKED: Mandatory X campaign task has not been completed. Free mint is strictly blocked—even when using an autonomous AI agent or automated script—until an original post tagging @pixelboyzai and linking to https://www.pixelboyz.shop/mint is published and verified.', {
      validAddress: true,
      agentIdVerified: true,
      xCampaignVerified: false,
      hasRemainingWalletQuota: true,
      freeAllocationAvailable: true,
      freePhaseOpen: true
    });
  }

  // Read live contract state only for fully qualified wallets
  let freeMintedByWallet = 0n;
  let totalFreeMinted = 0n;
  let freeSaleActive = true;
  let freePhaseClosed = false;
  let onChainMerkleRoot: `0x${string}` = '0x0000000000000000000000000000000000000000000000000000000000000000';

  try {
    const nftAddr = CONTRACT_CONFIG.nftAddress as `0x${string}`;
    if (nftAddr && nftAddr.startsWith('0x')) {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('RPC Timeout')), 3000));
      const queryPromise = Promise.all([
        (bscPublicClient.readContract as any)({
          address: nftAddr,
          abi: PIXEL_BOYZ_NFT_ABI,
          functionName: 'freeMintedByWallet',
          args: [normalized as `0x${string}`]
        }),
        (bscPublicClient.readContract as any)({
          address: nftAddr,
          abi: PIXEL_BOYZ_NFT_ABI,
          functionName: 'totalFreeMinted'
        }),
        (bscPublicClient.readContract as any)({
          address: nftAddr,
          abi: PIXEL_BOYZ_NFT_ABI,
          functionName: 'freeSaleActive'
        }),
        (bscPublicClient.readContract as any)({
          address: nftAddr,
          abi: PIXEL_BOYZ_NFT_ABI,
          functionName: 'freePhaseClosed'
        }),
        (bscPublicClient.readContract as any)({
          address: nftAddr,
          abi: PIXEL_BOYZ_NFT_ABI,
          functionName: 'merkleRoot'
        })
      ]);

      const [wMinted, tFree, fActive, fClosed, root] = (await Promise.race([queryPromise, timeoutPromise])) as any;

      freeMintedByWallet = BigInt(wMinted);
      totalFreeMinted = BigInt(tFree);
      freeSaleActive = Boolean(fActive);
      freePhaseClosed = Boolean(fClosed);
      onChainMerkleRoot = root as `0x${string}`;
    }
  } catch (err) {
    console.warn('Could not read contract live values for Merkle issuance, using fallback checks:', err);
  }

  const hasRemainingWalletQuota = freeMintedByWallet < 2n;
  const freeAllocationAvailable = totalFreeMinted < 6000n;
  const freePhaseOpen = freeSaleActive && !freePhaseClosed;

  const checks = {
    validAddress: true,
    agentIdVerified,
    xCampaignVerified,
    hasRemainingWalletQuota,
    freeAllocationAvailable,
    freePhaseOpen
  };

  if (!hasRemainingWalletQuota) {
    return defaultFail('Wallet has already claimed its maximum 2 free NFTs.', checks);
  }

  if (!freeAllocationAvailable) {
    return defaultFail('Free mint allocation (6,000 NFTs) is completely exhausted.', checks);
  }

  if (!freePhaseOpen) {
    return defaultFail('Free mint phase is currently closed or inactive.', checks);
  }

  // All 5 requirements passed! Build tree of all qualified allowlist wallets
  db.addToAllowlist(normalized);
  const allowlistWallets = db.getAllActiveAllowlist();

  // If allowlistWallets is empty, ensure current wallet is in it
  if (!allowlistWallets.includes(normalized)) {
    allowlistWallets.push(normalized);
  }

  const tree = new MerkleTreeEngine(allowlistWallets);
  const root = tree.getRoot();
  const proof = tree.getProof(normalized);

  return {
    eligible: true,
    walletAddress: normalized,
    proof,
    root,
    installedRoot: onChainMerkleRoot,
    checks
  };
}
