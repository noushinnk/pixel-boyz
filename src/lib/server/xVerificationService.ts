export interface XVerificationResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  authorId?: string;
  authorUsername?: string;
  error?: string;
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
  const { postUrl } = params;

  const postId = extractPostIdFromUrl(postUrl);
  const authorUsername = extractUsernameFromUrl(postUrl) || 'x_user';

  if (!postId) {
    return {
      success: false,
      error: 'Invalid X post URL. Please submit a valid post link (e.g. https://x.com/your_handle/status/123456789).'
    };
  }

  return {
    success: true,
    postId,
    postUrl,
    authorId: authorUsername,
    authorUsername
  };
}
