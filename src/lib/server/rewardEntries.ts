import 'server-only';
import { Collection, MongoClient, MongoServerError } from 'mongodb';

interface CampaignRewardEntry {
  walletAddress: string;
  xPostId: string;
  xPostUrl: string;
  createdAt: Date;
}

export class RewardEntryAlreadySubmittedError extends Error {}

export class RewardDatabaseConfigurationError extends Error {}

const mongoConnections = globalThis as typeof globalThis & {
  campaignRewardMongoClientPromise?: Promise<MongoClient>;
  campaignRewardCollectionPromise?: Promise<Collection<CampaignRewardEntry>>;
};

async function getRewardEntriesCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new RewardDatabaseConfigurationError('MongoDB connection is not configured.');
  }

  const clientPromise = mongoConnections.campaignRewardMongoClientPromise ??= new MongoClient(uri).connect();
  const collectionPromise = mongoConnections.campaignRewardCollectionPromise ??= clientPromise.then(
    async (client) => {
      const database = client.db(process.env.MONGODB_DATABASE || process.env.MONGODB_DB);
      const collection = database.collection<CampaignRewardEntry>('campaign_reward_entries');
      await collection.createIndexes([
        { key: { walletAddress: 1 }, unique: true },
        { key: { xPostId: 1 }, unique: true }
      ]);
      return collection;
    }
  );
  try {
    return await collectionPromise;
  } catch (error: unknown) {
    if (mongoConnections.campaignRewardMongoClientPromise === clientPromise) {
      mongoConnections.campaignRewardMongoClientPromise = undefined;
    }
    if (mongoConnections.campaignRewardCollectionPromise === collectionPromise) {
      mongoConnections.campaignRewardCollectionPromise = undefined;
    }
    throw error;
  }
}

export async function saveCampaignRewardEntry(input: {
  walletAddress: string;
  postId: string;
  postUrl: string;
}): Promise<void> {
  try {
    const collection = await getRewardEntriesCollection();
    await collection.insertOne({
      walletAddress: input.walletAddress,
      xPostId: input.postId,
      xPostUrl: input.postUrl,
      createdAt: new Date()
    });
  } catch (error: unknown) {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new RewardEntryAlreadySubmittedError('This wallet or X post has already been submitted.');
    }
    throw error;
  }
}
