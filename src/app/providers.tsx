"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Web3Provider } from '@/context/Web3Context';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <Web3Provider>
      <div className="min-h-screen bg-[#080b18] text-white flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar currentRoute={pathname} navigate={navigate} />
        <main className="flex-1">
          {children}
        </main>
        <Footer navigate={navigate} />
      </div>
    </Web3Provider>
  );
}
