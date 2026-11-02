# Pixel Boyz

Premium NFT ecosystem interface for BNB Smart Chain, built with Next.js App Router, TypeScript, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and provide deployed contract addresses, RPC configuration, Supabase credentials, and the Cloudflare Worker asset gateway URL. Empty addresses intentionally keep the UI in a safe `CONFIG REQUIRED` state; the app never invents blockchain data.

## Current implementation

- Branded responsive landing page with mint CTA, ecosystem sections, live-data placeholders, and mobile navigation.
- Routes for `/mint`, `/explore`, `/marketplace`, `/forge`, `/rewards`, and `/quests`.
- Shared visual system with pixel-art hero treatment, neon controls, responsive cards, and explicit on-chain configuration messaging.
- Environment contract for the four required contracts and public asset gateway.

## Production blockers

The supplied project directory did not contain NFT artwork, metadata, deployed contract addresses, contract ABIs, Supabase schema, or indexer code. Those are required before enabling live minting, ownership, marketplace transactions, forge operations, rewards, and activity indexing. Do not deploy or claim transactions are live until those dependencies are supplied and independently verified.

## Deployment

Deploy the Next.js app to a Node-compatible host such as Vercel after setting the production environment variables. Deploy the private R2 bucket behind a read-only Cloudflare Worker and keep all service-role credentials and private keys server-side.
