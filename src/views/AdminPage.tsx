"use client";

import React from "react";

export function AdminPage({ navigate }: { navigate: (route: string) => void }) {
  return <section className="min-h-screen bg-[#080b18] px-6 py-24 text-white"><p className="text-xs tracking-[.2em] text-cyan-300">CONTROL ROOM</p><h1 className="mt-4 text-4xl font-black">Admin dashboard</h1><p className="mt-4 max-w-xl text-slate-400">Admin controls are available after role-based wallet authentication and contract configuration.</p><button className="mt-8 rounded border border-cyan-400/40 px-4 py-3 text-sm text-cyan-300" onClick={() => navigate("/")}>Back home</button></section>;
}
