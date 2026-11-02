import { NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { verifyBinanceAgentIdOwnership } from '@/lib/server/agentIdService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Valid wallet address parameter required' }, { status: 400 });
    }

    const result = await verifyBinanceAgentIdOwnership(address);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Agent ID verification failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address } = body;

    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Valid wallet address required in body' }, { status: 400 });
    }

    const result = await verifyBinanceAgentIdOwnership(address);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Agent ID verification failed' }, { status: 500 });
  }
}
