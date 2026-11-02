"use client";

import { useRouter } from 'next/navigation';
import { LeaderboardPage } from '@/views/LeaderboardPage';

export default function LeaderboardRoute() {
  const router = useRouter();
  return <LeaderboardPage navigate={(path) => router.push(path)} />;
}
