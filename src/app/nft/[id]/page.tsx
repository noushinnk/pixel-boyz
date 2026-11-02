import Link from "next/link";
import { ConfigNotice, SiteShell, StatCard } from "@/components/site";

export const dynamic = "force-dynamic";

export default async function NftDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SiteShell active="Explore"><main className="mx-auto min-h-[750px] max-w-7xl px-5 pb-24 pt-40 lg:px-8"><Link href="/explore" className="text-sm text-cyan-300">← BACK TO COLLECTION</Link><div className="mt-8 grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div className="nft-detail-art"><span>PB</span><small>#{id.padStart(4, "0")}</small></div><div><div className="eyebrow">PIXEL BOYZ / TOKEN {id}</div><h1 className="mt-4 font-display text-5xl font-black uppercase">Pixel Boy #{id}</h1><p className="mt-5 text-lg leading-8 text-slate-400">Ownership, traits, history, and actions are read from the NFT contract and indexer when configured.</p><div className="mt-8 grid gap-4 sm:grid-cols-3"><StatCard label="LEVEL" value="—" detail="CONTRACT READ" /><StatCard label="OWNER" value="—" detail="CONTRACT READ" /><StatCard label="LISTING" value="—" detail="MARKETPLACE READ" /></div><div className="mt-8"><ConfigNotice title="NFT data is not connected" /></div></div></div></main></SiteShell>;
}
