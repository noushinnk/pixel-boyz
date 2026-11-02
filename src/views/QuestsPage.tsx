"use client";

import React from "react";

export function QuestsPage({ navigate }: { navigate: (route: string) => void }) {
  return <section className="min-h-screen bg-[#080b18] px-6 py-24 text-white"><p className="text-xs tracking-[.2em] text-fuchsia-300">LIVE MISSIONS</p><h1 className="mt-4 text-4xl font-black">Make your mark</h1><p className="mt-4 max-w-xl text-slate-400">Quest progress is awarded only after verified blockchain events are indexed.</p><button className="mt-8 rounded border border-fuchsia-400/40 px-4 py-3 text-sm text-fuchsia-300" onClick={() => navigate("/rewards")}>View rewards</button></section>;
}
