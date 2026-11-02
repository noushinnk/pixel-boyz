"use client";

import { useRouter } from 'next/navigation';
import { RewardsPage } from '@/views/RewardsPage';

export default function RewardsRoute() {
  const router = useRouter();
  return <RewardsPage navigate={(path) => router.push(path)} />;
}
