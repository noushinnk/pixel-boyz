import 'server-only';
import { createClient } from '@supabase/supabase-js';

export class RewardEntryAlreadySubmittedError extends Error {}

export class RewardDatabaseConfigurationError extends Error {}

export async function saveCampaignRewardEntry(input: {
  walletAddress: string;
  postId: string;
  postUrl: string;
}): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new RewardDatabaseConfigurationError('Supabase server credentials are not configured.');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  const { error } = await supabase.from('campaign_reward_entries').insert({
    wallet_address: input.walletAddress,
    x_post_id: input.postId,
    x_post_url: input.postUrl
  });

  if (error?.code === '23505') {
    throw new RewardEntryAlreadySubmittedError('This wallet or X post has already been submitted.');
  }
  if (error) {
    throw new Error(`Supabase could not save the reward entry (${error.code || 'unknown error'}).`);
  }
}
