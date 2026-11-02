import { createPublicClient, http, fallback, isAddress } from 'viem';
import { bsc } from 'viem/chains';
import { db } from './db';

const primaryRpc = process.env.BSC_RPC_URL || process.env.NEXT_PUBLIC_BSC_RPC_URL || process.env.VITE_BSC_RPC_URL;

const BSC_RPC_URLS = [
  primaryRpc,
  'https://bsc-dataseed.binance.org/',
  'https://bsc-dataseed1.defibit.io/',
  'https://bsc-dataseed1.ninicoin.io/',
  'https://rpc.ankr.com/bsc'
].filter(Boolean) as string[];

export const bscPublicClient = createPublicClient({
  chain: bsc,
  transport: fallback(
    BSC_RPC_URLS.map(url => http(url, { timeout: 3500 }))
  )
});

// SPACE ID Agent ID (.ai) ERC-721 Registry Contract on BNB Smart Chain
export const BINANCE_AGENT_ID_REGISTRY_ADDRESS = (
  process.env.BINANCE_AGENT_ID_REGISTRY_ADDRESS ||
  '0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F'
) as `0x${string}`;

const AGENT_ID_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }]
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }]
  }
] as const;

export interface AgentIdCheckResult {
  isEligible: boolean;
  walletAddress: string;
  balance: number;
  registryAddress: string;
  checkedAt: number;
  message?: string;
}

export async function verifyBinanceAgentIdOwnership(walletAddress: string): Promise<AgentIdCheckResult> {
  if (!walletAddress || !isAddress(walletAddress)) {
    return {
      isEligible: false,
      walletAddress: walletAddress || '',
      balance: 0,
      registryAddress: BINANCE_AGENT_ID_REGISTRY_ADDRESS,
      checkedAt: Date.now(),
      message: 'Invalid wallet address provided.'
    };
  }

  const normalized = walletAddress.toLowerCase();

  // Fast path: Check database cache first (instant response)
  const existing = db.getAgentIdVerification(normalized);
  const now = Date.now();
  if (existing && (existing.verified || now - existing.checked_at < 5 * 60 * 1000)) {
    return {
      isEligible: existing.verified,
      walletAddress: normalized,
      balance: existing.verified ? 1 : 0,
      registryAddress: BINANCE_AGENT_ID_REGISTRY_ADDRESS,
      checkedAt: existing.checked_at,
      message: existing.verified
        ? 'Verified Binance Agent ID holder on BNB Smart Chain.'
        : 'Wallet does not hold a claimed Binance Agent ID in registry.'
    };
  }

  try {
    const rawBalance = await (bscPublicClient.readContract as any)({
      address: BINANCE_AGENT_ID_REGISTRY_ADDRESS,
      abi: AGENT_ID_ABI,
      functionName: 'balanceOf',
      args: [normalized as `0x${string}`]
    });

    const balance = Number(rawBalance);
    const isEligible = balance > 0;

    // Cache verification in database
    db.setAgentIdVerification(normalized, isEligible, isEligible ? `${normalized.slice(0, 6)}.ai` : undefined);
    db.addAuditLog(
      'AGENT_ID_VERIFIED',
      `Wallet ${normalized} Agent ID check: balance=${balance}, eligible=${isEligible}`
    );

    return {
      isEligible,
      walletAddress: normalized,
      balance,
      registryAddress: BINANCE_AGENT_ID_REGISTRY_ADDRESS,
      checkedAt: Date.now(),
      message: isEligible
        ? 'Verified Binance Agent ID holder on BNB Smart Chain.'
        : 'Wallet does not hold a claimed Binance Agent ID (.ai) in the official registry.'
    };
  } catch (error: any) {
    console.error('Error querying Binance Agent ID registry contract:', error);
    // If query failed but was previously verified, preserve verified state
    if (existing && existing.verified) {
      return {
        isEligible: true,
        walletAddress: normalized,
        balance: 1,
        registryAddress: BINANCE_AGENT_ID_REGISTRY_ADDRESS,
        checkedAt: existing.checked_at,
        message: 'Verified Binance Agent ID holder (cached).'
      };
    }

    return {
      isEligible: false,
      walletAddress: normalized,
      balance: 0,
      registryAddress: BINANCE_AGENT_ID_REGISTRY_ADDRESS,
      checkedAt: Date.now(),
      message: `Failed to query Agent ID registry: ${error.message || 'RPC Error'}`
    };
  }
}
