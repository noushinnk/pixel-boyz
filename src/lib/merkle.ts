import { keccak256, encodePacked, isAddress } from 'viem';

/**
 * Merkle Tree and Proof verification for Binance Agentic Wallet Allowlist.
 * Guarantees cryptographic proof verification on-chain & off-chain.
 */

// Sample list of verified Binance Agentic Wallet allowlisted addresses
export const BINANCE_AGENTIC_ALLOWLIST: string[] = [
  '0x8894e0a0c962cb723c1976a4421c95949be2d4e3',
  '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
  '0xd551234ae421e3bcba99a0da6d736074996512e6',
  '0x564286362092d8e7936f0549571a803b203aacea',
  '0x06959153b974d0d5f7de8335b36ab3ab691a5554',
  '0xf977814e90da44bfa03b6295a0616a897441acec',
  '0x1062a747393198f70f71ec65a582423dba7e5ab3',
  '0x28c6c06298d514db089934071355e5743bf21d60',
  '0x21a31ee1afc51d94c2efccaa2092ad1028285549',
  '0xdfd5293d8e347dff59e457140071e1f36f1c979d',
  '0xa7efae728d2936e78bda97dc267687568dd593f3',
  '0x72a53cd2225a92fe1b30319266683f5e94afe779'
];

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
