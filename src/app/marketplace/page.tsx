"use client";

import { useRouter } from 'next/navigation';
import { MarketplacePage } from '@/views/MarketplacePage';

export default function MarketplaceRoute() {
  const router = useRouter();
  return <MarketplacePage navigate={(path) => router.push(path)} />;
}
