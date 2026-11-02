import { NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { issueMerkleProof } from '@/lib/server/merkleService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Valid wallet address parameter required' }, { status: 400 });
    }

    const result = await issueMerkleProof(address);

    if (!result.eligible) {
      return NextResponse.json({
        eligible: false,
        walletAddress: result.walletAddress,
        proof: [],
        checks: result.checks,
        error: result.reason || 'Not eligible for free mint'
      }, { status: 200 });
    }

    return NextResponse.json({
      eligible: true,
      walletAddress: result.walletAddress,
      proof: result.proof,
      root: result.root,
      installedRoot: result.installedRoot,
      checks: result.checks
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to issue Merkle proof' }, { status: 500 });
  }
}
