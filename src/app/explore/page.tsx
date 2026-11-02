"use client";

import { useRouter } from 'next/navigation';
import { ExplorePage } from '@/views/ExplorePage';

export default function ExploreRoute() {
  const router = useRouter();
  return <ExplorePage navigate={(path) => router.push(path)} />;
}
