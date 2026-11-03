import { NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { extractPostIdFromUrl } from '@/lib/server/xVerificationService';
import {
  RewardDatabaseConfigurationError,
  RewardEntryAlreadySubmittedError,
  saveCampaignRewardEntry
} from '@/lib/server/rewardEntries';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'A wallet address and X post URL are required.' }, { status: 400 });
  }

  const { walletAddress, postUrl } = body as Record<string, unknown>;
  if (typeof walletAddress !== 'string' || !isAddress(walletAddress)) {
    return NextResponse.json({ error: 'Please enter a valid BNB wallet address.' }, { status: 400 });
  }
  if (typeof postUrl !== 'string' || postUrl.length > 2048) {
    return NextResponse.json({ error: 'Please enter a valid X post URL.' }, { status: 400 });
  }

  let parsedPostUrl: URL;
  try {
    parsedPostUrl = new URL(postUrl);
  } catch {
    return NextResponse.json({ error: 'Please enter a valid X post URL.' }, { status: 400 });
  }

  const allowedHosts = new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com', 'mobile.twitter.com']);
  const postId = extractPostIdFromUrl(parsedPostUrl.toString());
  if (
    parsedPostUrl.protocol !== 'https:' ||
    !allowedHosts.has(parsedPostUrl.hostname.toLowerCase()) ||
    !postId
  ) {
    return NextResponse.json({ error: 'Please enter a public post URL from X or Twitter.' }, { status: 400 });
  }

  try {
    await saveCampaignRewardEntry({
      walletAddress: walletAddress.toLowerCase(),
      postId,
      postUrl: parsedPostUrl.toString()
    });
    return NextResponse.json({
      success: true,
      message: 'Your reward entry has been submitted.'
    });
  } catch (error: unknown) {
    if (error instanceof RewardEntryAlreadySubmittedError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof RewardDatabaseConfigurationError) {
      console.error('Reward submission database is not configured.');
      return NextResponse.json(
        { error: 'Reward submissions are temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    console.error('Failed to save campaign reward entry:', error);
    return NextResponse.json(
      { error: 'Could not save your reward entry. Please try again later.' },
      { status: 500 }
    );
  }
}
