"use client";

import { useRouter } from 'next/navigation';
import { MintPage } from '@/views/MintPage';

export default function MintRoute() {
  const router = useRouter();
  return <MintPage navigate={(path) => router.push(path)} />;
}
