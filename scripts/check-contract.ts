import { createPublicClient, http, fallback, formatEther } from 'viem';
import { bsc } from 'viem/chains';

const rpcUrls = [
  'https://bsc-dataseed.binance.org/',
  'https://bsc-dataseed1.defibit.io/',
  'https://bsc-dataseed1.ninicoin.io/',
  'https://rpc.ankr.com/bsc'
];

const client = createPublicClient({
  chain: bsc,
  transport: fallback(rpcUrls.map(url => http(url)))
});

const contractAddress = '';

const abi = [
  { name: 'totalMinted', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'totalFreeMinted', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'totalPaidMinted', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'paidAllocation', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'freeAllocationRemaining', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'paidAllocationRemaining', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'remainingSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'mintPrice', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'freeSaleActive', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { name: 'paidSaleActive', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { name: 'freePhaseClosed', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
  { name: 'merkleRoot', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'bytes32' }] },
  { name: 'treasury', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] }
];

async function main() {
  console.log('Querying contract at:', contractAddress);
  for (const item of abi) {
    try {
      const res = await (client.readContract as any)({
        address: contractAddress,
        abi: [item],
        functionName: item.name
      });
      let formatted = res;
      if (typeof res === 'bigint') {
        if (item.name === 'mintPrice') {
          formatted = `${res.toString()} wei (${formatEther(res)} BNB)`;
        } else {
          formatted = res.toString();
        }
      }
      console.log(`${item.name}: ${formatted}`);
    } catch (err: any) {
      console.log(`${item.name} ERROR:`, err.message);
    }
  }
}

main().catch(console.error);
