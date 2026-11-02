import { NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { db } from '@/lib/server/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address } = body;

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Valid wallet address is required' }, { status: 400 });
    }

    const nonce = db.createNonce(address);
    db.getOrCreateUser(address);

    return NextResponse.json({
      address: address.toLowerCase(),
      nonce,
      message: `Sign this message to authenticate your wallet with PIXEL BOYZ.\n\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
