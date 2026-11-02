import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'This NFT contract checks Agent ID eligibility on-chain and does not use Merkle proofs.' },
    { status: 410 }
  );
}
