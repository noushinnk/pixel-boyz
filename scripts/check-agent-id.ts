import { createPublicClient, http, fallback } from 'viem';
import { bsc } from 'viem/chains';

const rpcUrls = [
  'https://bsc-dataseed.binance.org/',
  'https://bsc-dataseed1.defibit.io/',
  'https://bsc-dataseed1.ninicoin.io/'
];

const client = createPublicClient({
  chain: bsc,
  transport: fallback(rpcUrls.map(url => http(url)))
});

const registryAddr = '0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F';

async function main() {
  const testWallet = '0x2d36622575A76913b4d5521DA47e259C0579deEb'; // admin address from deployment
  const balance = await (client.readContract as any)({
    address: registryAddr,
    abi: [{ name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] }],
    functionName: 'balanceOf',
    args: [testWallet]
  }).catch((e: any) => e.message);

  console.log(`Balance of ${testWallet}:`, balance?.toString?.() || balance);
}

main().catch(console.error);
