import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PIXEL BOYZ — Decentralized NFT Universe',
  description: '10,000 unique characters. One decentralized universe on BNB Smart Chain. Mint, explore, trade, forge, and earn rewards.',
  openGraph: {
    title: 'PIXEL BOYZ — Decentralized NFT Universe',
    description: '10,000 unique characters. One decentralized universe on BNB Smart Chain. Mint, explore, trade, forge, and earn rewards.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PIXEL BOYZ — Decentralized NFT Universe',
    description: '10,000 unique characters. One decentralized universe on BNB Smart Chain. Mint, explore, trade, forge, and earn rewards.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head />
      <body
        suppressHydrationWarning
        className="bg-[#080b18] text-white antialiased selection:bg-cyan-500/30 selection:text-cyan-200 min-h-screen flex flex-col"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
