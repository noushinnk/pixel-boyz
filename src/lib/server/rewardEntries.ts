import 'server-only';
import { db } from './db';

interface RewardAddressDatabase {
  prepare(query: string): RewardAddressStatement;
}

interface RewardAddressStatement {
  bind(...args: any[]): RewardAddressStatement;
  run(): Promise<{ meta?: { changes?: number } }>;
}

export class RewardEntryAlreadySubmittedError extends Error {}

export class RewardDatabaseConfigurationError extends Error {}

async function getCloudflareD1Database(): Promise<RewardAddressDatabase | null> {
  const candidateKeys = [
    'PIXEL-BOYZ',
    'PIXEL_BOYZ',
    'pixel_boyz',
    'pixel-boyz',
    'PIXELBOYZ',
    'DB',
    'DATABASE',
    'd1',
    'D1'
  ];

  // 1. Check globalThis (Cloudflare Workers / Pages runtime bindings)
  const globalObj = globalThis as Record<string, any>;
  for (const key of candidateKeys) {
    if (globalObj[key] && typeof globalObj[key].prepare === 'function') {
      return globalObj[key] as RewardAddressDatabase;
    }
  }

  // 2. Check OpenNext Cloudflare Context
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const context = await getCloudflareContext({ async: true });
    if (context && context.env) {
      const env = context.env as unknown as Record<string, any>;
      for (const key of candidateKeys) {
        if (env[key] && typeof env[key].prepare === 'function') {
          return env[key] as RewardAddressDatabase;
        }
      }
      for (const key of Object.keys(env)) {
        const val = env[key];
        if (val && typeof val === 'object' && typeof val.prepare === 'function') {
          return val as RewardAddressDatabase;
        }
      }
    }
  } catch {
    // Cloudflare context is not available in non-Cloudflare environments
  }

  return null;
}

async function saveToMongo(input: {
  walletAddress: string;
  postId?: string;
  postUrl?: string;
}): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;

  try {
    const { MongoClient, MongoServerError } = await import('mongodb');
    const client = await new MongoClient(uri).connect();
    const database = client.db(process.env.MONGODB_DATABASE || process.env.MONGODB_DB || 'pixelboyz');
    const collection = database.collection('campaign_reward_entries');
    await collection.createIndex({ walletAddress: 1 }, { unique: true });

    try {
      await collection.insertOne({
        walletAddress: input.walletAddress.toLowerCase(),
        xPostId: input.postId,
        xPostUrl: input.postUrl,
        createdAt: new Date()
      });
      return true;
    } catch (e: any) {
      if (e instanceof MongoServerError && e.code === 11000) {
        throw new RewardEntryAlreadySubmittedError('This wallet has already been submitted.');
      }
      throw e;
    }
  } catch (error) {
    if (error instanceof RewardEntryAlreadySubmittedError) throw error;
    console.error('MongoDB save error:', error);
    return false;
  }
}

async function saveToSupabase(input: {
  walletAddress: string;
  postId?: string;
  postUrl?: string;
}): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return false;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { error } = await supabase.from('campaign_reward_entries').insert({
      wallet_address: input.walletAddress.toLowerCase(),
      x_post_id: input.postId,
      x_post_url: input.postUrl
    });

    if (error?.code === '23505') {
      throw new RewardEntryAlreadySubmittedError('This wallet has already been submitted.');
    }
    if (error) {
      console.error('Supabase error:', error);
      return false;
    }
    return true;
  } catch (error) {
    if (error instanceof RewardEntryAlreadySubmittedError) throw error;
    console.error('Supabase save error:', error);
    return false;
  }
}

export async function saveCampaignRewardEntry(input: {
  walletAddress: string;
  postId?: string;
  postUrl?: string;
}): Promise<void> {
  const normalizedWallet = input.walletAddress.toLowerCase();

  // 1. Try Cloudflare D1
  try {
    const d1 = await getCloudflareD1Database();
    if (d1) {
      await d1
        .prepare(`
          CREATE TABLE IF NOT EXISTS reward_wallet_addresses (
            wallet_address TEXT PRIMARY KEY,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `)
        .run();

      const result = await d1
        .prepare('INSERT OR IGNORE INTO reward_wallet_addresses (wallet_address) VALUES (?)')
        .bind(normalizedWallet)
        .run();

      if (result.meta?.changes === 0) {
        throw new RewardEntryAlreadySubmittedError('This wallet has already been submitted.');
      }
      return;
    }
  } catch (err) {
    if (err instanceof RewardEntryAlreadySubmittedError) throw err;
    console.warn('Cloudflare D1 operation failed or unavailable, falling back:', err);
  }

  // 2. Try MongoDB if configured
  if (process.env.MONGODB_URI) {
    const saved = await saveToMongo({
      walletAddress: normalizedWallet,
      postId: input.postId,
      postUrl: input.postUrl
    });
    if (saved) return;
  }

  // 3. Try Supabase if configured
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const saved = await saveToSupabase({
      walletAddress: normalizedWallet,
      postId: input.postId,
      postUrl: input.postUrl
    });
    if (saved) return;
  }

  // 4. Fallback to resilient server store
  const existing = db.getRewardEntryByWallet(normalizedWallet);
  if (existing) {
    throw new RewardEntryAlreadySubmittedError('This wallet has already been submitted.');
  }

  db.recordRewardEntry({
    wallet_address: normalizedWallet,
    post_id: input.postId,
    post_url: input.postUrl
  });
}
