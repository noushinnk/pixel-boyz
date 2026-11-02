"use client";

import React from "react";

export function ProfilePage({ navigate }: { navigate: (route: string) => void }) {
  return <section className="min-h-screen bg-[#080b18] px-6 py-24 text-white"><p className="text-xs tracking-[.2em] text-cyan-300">YOUR IDENTITY</p><h1 className="mt-4 text-4xl font-black">Own your story</h1><p className="mt-4 max-w-xl text-slate-400">Connect a wallet to load verified ownership, listings, XP, reward claims, and activity.</p><button className="mt-8 rounded border border-cyan-400/40 px-4 py-3 text-sm text-cyan-300" onClick={() => navigate("/explore")}>Explore collection</button></section>;
}
