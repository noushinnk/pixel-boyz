"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = ["Mint", "Explore", "Marketplace", "Forge", "Rewards", "Quests", "Activity"];
const stats = [
  ["TOTAL SUPPLY", "10,000"],
  ["MINTED", "—"],
  ["FLOOR PRICE", "—"],
  ["HOLDERS", "—"],
];
export const features = [
  { icon: "✦", title: "MINT", text: "Claim your place in the universe. Free allocation and public mint phases, powered by BSC." },
  { icon: "◈", title: "COLLECT", text: "Discover characters with rare traits, evolving levels, and a story still being written." },
  { icon: "⚡", title: "EVOLVE", text: "Forge your Pixel Boyz, earn XP, and unlock new ways to participate." },
];

export function SiteShell({ active = "Home", children }: { active?: string; children?: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen overflow-hidden bg-[#080b18] text-white">
      <header className="fixed top-0 z-30 w-full border-b border-white/10 bg-[#080b18]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">PB</span>
            <span className="font-display text-sm font-bold tracking-[0.22em]">PIXEL BOYZ</span>
          </Link>
          <nav className="hidden items-center gap-5 lg:gap-7 md:flex">
            {["Home", ...navItems].map((item) => (
              <Link key={item} href={item === "Home" ? "/" : `/${item.toLowerCase()}`} className={`nav-link ${active === item ? "text-white" : ""}`}>{item}</Link>
            ))}
          </nav>
          <button className="neon-button hidden md:block">CONNECT WALLET</button>
          <button aria-label="Toggle navigation" className="text-2xl md:hidden" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
        {menuOpen && <nav className="border-t border-white/10 bg-[#0b1022] px-5 py-5 md:hidden">
          {["Home", ...navItems].map((item) => <Link onClick={() => setMenuOpen(false)} key={item} href={item === "Home" ? "/" : `/${item.toLowerCase()}`} className="block border-b border-white/5 py-3 font-display text-sm tracking-widest">{item}</Link>)}
          <button className="neon-button mt-5 w-full">CONNECT WALLET</button>
        </nav>}
      </header>
      {children || <HomeContent />}
      <footer className="border-t border-white/10 px-5 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row">
          <div><div className="font-display font-bold tracking-[0.2em]">PIXEL BOYZ</div><p className="mt-2 text-sm text-slate-500">A decentralized universe on BNB Smart Chain.</p></div>
          <div className="flex gap-5 text-sm text-slate-500"><span>Discord</span><span>Twitter</span><span>Docs</span><span>© 2026</span></div>
        </div>
      </footer>
    </div>
  );
}

function HomeContent() {
  return <main>
    <section className="hero-grid relative min-h-[720px] pt-36">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div className="relative z-10">
          <div className="eyebrow"><span className="pulse-dot" /> THE PIXEL UNIVERSE IS LOADING</div>
          <h1 className="mt-6 max-w-3xl font-display text-6xl font-black uppercase leading-[.9] tracking-[-.05em] sm:text-8xl">10,000<br /><span className="gradient-text">unique</span><br />characters.</h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-400">One decentralized universe. Collect, evolve, and write your story on-chain.</p>
          <div className="mt-9 flex flex-wrap gap-4"><Link className="neon-button" href="/mint">MINT NOW <span>↗</span></Link><Link className="ghost-button" href="/explore">EXPLORE COLLECTION</Link></div>
          <div className="mt-12 flex gap-10 text-sm"><div><div className="font-display text-2xl font-bold">0.001 BNB</div><div className="mt-1 text-slate-500">MINT PRICE</div></div><div><div className="font-display text-2xl font-bold">ERC-721</div><div className="mt-1 text-slate-500">STANDARD</div></div></div>
        </div>
        <div className="hero-character relative mx-auto h-[430px] w-full max-w-[500px]">
          <div className="scanlines absolute inset-0 rounded-3xl" />
          <div className="pixel-sun">✦</div><div className="pixel-character"><div className="eye left" /><div className="eye right" /><div className="mouth" /><div className="jacket" /></div>
          <div className="absolute bottom-4 left-4 font-display text-xs tracking-[.25em] text-cyan-300">PB-0000 // ORIGIN</div>
          <div className="absolute right-4 top-4 rounded border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 font-mono text-[10px] text-cyan-200">LV. 01</div>
        </div>
      </div>
    </section>
    <section className="border-y border-white/10 bg-white/[.02]"><div className="mx-auto grid max-w-7xl grid-cols-2 px-5 py-9 md:grid-cols-4 lg:px-8">{stats.map(([label, value]) => <div key={label} className="stat-cell"><div className="font-display text-2xl font-bold sm:text-3xl">{value}</div><div className="mt-2 text-[10px] tracking-[.22em] text-slate-500">{label}</div></div>)}</div></section>
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><div className="mb-12 max-w-xl"><div className="eyebrow">THE ECOSYSTEM</div><h2 className="mt-4 font-display text-4xl font-bold uppercase sm:text-5xl">More than a<br /><span className="gradient-text">profile picture.</span></h2></div><div className="grid gap-5 md:grid-cols-3">{features.map((feature) => <div className="feature-card" key={feature.title}><div className="feature-icon">{feature.icon}</div><h3 className="mt-7 font-display text-xl font-bold tracking-widest">{feature.title}</h3><p className="mt-4 leading-7 text-slate-400">{feature.text}</p><span className="mt-8 block text-cyan-300">↗</span></div>)}</div></section>
    <section className="mx-auto max-w-7xl px-5 pb-28 lg:px-8"><div className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#101d3c] to-[#0d1023] p-8 sm:p-14"><div className="grid items-center gap-8 md:grid-cols-[1fr_auto]"><div><div className="eyebrow">READY PLAYER ONE</div><h2 className="mt-4 font-display text-4xl font-bold uppercase sm:text-5xl">Your character<br /><span className="gradient-text">is waiting.</span></h2></div><Link href="/mint" className="neon-button w-fit">ENTER THE UNIVERSE <span>↗</span></Link></div></div></section>
  </main>;
}

export function ModulePage({ title, kicker, description, active }: { title: string; kicker: string; description: string; active: string }) {
  return <SiteShell active={active}><main className="mx-auto min-h-[750px] max-w-7xl px-5 pb-24 pt-40 lg:px-8"><div className="eyebrow">{kicker}</div><h1 className="mt-5 max-w-3xl font-display text-5xl font-black uppercase sm:text-7xl">{title}</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">{description}</p><div className="mt-12 grid gap-5 md:grid-cols-3"><div className="feature-card md:col-span-2"><div className="flex items-center justify-between"><span className="font-display text-sm tracking-widest text-cyan-300">ON-CHAIN DATA</span><span className="status-pill">CONFIG REQUIRED</span></div><div className="mt-10 border-t border-white/10 pt-6 text-slate-400">Connect your wallet and configure deployed contract addresses to view live blockchain data.</div></div><div className="feature-card"><div className="feature-icon">◈</div><h3 className="mt-6 font-display text-lg font-bold tracking-widest">BUILT FOR BSC</h3><p className="mt-3 text-sm leading-6 text-slate-400">BNB Smart Chain · Chain ID 56</p></div></div></main></SiteShell>;
}

export function SectionHeading({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return <div className="max-w-2xl"><div className="eyebrow">{kicker}</div><h1 className="mt-4 font-display text-4xl font-black uppercase sm:text-6xl">{title}</h1>{text && <p className="mt-5 leading-8 text-slate-400">{text}</p>}</div>;
}

export function ConfigNotice({ title = "Live data is not connected" }: { title?: string }) {
  return <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/5 p-5"><div className="flex items-start gap-3"><span className="text-xl text-fuchsia-300">◎</span><div><h3 className="font-display text-sm font-bold tracking-widest text-fuchsia-200">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">Add deployed contract addresses, ABIs, and the configured data service to enable this action. Nothing here is simulated.</p></div></div></div>;
}

export function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="feature-card"><div className="text-[10px] tracking-[.2em] text-slate-500">{label}</div><div className="mt-4 font-display text-3xl font-bold">{value}</div><div className="mt-2 text-xs text-cyan-300">{detail}</div></div>;
}

export function ActionButton({ children, disabled = true }: { children: React.ReactNode; disabled?: boolean }) {
  return <button disabled={disabled} className="neon-button disabled:cursor-not-allowed disabled:opacity-45 disabled:grayscale">{children}</button>;
}
