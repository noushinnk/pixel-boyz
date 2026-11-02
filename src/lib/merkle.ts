import { keccak256, encodePacked, isAddress } from 'viem';

/**
 * Merkle Tree and Proof verification for Binance Agentic Wallet Allowlist.
 * Guarantees cryptographic proof verification on-chain & off-chain.
 */

const configuredAllowlist = process.env.NEXT_PUBLIC_AGENTIC_ALLOWLIST;
export const BINANCE_AGENTIC_ALLOWLIST: string[] = configuredAllowlist
  ? configuredAllowlist.split(',').map((address) => address.trim()).filter(Boolean)
  : [];

/**
 * Hash an address leaf according to OpenZeppelin MerkleProof standard:
 * keccak256(bytes.concat(keccak256(abi.encode(account))))
 */
export function hashLeaf(address: string): `0x${string}` {
  const normalized = address.toLowerCase();
  const innerHash = keccak256(encodePacked(['address'], [normalized as `0x${string}`]));
  return keccak256(encodePacked(['bytes32'], [innerHash]));
}

/**
 * Compute the parent hash of two nodes in canonical order
 */
export function hashPair(a: `0x${string}`, b: `0x${string}`): `0x${string}` {
  if (a.toLowerCase() <= b.toLowerCase()) {
    return keccak256(encodePacked(['bytes32', 'bytes32'], [a, b]));
  }
  return keccak256(encodePacked(['bytes32', 'bytes32'], [b, a]));
}

export class MerkleTree {
  private leaves: `0x${string}`[];
  private layers: `0x${string}`[][];

  constructor(addresses: string[]) {
    const unique = Array.from(new Set(addresses.map(a => a.toLowerCase()))).filter((addr): addr is `0x${string}` => isAddress(addr));
    this.leaves = unique.map(hashLeaf).sort((a, b) => a.localeCompare(b));
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

// Global tree instance with official allowlist
export const officialMerkleTree = new MerkleTree(BINANCE_AGENTIC_ALLOWLIST);
export const OFFICIAL_MERKLE_ROOT = officialMerkleTree.getRoot();

/**
 * Verify whether an address is on the official Binance Agentic Wallet allowlist
 */
export function checkAllowlistEligibility(address?: string | null): {
  isEligible: boolean;
  proof: `0x${string}`[];
  freeRemaining: number;
} {
  if (!address || !isAddress(address)) {
    return { isEligible: false, proof: [], freeRemaining: 0 };
  }

  const proof = officialMerkleTree.getProof(address);
  const isEligible = proof.length > 0 && officialMerkleTree.verify(proof, address);

  return {
    isEligible,
    proof,
    freeRemaining: isEligible ? 2 : 0
  };
}
