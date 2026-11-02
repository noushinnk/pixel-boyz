import { NextResponse } from 'next/server';
import { isAddress, verifyMessage } from 'viem';
import { db } from '@/lib/server/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, signature, message, nonce } = body;

    if (!address || !isAddress(address) || !signature) {
      return NextResponse.json({ error: 'Address and signature are required' }, { status: 400 });
    }

    const normalized = address.toLowerCase();

    // Verify nonce
    if (nonce) {
      const isValidNonce = db.verifyNonce(normalized, nonce);
      if (!isValidNonce) {
        return NextResponse.json({ error: 'Invalid or expired nonce challenge' }, { status: 401 });
      }
    }

    // Verify cryptographic signature
    const valid = await verifyMessage({
      address: normalized as `0x${string}`,
      message: message || `Sign this message to authenticate your wallet with PIXEL BOYZ.\n\nNonce: ${nonce}`,
      signature: signature as `0x${string}`
    });

    if (!valid) {
      return NextResponse.json({ error: 'Cryptographic signature verification failed' }, { status: 401 });
    }

    // Generate authenticated session token
    const token = db.createSessionToken(normalized);
    db.addAuditLog('WALLET_AUTHENTICATED', `Wallet ${normalized} successfully authenticated via signature`);

    return NextResponse.json({
      success: true,
      address: normalized,
      token,
      expiresIn: 86400
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Signature verification failed' }, { status: 500 });
  }
}
