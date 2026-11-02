import { db, CampaignSubmission } from './db';

export interface XVerificationResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  authorId?: string;
  authorUsername?: string;
  error?: string;
  submission?: CampaignSubmission;
}

// Extract Tweet/Post ID from any valid X/Twitter URL
export function extractPostIdFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Match patterns like:
  // https://x.com/username/status/1234567890123456789
  // https://twitter.com/username/status/1234567890123456789
  // https://mobile.twitter.com/i/web/status/1234567890123456789
  const match = trimmed.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(?:\w+)\/status(?:es)?\/(\d+)/i);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback: If raw numeric ID is submitted
  if (/^\d{8,25}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

// Extract author username from X/Twitter URL if available
export function extractUsernameFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(/(?:twitter\.com|x\.com)\/(?:#!\/)?([a-zA-Z0-9_]+)\/status(?:es)?\/(\d+)/i);
  return match && match[1] ? match[1] : null;
}

export async function verifyXCampaignPost(params: {
  postUrl: string;
  walletAddress?: string;
  expectedXUserId?: string;
}): Promise<XVerificationResult> {
  const { postUrl, walletAddress } = params;
  const normalizedWallet = walletAddress ? walletAddress.toLowerCase() : '';

  // 1. Validate post URL and extract ID
  const postId = extractPostIdFromUrl(postUrl);
  const authorUsername = extractUsernameFromUrl(postUrl) || 'x_user';

  if (!postId) {
    return {
      success: false,
      error: 'Invalid X post URL. Please submit a valid post link (e.g. https://x.com/your_handle/status/123456789).'
    };
  }

  // If wallet is not connected, submission is accepted to unlock prompt
  if (!normalizedWallet) {
    return {
      success: true,
      postId,
      postUrl: postUrl.trim(),
      authorId: authorUsername,
      authorUsername
    };
  }

  // 2. Check for duplicate wallet submission (1 completion per wallet)
  const existingWalletSubmission = db.getCampaignSubmissionByWallet(normalizedWallet);
  if (existingWalletSubmission && existingWalletSubmission.verified) {
    db.addToAllowlist(normalizedWallet);
    return {
      success: true,
      postId: existingWalletSubmission.post_id,
      postUrl: existingWalletSubmission.post_url,
      authorId: existingWalletSubmission.x_user_id,
      authorUsername: existingWalletSubmission.x_user_id,
      submission: existingWalletSubmission
    };
  }

  // 3. Check for duplicate post ID reuse across wallets (prevent reuse of same post by multiple wallets)
  const existingPostSubmission = db.getCampaignSubmissionByPostId(postId);
  if (existingPostSubmission && existingPostSubmission.verified) {
    if (existingPostSubmission.wallet_address.toLowerCase() !== normalizedWallet) {
      db.recordCampaignSubmission({
        wallet_address: normalizedWallet,
        post_id: postId,
        post_url: postUrl,
        verified: false,
        error_reason: 'This X post URL has already been claimed by another wallet.'
      });
      return {
        success: false,
        error: 'This X post URL has already been claimed by another wallet. Each campaign post may only be submitted once.'
      };
    }
  }

  // 4. Record verified submission directly without external Twitter API dependency
  const submission = db.recordCampaignSubmission({
    wallet_address: normalizedWallet,
    post_id: postId,
    post_url: postUrl,
    x_user_id: authorUsername,
    verified: true
  });

  // Automatically enroll wallet in Merkle allowlist
  db.addToAllowlist(normalizedWallet);
  db.addAuditLog(
    'CAMPAIGN_VERIFIED',
    `Wallet ${normalizedWallet} submitted X post link ${postId} (@${authorUsername}) and unlocked Merkle allowlist`
  );

  return {
    success: true,
    postId,
    postUrl,
    authorId: authorUsername,
    authorUsername,
    submission
  };
}
