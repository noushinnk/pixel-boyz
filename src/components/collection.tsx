"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConfigNotice } from "./site";

type Nft = { id: number; level: string; trait: string; color: string };
const previewNfts: Nft[] = [
  { id: 1, level: "LV. 01", trait: "ORIGIN", color: "from-cyan-400/30 to-indigo-950" },
  { id: 2, level: "LV. 01", trait: "UNKNOWN", color: "from-fuchsia-400/25 to-violet-950" },
  { id: 3, level: "LV. 02", trait: "EVOLVED", color: "from-blue-400/25 to-slate-950" },
  { id: 4, level: "LV. 01", trait: "ORIGIN", color: "from-purple-400/25 to-indigo-950" },
  { id: 5, level: "LV. 03", trait: "FORGED", color: "from-cyan-400/25 to-slate-950" },
  { id: 6, level: "LV. 01", trait: "UNKNOWN", color: "from-pink-400/20 to-slate-950" },
];

export function CollectionGallery() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const results = useMemo(() => previewNfts.filter((nft) => `${nft.id} ${nft.trait}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div><ConfigNotice title="Collection data is awaiting the asset gateway" /><div className="mt-8 flex flex-wrap gap-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="SEARCH TOKEN ID" className="input-control" /><button className={`view-button ${view === "grid" ? "selected" : ""}`} onClick={() => setView("grid")}>GRID</button><button className={`view-button ${view === "list" ? "selected" : ""}`} onClick={() => setView("list")}>LIST</button></div><div className={`mt-6 grid gap-4 ${view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>{results.map((nft) => <Link href={`/nft/${nft.id}`} className={`nft-card ${view === "list" ? "flex items-center gap-5" : ""}`} key={nft.id}><div className={`nft-art bg-gradient-to-br ${nft.color}`}><span className="nft-silhouette">PB</span><span className="nft-id">#{String(nft.id).padStart(4, "0")}</span></div><div className="flex flex-1 items-center justify-between p-4"><div><div className="font-display font-bold">{nft.trait}</div><div className="mt-1 text-xs text-slate-500">{nft.level} · METADATA PENDING</div></div><span className="text-cyan-300">↗</span></div></Link>)}</div>{results.length === 0 && <div className="empty-state mt-6">No token matches this search.</div>}</div>;
}
