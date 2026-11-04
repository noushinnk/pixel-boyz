import { NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { verifyXCampaignPost } from '@/lib/server/xVerificationService';
import { db } from '@/lib/server/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postUrl, walletAddress, sessionToken } = body;

    if (!postUrl || typeof postUrl !== 'string') {
      return NextResponse.json({ error: 'Post URL is required' }, { status: 400 });
    }

    let normalizedWallet: string | undefined = undefined;
    if (walletAddress && typeof walletAddress === 'string') {
      if (!isAddress(walletAddress)) {
        return NextResponse.json({ error: 'Provided wallet address is invalid' }, { status: 400 });
      }
      normalizedWallet = walletAddress.toLowerCase();
    }

    // Check optional session token if provided
    if (sessionToken && normalizedWallet) {
      const boundWallet = db.validateSessionToken(sessionToken);
      if (boundWallet && boundWallet.toLowerCase() !== normalizedWallet) {
        return NextResponse.json({ error: 'Session token does not match provided wallet' }, { status: 403 });
      }
    }

    const result = await verifyXCampaignPost({
      postUrl,
      walletAddress: normalizedWallet
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'X campaign post verification failed'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      postId: result.postId,
      postUrl: result.postUrl,
      authorId: result.authorId,
      authorUsername: result.authorUsername,
      message: 'X campaign post verified successfully! Free mint eligibility unlocked.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Campaign verification failed' }, { status: 500 });
  }
}
