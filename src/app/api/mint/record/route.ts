import { NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { db } from '@/lib/server/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, quantity, freeQty, paidQty, priceBnb, txHash } = body;

    if (!walletAddress || !isAddress(walletAddress) || !txHash) {
      return NextResponse.json({ error: 'walletAddress and txHash are required' }, { status: 400 });
    }

    const record = db.recordMint({
      wallet_address: walletAddress,
      quantity: Number(quantity) || 1,
      free_qty: Number(freeQty) || 0,
      paid_qty: Number(paidQty) || 0,
      price_bnb: priceBnb || '0',
      tx_hash: txHash
    });

    db.addAuditLog('MINT_CONFIRMED', `Wallet ${walletAddress} minted ${quantity} (free=${freeQty}, paid=${paidQty}) tx: ${txHash}`);

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record mint' }, { status: 500 });
  }
}
