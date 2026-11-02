import React from 'react';

/**
 * Official vector brand assets for Web3 wallets and BNB Chain ecosystem.
 */

export const BinanceLogoSvg: React.FC<{ className?: string; size?: number }> = ({ className = "h-5 w-5", size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 126.61 126.61"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M38.72 52.16L63.31 27.57L87.89 52.16L101.44 38.61L63.31 0.48L25.17 38.61L38.72 52.16Z" fill="#F0B90B" />
    <path d="M0.48 63.31L14.03 49.76L27.58 63.31L14.03 76.86L0.48 63.31Z" fill="#F0B90B" />
    <path d="M38.72 74.45L63.31 99.04L87.89 74.45L101.44 88.01L63.31 126.13L25.17 88.01L38.72 74.45Z" fill="#F0B90B" />
    <path d="M99.03 63.31L112.58 49.76L126.13 63.31L112.58 76.86L99.03 63.31Z" fill="#F0B90B" />
    <path d="M49.88 63.31L63.31 49.88L76.73 63.31L63.31 76.73L49.88 63.31Z" fill="#F0B90B" />
  </svg>
);

export const MetaMaskLogoSvg: React.FC<{ className?: string; size?: number }> = ({ className = "h-5 w-5", size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 318.6 318.6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon fill="#E17726" points="274.1,35.5 174.6,109.4 193,65.8" />
    <polygon fill="#E27625" points="44.4,35.5 143.1,110.1 125.6,65.8" />
    <polygon fill="#E27625" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7" />
    <polygon fill="#E27625" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8" />
    <polygon fill="#E27625" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1" />
    <polygon fill="#E27625" points="214.9,138.2 175.9,103.4 174.6,164.6 230.8,162.1" />
    <polygon fill="#D5BFB2" points="106.8,247.4 140.6,230.9 111.4,208.1" />
    <polygon fill="#D5BFB2" points="177.9,230.9 211.8,247.4 207.1,208.1" />
    <polygon fill="#233447" points="106.8,247.4 140.6,230.9 137.8,266.7" />
    <polygon fill="#233447" points="177.9,230.9 211.8,247.4 180.8,266.7" />
    <polygon fill="#CC6228" points="211.8,247.4 177.9,230.9 180.8,266.7 180.5,279.4 249.3,289.4 268.5,263" />
    <polygon fill="#CC6228" points="106.8,247.4 69.1,263 88.3,289.4 157.1,279.4 156.8,266.7 140.6,230.9" />
    <polygon fill="#E27525" points="180.8,266.7 177.9,230.9 140.6,230.9 137.8,266.7 156.8,266.7 157.1,279.4 180.5,279.4" />
    <polygon fill="#F5841F" points="274.1,35.5 193,65.8 214.9,138.2 284.8,207.7 304.8,147.3" />
    <polygon fill="#F5841F" points="13.8,147.3 33.9,207.7 103.6,138.2 125.6,65.8 44.4,35.5" />
    <polygon fill="#F5841F" points="144.1,164.6 87.8,162.1 80.3,206.8 111.4,208.1 140.6,230.9 177.9,230.9 207.1,208.1 238.3,206.8 230.8,162.1 174.6,164.6 173.3,197.8 145.4,197.8" />
  </svg>
);

export const TrustWalletLogoSvg: React.FC<{ className?: string; size?: number }> = ({ className = "h-5 w-5", size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 3L5 7.4V15.1C5 22.3 9.7 29 16 30C22.3 29 27 22.3 27 15.1V7.4L16 3Z" fill="#0500FF" />
    <path d="M16 5.5L7 9.1V15.4C7 21.3 10.9 26.8 16 27.6C21.1 26.8 25 21.3 25 15.4V9.1L16 5.5Z" fill="#0500FF" />
    <path d="M16 3V27.6C21.1 26.8 25 21.3 25 15.4V9.1L16 3Z" fill="#3375BB" />
  </svg>
);

export const OKXLogoSvg: React.FC<{ className?: string; size?: number }> = ({ className = "h-5 w-5", size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 32 32"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="9" height="9" x="3" y="3" rx="1.5" fill="#FFFFFF" />
    <rect width="9" height="9" x="20" y="3" rx="1.5" fill="#FFFFFF" />
    <rect width="9" height="9" x="11.5" y="11.5" rx="1.5" fill="#FFFFFF" />
    <rect width="9" height="9" x="3" y="20" rx="1.5" fill="#FFFFFF" />
    <rect width="9" height="9" x="20" y="20" rx="1.5" fill="#FFFFFF" />
  </svg>
);

export const CoinbaseLogoSvg: React.FC<{ className?: string; size?: number }> = ({ className = "h-5 w-5", size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="16" cy="16" r="14" fill="#0052FF" />
    <rect x="11" y="11" width="10" height="10" rx="2" fill="#FFFFFF" />
    <rect x="13.5" y="13.5" width="5" height="5" rx="1" fill="#0052FF" />
  </svg>
);

export const Web3GenericLogoSvg: React.FC<{ className?: string; size?: number }> = ({ className = "h-5 w-5", size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
