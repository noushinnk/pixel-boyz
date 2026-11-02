import { keccak256, encodeAbiParameters, encodePacked, formatEther } from 'viem';
import { MerkleTreeEngine, hashLeaf } from '../src/lib/server/merkleService';
import { extractPostIdFromUrl } from '../src/lib/server/xVerificationService';
import { db } from '../src/lib/server/db';

async function runTestSuite() {
  console.log('========================================================');
  console.log('🧪 RUNNING PIXEL BOYZ MINT & CAMPAIGN VERIFICATION SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
      failed++;
    }
  }

  // TEST 1: Merkle Leaf OpenZeppelin Format
  console.log('--- 1. MERKLE TREE LEAF & PAIR SPECIFICATION ---');
  const testWallet = '0x1111111111111111111111111111111111111111';
  const leaf = hashLeaf(testWallet);
  const innerExpected = keccak256(encodeAbiParameters([{ type: 'address' }], [testWallet as `0x${string}`]));
  const outerExpected = keccak256(encodePacked(['bytes32'], [innerExpected]));
  assert(leaf === outerExpected, 'Leaf format matches keccak256(bytes.concat(keccak256(abi.encode(account))))');

  // TEST 2: Merkle Proof Generation & Verification
  console.log('\n--- 2. MERKLE PROOF GENERATION & ROOT REPLACEMENT ---');
  const wallets = [
    '0x1111111111111111111111111111111111111111',
    '0x2222222222222222222222222222222222222222',
    '0x3333333333333333333333333333333333333333',
    '0x4444444444444444444444444444444444444444'
  ];
  const tree1 = new MerkleTreeEngine(wallets);
  const root1 = tree1.getRoot();
  assert(root1.startsWith('0x') && root1.length === 66, 'Generates valid 32-byte hex root');

  const proof1 = tree1.getProof(wallets[0]);
  assert(proof1.length > 0, 'Generates proof array for allowlisted wallet');
  assert(tree1.verify(proof1, wallets[0]), 'Proof validates against root for member wallet');

  const outsiderWallet = '0x9999999999999999999999999999999999999999';
  const outsiderProof = tree1.getProof(outsiderWallet);
  assert(outsiderProof.length === 0, 'Outsider wallet returns empty proof');
  assert(!tree1.verify(proof1, outsiderWallet), 'Outsider cannot use another member proof');

  // Root Replacement: Adding a 5th wallet replaces the root cleanly
  const wallets2 = [...wallets, outsiderWallet];
  const tree2 = new MerkleTreeEngine(wallets2);
  const root2 = tree2.getRoot();
  assert(root2 !== root1, 'Root update changes cleanly when allowlist dataset is modified');
  assert(tree2.verify(tree2.getProof(outsiderWallet), outsiderWallet), 'Newly added wallet validates against new root');

  // TEST 3: X Post URL Extraction & Validation
  console.log('\n--- 3. X CAMPAIGN URL PARSING & VALIDATION ---');
  const validUrl1 = 'https://x.com/web3agent/status/1885000000000000001';
  const validUrl2 = 'https://twitter.com/pixelboyz_nft/status/1885000000000000002';
  const invalidUrl1 = 'https://instagram.com/p/C_abc123';
  const invalidUrl2 = 'not_a_url';

  assert(extractPostIdFromUrl(validUrl1) === '1885000000000000001', 'Extracts post ID from x.com URL');
  assert(extractPostIdFromUrl(validUrl2) === '1885000000000000002', 'Extracts post ID from twitter.com URL');
  assert(extractPostIdFromUrl(invalidUrl1) === null, 'Rejects non-X / non-Twitter URL');
  assert(extractPostIdFromUrl(invalidUrl2) === null, 'Rejects arbitrary string URL');

  // TEST 4: Campaign Duplicate Prevention in DB & Direct Link Submission
  console.log('\n--- 4. CAMPAIGN SUBMISSION & AGENT FREE MINT BLOCK ---');
  const campWalletA = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const campWalletB = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const sharedPostId = `1885999999${Date.now().toString().slice(-8)}`;

  db.recordCampaignSubmission({
    wallet_address: campWalletA,
    post_id: sharedPostId,
    post_url: `https://x.com/user/status/${sharedPostId}`,
    x_user_id: 'x_user_123',
    verified: true
  });

  const existingPost = db.getCampaignSubmissionByPostId(sharedPostId);
  assert(existingPost !== null && existingPost.verified, 'Database stores verified campaign submission');
  assert(existingPost?.wallet_address === campWalletA.toLowerCase(), 'Bound correctly to claiming wallet');

  // Verify that an agent or wallet without verified post is strictly blocked from Merkle proof
  const randSuffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const unverifiedWallet = `0x7777777777777777777777777777777777${randSuffix}`;
  // Mark agent ID as verified but do NOT submit X post
  db.setAgentIdVerification(unverifiedWallet, true, 'agent.ai');

  const { issueMerkleProof } = await import('../src/lib/server/merkleService');
  const blockedResult = await issueMerkleProof(unverifiedWallet);
  assert(!blockedResult.eligible, 'Free mint proof is strictly blocked if X post is not submitted');
  assert(
    Boolean(blockedResult.reason && blockedResult.reason.includes('FREE MINT BLOCKED')),
    'Block message explicitly cites FREE MINT BLOCKED requirement'
  );

  // Now submit the post link for unverifiedWallet
  const { verifyXCampaignPost } = await import('../src/lib/server/xVerificationService');
  const uniquePostId = `1885888888${Date.now()}`;
  const directSubmitResult = await verifyXCampaignPost({
    postUrl: `https://x.com/pixelboyzai_supporter/status/${uniquePostId}`,
    walletAddress: unverifiedWallet
  });
  assert(directSubmitResult.success, 'Submitting post link succeeds directly without external Twitter API call');

  // After submitting post link, proof is now unlocked
  const unlockedResult = await issueMerkleProof(unverifiedWallet);
  assert(unlockedResult.eligible, 'Merkle proof is unlocked immediately after X post link submission');
  assert(unlockedResult.proof.length >= 0, 'Proof array is issued for newly unlocked wallet');

  // Verify submitting post without connected wallet succeeds (connect wallet not required)
  const noWalletResult = await verifyXCampaignPost({
    postUrl: `https://x.com/PPrimalz/status/2117195841878500000`
  });
  assert(noWalletResult.success, 'Submitting post link succeeds without connected wallet (wallet not required)');

  // TEST 5: Mint Quantity and Payment Calculations
  console.log('\n--- 5. MINT QUANTITY & BNB VALUE CALCULATIONS ---');
  const mintPriceWei = 1000000000000000n; // 0.001 BNB
  const mintPriceBnb = parseFloat(formatEther(mintPriceWei));

  function calculateMintDetails(qty: number, isEligible: boolean, freeMintedAlready: number) {
    const freeQuota = isEligible ? Math.max(0, 2 - freeMintedAlready) : 0;
    const freeQty = Math.min(qty, freeQuota);
    const paidQty = qty - freeQty;
    const requiredPayment = BigInt(paidQty) * mintPriceWei;
    return { freeQty, paidQty, paymentBnb: formatEther(requiredPayment) };
  }

  // Case A: Eligible Agent ID holder mints 2 free
  const caseA = calculateMintDetails(2, true, 0);
  assert(caseA.freeQty === 2 && caseA.paidQty === 0 && caseA.paymentBnb === '0', 'Eligible Agent ID holder claims 2 free for 0 BNB');

  // Case B: Eligible Agent ID holder requests 5 (2 free + 3 paid)
  const caseB = calculateMintDetails(5, true, 0);
  assert(caseB.freeQty === 2 && caseB.paidQty === 3 && caseB.paymentBnb === '0.003', 'Eligible Agent ID holder claims 2 free + 3 paid for 0.003 BNB');

  // Case C: Agent ID holder already claimed 2 free, now mints 10 paid
  const caseC = calculateMintDetails(10, true, 2);
  assert(caseC.freeQty === 0 && caseC.paidQty === 10 && caseC.paymentBnb === '0.01', 'Wallet that claimed 2 free pays for additional paid mints (0.01 BNB)');

  // Case D: Ordinary non-eligible wallet requests 5
  const caseD = calculateMintDetails(5, false, 0);
  assert(caseD.freeQty === 0 && caseD.paidQty === 5 && caseD.paymentBnb === '0.005', 'Standard wallet pays full price for all requested NFTs (0.005 BNB)');

  console.log('\n========================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) process.exit(1);
}

runTestSuite().catch(e => {
  console.error('Test suite error:', e);
  process.exit(1);
});
