import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface RewardAddressDatabase {
  prepare(query: string): RewardAddressStatement;
}

interface RewardAddressStatement {
  bind(walletAddress: string): RewardAddressStatement;
  run(): Promise<{ meta?: { changes?: number } }>;
}

export class RewardEntryAlreadySubmittedError extends Error {}

export class RewardDatabaseConfigurationError extends Error {}

async function getRewardAddressDatabase() {
  const { env } = await getCloudflareContext({ async: true });
  const database = (env as unknown as Record<string, RewardAddressDatabase | undefined>)['PIXEL-BOYZ'];
  if (!database) {
    throw new RewardDatabaseConfigurationError('The PIXEL-BOYZ D1 binding is not configured.');
  }
  return database;
}

export async function saveCampaignRewardEntry(input: {
  walletAddress: string;
}): Promise<void> {
  const database = await getRewardAddressDatabase();
  await database
    .prepare(`
      CREATE TABLE IF NOT EXISTS reward_wallet_addresses (
        wallet_address TEXT PRIMARY KEY,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    .run();

  const result = await database
    .prepare('INSERT OR IGNORE INTO reward_wallet_addresses (wallet_address) VALUES (?)')
    .bind(input.walletAddress.toLowerCase())
    .run();

  if (result.meta?.changes === 0) {
    throw new RewardEntryAlreadySubmittedError('This wallet has already been submitted.');
  }
}
