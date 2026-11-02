import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var originalFetch = window.fetch;
                  Object.defineProperty(window, 'fetch', {
                    get: function() { return originalFetch; },
                    set: function(val) { originalFetch = val; },
                    configurable: true,
                    enumerable: true
                  });
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#080b18] text-white antialiased selection:bg-cyan-500/30 selection:text-cyan-200 min-h-screen flex flex-col"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
