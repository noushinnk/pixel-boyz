import { NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { MerkleTreeEngine } from '@/lib/server/merkleService';

export async function GET() {
  try {
    const allowlistWallets = db.getAllActiveAllowlist();
    const tree = new MerkleTreeEngine(allowlistWallets);
    const calculatedRoot = tree.getRoot();

    return NextResponse.json({
      calculatedRoot,
      walletCount: allowlistWallets.length,
      wallets: allowlistWallets,
      instruction: 'To update the on-chain Merkle root, execute setMerkleRoot(bytes32 newRoot) from a wallet holding the SALE_MANAGER_ROLE.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to compute Merkle root publication dataset' }, { status: 500 });
  }
}
