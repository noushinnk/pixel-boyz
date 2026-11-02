import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'The deployed NFT contract does not use an on-chain Merkle root.' },
    { status: 410 }
  );
}
