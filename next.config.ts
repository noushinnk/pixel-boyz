import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Allow AI Studio preview and cloud environment origins
  allowedDevOrigins: [
    'ais-dev-tsy2b6dhl7a2evjdcsei24-469479454204.asia-southeast1.run.app',
    'ais-pre-tsy2b6dhl7a2evjdcsei24-469479454204.asia-southeast1.run.app',
    '*.run.app',
    '*.google.com',
    'localhost:3000',
    'localhost:8080',
    '127.0.0.1:3000',
    '127.0.0.1:8080',
  ],
};

export default nextConfig;
