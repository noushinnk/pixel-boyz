"use client";

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { NftDetailPage } from '@/views/NftDetailPage';

export default function NftRoute({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const tokenId = parseInt(unwrappedParams.id, 10);

  return (
    <NftDetailPage
      tokenId={isNaN(tokenId) ? 1 : tokenId}
      navigate={(path) => router.push(path)}
    />
  );
}
