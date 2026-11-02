import { PixelBoyNFT, Quest, ActivityEvent, Archetype, RarityTier } from '../types/nft';

export const ARCHETYPES: { name: Archetype; desc: string; color: string; count: number }[] = [
  { name: 'Cyborg', desc: 'Synthetic humanoids augmented with neural processors.', color: '#22d3ee', count: 2400 },
  { name: 'Neon Ronin', desc: 'Master blade-dancers navigating the neon undercity.', color: '#a855f7', count: 1800 },
  { name: 'Quantum Hacker', desc: 'Code-weavers penetrating high-level decentralized firewalls.', color: '#34d399', count: 1600 },
  { name: 'Shadow Operative', desc: 'Stealth infiltrators cloaked in optical distortion fields.', color: '#f43f5e', count: 1400 },
  { name: 'Astro Pilot', desc: 'Deep-space navigators tethered to the orbital grid.', color: '#38bdf8', count: 1100 },
  { name: 'Glitch Nomad', desc: 'Rebels existing in fragmented pocket dimensions.', color: '#fbbf24', count: 900 },
  { name: 'Synth Priest', desc: 'Keepers of the ancient genesis block liturgy.', color: '#c084fc', count: 550 },
  { name: 'Holo Brawler', desc: 'Arena gladiators equipped with hard-light kinetic fists.', color: '#f97316', count: 250 }
];

export const TRAIT_OPTIONS = {
  headgears: ['Red Cap', 'Pilot Cap', 'Orange Straw Hat', 'Officer Hat', 'Cyber Visor', 'Tactical Beanie', 'None'],
  visors: ['Standard Eyes', 'Cyan Mono-Eye', 'Neon Crimson Lens', 'Glitch Visor', 'Scanlines'],
  armors: ['Grey Street Jacket', 'Blue Pilot Trench', 'Purple Bomber', 'Green Cyber Parka', 'Gold Exosuit'],
  weapons: ['Plasma Katana', 'Binary Blaster', 'Nano Dagger', 'Quantum Disruptor', 'Pulse Cannon'],
  cores: ['Overclocked Arc Core', 'Void Singularity', 'Biotronic Heart', 'Zero-Point Battery'],
  backgrounds: ['Neo Tokyo Midnight', 'Cyberspace Void', 'Emerald Sector', 'Magenta Rift', 'Clean Cyber']
};

export const INITIAL_NFTS: PixelBoyNFT[] = [
  {
    id: 1,
    tokenId: 'PB-0001',
    name: 'Pixel Boy #0001 (Genesis)',
    image: '/assets/aistudio/pixil-frame-0__5__45747249.png',
    level: 3,
    rarity: 'Mythic',
    rarityScore: 99.2,
    owner: '0x8894e0a0c962cb723c1976a4421c95949be2d4e3',
    creator: '0x0000000000000000000000000000000000000000',
    mintedAt: 1730000000,
    mintTxHash: '0x9a4f7832bc112a9c33441ef660a9f39459345bc8039da5e623fa77491d904b71',
    traits: {
      archetype: 'Neon Ronin',
      headgear: 'Red Cap',
      visor: 'Standard Eyes',
      armor: 'Grey Street Jacket',
      weapon: 'Plasma Katana',
      core: 'Overclocked Arc Core',
      background: 'Clean Cyber',
      skinTone: '#9a5c37'
    },
    isListed: false,
    price: null,
    seller: null,
    highestOffer: null,
    history: [
      { id: 'h1', type: 'mint', from: '0x0000000000000000000000000000000000000000', to: '0x8894e0a0c962cb723c1976a4421c95949be2d4e3', timestamp: 1730000000, txHash: '0x9a4f7832bc112a9c33441ef660a9f39459345bc8039da5e623fa77491d904b71' }
    ],
    xp: 350
  },
  {
    id: 17,
    tokenId: 'PB-0017',
    name: 'Pixel Boy #0017 (First Badge)',
    image: '/assets/aistudio/17_01ef732d.png',
    level: 2,
    rarity: 'Legendary',
    rarityScore: 94.6,
    owner: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
    creator: '0x0000000000000000000000000000000000000000',
    mintedAt: 1730020000,
    mintTxHash: '0x17173344556677889900aabbccddeeff00112233445566778899aabbccddeeff',
    traits: {
      archetype: 'Quantum Hacker',
      headgear: 'Two-Tone Cap',
      visor: 'Crimson Glow Eyes',
      armor: 'Blue Pilot Trench',
      weapon: 'Binary Blaster',
      core: 'Void Singularity',
      background: 'Magenta Rift',
      skinTone: '#d97706'
    },
    isListed: true,
    price: '0.025',
    seller: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
    highestOffer: { bidder: '0x8894e0a0c962cb723c1976a4421c95949be2d4e3', amount: '0.020', timestamp: 1730025000 },
    history: [
      { id: 'h2', type: 'mint', from: '0x0000000000000000000000000000000000000000', to: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be', timestamp: 1730020000, txHash: '0x17173344556677889900aabbccddeeff00112233445566778899aabbccddeeff' }
    ],
    xp: 220
  },
  {
    id: 18,
    tokenId: 'PB-0018',
    name: 'Pixel Boy #0018 (Captain)',
    image: '/assets/aistudio/18_6d72f8ce.png',
    level: 2,
    rarity: 'Epic',
    rarityScore: 88.5,
    owner: '0xd551234ae421e3bcba99a0da6d736074996512e6',
    creator: '0x0000000000000000000000000000000000000000',
    mintedAt: 1730030000,
    mintTxHash: '0x1818556677889900aabbccddeeff00112233445566778899aabbccddeeff0011',
    traits: {
      archetype: 'Astro Pilot',
      headgear: 'Captain Visor Cap',
      visor: 'Ruby Scanner',
      armor: 'Navy Flight Coat',
      weapon: 'Quantum Disruptor',
      core: 'Biotronic Heart',
      background: 'Magenta Rift',
      skinTone: '#b45309'
    },
    isListed: true,
    price: '0.045',
    seller: '0xd551234ae421e3bcba99a0da6d736074996512e6',
    highestOffer: { bidder: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be', amount: '0.035', timestamp: 1730035000 },
    history: [
      { id: 'h3', type: 'mint', from: '0x0000000000000000000000000000000000000000', to: '0xd551234ae421e3bcba99a0da6d736074996512e6', timestamp: 1730030000, txHash: '0x1818556677889900aabbccddeeff00112233445566778899aabbccddeeff0011' }
    ],
    xp: 180
  },
  {
    id: 26,
    tokenId: 'PB-0026',
    name: 'Pixel Boy #0026 (Nomad)',
    image: '/assets/aistudio/26_95acd707.png',
    level: 1,
    rarity: 'Rare',
    rarityScore: 78.2,
    owner: '0x564286362092d8e7936f0549571a803b203aacea',
    creator: '0x0000000000000000000000000000000000000000',
    mintedAt: 1730040000,
    mintTxHash: '0x26266677889900aabbccddeeff00112233445566778899aabbccddeeff001122',
    traits: {
      archetype: 'Glitch Nomad',
      headgear: 'Orange Straw Hat',
      visor: 'Red Visor Bar',
      armor: 'Magenta Cyber Kimono',
      weapon: 'Nano Dagger',
      core: 'Zero-Point Battery',
      background: 'Emerald Sector',
      skinTone: '#3b82f6'
    },
    isListed: false,
    price: null,
    seller: null,
    highestOffer: null,
    history: [
      { id: 'h4', type: 'mint', from: '0x0000000000000000000000000000000000000000', to: '0x564286362092d8e7936f0549571a803b203aacea', timestamp: 1730040000, txHash: '0x26266677889900aabbccddeeff00112233445566778899aabbccddeeff001122' }
    ],
    xp: 120
  },
  {
    id: 35,
    tokenId: 'PB-0035',
    name: 'Pixel Boy #0035 (Pro)',
    image: '/assets/aistudio/35_3bc87fd1.png',
    level: 2,
    rarity: 'Epic',
    rarityScore: 86.4,
    owner: '0x8894e0a0c962cb723c1976a4421c95949be2d4e3',
    creator: '0x0000000000000000000000000000000000000000',
    mintedAt: 1730050000,
    mintTxHash: '0x353577889900aabbccddeeff00112233445566778899aabbccddeeff00112233',
    traits: {
      archetype: 'Cyborg',
      headgear: 'Orange Straw Hat',
      visor: 'Gold HUD Bar',
      armor: 'Cobalt Street Coat',
      weapon: 'Plasma Katana',
      core: 'Overclocked Arc Core',
      background: 'Clean Cyber',
      skinTone: '#eab308'
    },
    isListed: true,
    price: '0.080',
    seller: '0x8894e0a0c962cb723c1976a4421c95949be2d4e3',
    highestOffer: { bidder: '0xd551234ae421e3bcba99a0da6d736074996512e6', amount: '0.065', timestamp: 1730055000 },
    history: [
      { id: 'h5', type: 'mint', from: '0x0000000000000000000000000000000000000000', to: '0x8894e0a0c962cb723c1976a4421c95949be2d4e3', timestamp: 1730050000, txHash: '0x353577889900aabbccddeeff00112233445566778899aabbccddeeff00112233' }
    ],
    xp: 210
  },
  {
    id: 56,
    tokenId: 'PB-0056',
    name: 'Pixel Boy #0056 (Operative)',
    image: '/assets/aistudio/56_1643a0f0.png',
    level: 1,
    rarity: 'Rare',
    rarityScore: 76.8,
    owner: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be',
    creator: '0x0000000000000000000000000000000000000000',
    mintedAt: 1730060000,
    mintTxHash: '0x5656889900aabbccddeeff00112233445566778899aabbccddeeff0011223344',
    traits: {
      archetype: 'Shadow Operative',
      headgear: 'Green Cyber Cap',
      visor: 'Red Cyber Lens',
      armor: 'Emerald Street Parka',
      weapon: 'Binary Blaster',
      core: 'Biotronic Heart',
      background: 'Clean Cyber',
      skinTone: '#ef4444'
    },
    isListed: false,
    price: null,
    seller: null,
    highestOffer: null,
    history: [
      { id: 'h6', type: 'mint', from: '0x0000000000000000000000000000000000000000', to: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be', timestamp: 1730060000, txHash: '0x5656889900aabbccddeeff00112233445566778899aabbccddeeff0011223344' }
    ],
    xp: 130
  },
  {
    id: 57,
    tokenId: 'PB-0057',
    name: 'Pixel Boy #0057 (Synth)',
    image: '/assets/aistudio/57_66af4ba5.png',
    level: 2,
    rarity: 'Epic',
    rarityScore: 89.1,
    owner: '0xd551234ae421e3bcba99a0da6d736074996512e6',
    creator: '0x0000000000000000000000000000000000000000',
    mintedAt: 1730070000,
    mintTxHash: '0x57579900aabbccddeeff00112233445566778899aabbccddeeff001122334455',
    traits: {
      archetype: 'Synth Priest',
      headgear: 'Yellow Visor Cap',
      visor: 'Electric Blue Sensor',
      armor: 'Violet Cyber Jacket',
      weapon: 'Pulse Cannon',
      core: 'Void Singularity',
      background: 'Clean Cyber',
      skinTone: '#e11d48'
    },
    isListed: false,
    price: null,
    seller: null,
    highestOffer: null,
    history: [
      { id: 'h7', type: 'mint', from: '0x0000000000000000000000000000000000000000', to: '0xd551234ae421e3bcba99a0da6d736074996512e6', timestamp: 1730070000, txHash: '0x57579900aabbccddeeff00112233445566778899aabbccddeeff001122334455' }
    ],
    xp: 195
  },
  {
    id: 1005,
    tokenId: 'PB-1005',
    name: 'Pixel Boy #1005 (Centurion)',
    image: '/assets/aistudio/1005_8f11a7d5.png',
    level: 3,
    rarity: 'Legendary',
    rarityScore: 95.8,
    owner: '0x8894e0a0c962cb723c1976a4421c95949be2d4e3',
    creator: '0x0000000000000000000000000000000000000000',
    mintedAt: 1730080000,
    mintTxHash: '0x1005aa00aabbccddeeff00112233445566778899aabbccddeeff001122334455',
    traits: {
      archetype: 'Holo Brawler',
      headgear: 'Navy Cyber Cap',
      visor: 'Cyber Yellow Eye Visor',
      armor: 'Cobalt Mech Plate',
      weapon: 'Plasma Katana',
      core: 'Overclocked Arc Core',
      background: 'Magenta Rift',
      skinTone: '#9333ea'
    },
    isListed: false,
    price: null,
    seller: null,
    highestOffer: null,
    history: [
      { id: 'h8', type: 'mint', from: '0x0000000000000000000000000000000000000000', to: '0x8894e0a0c962cb723c1976a4421c95949be2d4e3', timestamp: 1730080000, txHash: '0x1005aa00aabbccddeeff00112233445566778899aabbccddeeff001122334455' }
    ],
    xp: 290
  }
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Neural Link Integration',
    description: 'Connect your Web3 or Binance Agentic Wallet to the BNB Smart Chain network.',
    category: 'Onboarding',
    xpReward: 50,
    progress: 1,
    maxProgress: 1,
    isCompleted: true,
    isClaimed: true,
    actionRoute: '/profile',
    actionLabel: 'Check Wallet'
  },
  {
    id: 'q2',
    title: 'First Awakening',
    description: 'Mint your first Pixel Boy character from either the Free Agentic pool or Public mint.',
    category: 'Onboarding',
    xpReward: 100,
    progress: 0,
    maxProgress: 1,
    isCompleted: false,
    isClaimed: false,
    actionRoute: '/mint',
    actionLabel: 'Mint Character'
  },
  {
    id: 'q3',
    title: 'Squad Builder',
    description: 'Hold at least 3 unique Pixel Boy characters in your connected wallet inventory.',
    category: 'Collector',
    xpReward: 150,
    progress: 0,
    maxProgress: 3,
    isCompleted: false,
    isClaimed: false,
    actionRoute: '/explore',
    actionLabel: 'Collect More'
  },
  {
    id: 'q4',
    title: 'Market Operative',
    description: 'List any Pixel Boy character for sale on the decentralized marketplace.',
    category: 'Market',
    xpReward: 75,
    progress: 0,
    maxProgress: 1,
    isCompleted: false,
    isClaimed: false,
    actionRoute: '/profile',
    actionLabel: 'List from Inventory'
  },
  {
    id: 'q5',
    title: 'Quantum Synthesis',
    description: 'Evolve a character by burning a catalyst operative in the Cyber Forge.',
    category: 'Evolution',
    xpReward: 300,
    progress: 0,
    maxProgress: 1,
    isCompleted: false,
    isClaimed: false,
    actionRoute: '/forge',
    actionLabel: 'Enter Forge'
  },
  {
    id: 'q6',
    title: 'Marketplace Patron',
    description: 'Successfully acquire a Pixel Boy character listed on the marketplace.',
    category: 'Market',
    xpReward: 200,
    progress: 0,
    maxProgress: 1,
    isCompleted: false,
    isClaimed: false,
    actionRoute: '/marketplace',
    actionLabel: 'Browse Market'
  }
];

// Clean activity feed that populates exclusively with real-time user and contract transactions
export const INITIAL_ACTIVITY: ActivityEvent[] = [];
